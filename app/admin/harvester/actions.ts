'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const existing = await prisma.song.findUnique({ where: { slug } });
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

function assertAdmin(session: any) {
  if (!session || !session.isAdmin) throw new Error('Unauthorized');
}

export interface ApproveResult {
  ok: boolean;
  duplicate?: boolean;
  duplicateReason?: string;
  existingTitle?: string;
  existingSlug?: string;
}

export async function approveCandidate(
  candidateId: string,
  overrides: {
    title: string;
    subtitle?: string;
    singerNames: string;
    releaseYear: string;
    youtubeId: string;
  },
  force = false,
): Promise<ApproveResult> {
  const session = await auth();
  assertAdmin(session);

  const candidate = await prisma.harvestCandidate.findUniqueOrThrow({
    where: { id: candidateId },
  });

  // Title defaults to the EXACT, full YouTube title; subtitle is the cleaned line.
  const title = overrides.title.trim() || candidate.rawTitle;
  const subtitle = (overrides.subtitle ?? candidate.cleanTitle).trim() || null;
  const releaseYear = overrides.releaseYear ? parseInt(overrides.releaseYear, 10) : candidate.releaseYear;
  const youtubeId = overrides.youtubeId.trim() || candidate.youtubeId;

  // ── Duplicate detection ──────────────────────────────────────────────
  // A YouTube video ID uniquely identifies a song. We deliberately do NOT
  // dedupe by title — distinct videos that happen to share a title are
  // distinct songs and must all be importable.
  if (!force && youtubeId) {
    const existing = await prisma.song.findFirst({
      where: { youtubeId },
      select: { title: true, slug: true, youtubeId: true },
    });

    if (existing) {
      return {
        ok: false,
        duplicate: true,
        duplicateReason: 'A song with this exact YouTube video already exists.',
        existingTitle: existing.title,
        existingSlug: existing.slug,
      };
    }
  }

  const slug = await uniqueSlug(slugify(subtitle || title));

  // Create the Song
  const song = await prisma.song.create({
    data: {
      slug,
      title,
      subtitle,
      lyricistCredit: 'Jayesh Prajapati "JAYKAVI"',
      language: 'Gujarati',
      artworkUrl: candidate.thumbnailUrl,
      releaseYear: releaseYear ?? null,
      youtubeId,
      viewCount: candidate.viewCount ?? 0,
      platformLinks: youtubeId
        ? {
            create: {
              platform: 'youtube',
              url: `https://www.youtube.com/watch?v=${youtubeId}`,
              isPrimary: true,
            },
          }
        : undefined,
    },
  });

  // Attach singers by name — create if they don't exist
  const singerNames = overrides.singerNames
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const name of singerNames) {
    const singer = await prisma.singer.upsert({
      where: { legacyId: `auto-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        legacyId: `auto-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
      },
    });
    await prisma.songSinger.create({
      data: { songId: song.id, singerId: singer.id },
    });
  }

  // ── Keep the harvester's known-singers list up to date ───────────────
  // Any singer the admin typed while approving gets remembered, so future
  // harvests can auto-detect them from video titles.
  if (singerNames.length > 0) {
    const cfg = await prisma.harvestConfig.findFirst({ where: { id: 1 } });
    if (cfg) {
      const known = cfg.knownSingers ?? [];
      const knownLower = new Set(known.map((s) => s.toLowerCase()));
      const additions = singerNames.filter((n) => !knownLower.has(n.toLowerCase()));
      if (additions.length > 0) {
        await prisma.harvestConfig.update({
          where: { id: 1 },
          data: { knownSingers: [...known, ...additions] },
        });
      }
    }
  }

  // Mark candidate as approved
  await prisma.harvestCandidate.update({
    where: { id: candidateId },
    data: { status: 'approved', songId: song.id },
  });

  revalidatePath('/admin/harvester');
  revalidatePath('/admin/songs');
  return { ok: true };
}

/**
 * Delete every harvest candidate (pending, duplicate, rejected, approved
 * records). Approved Songs are NOT touched — only the candidate rows.
 */
export async function clearAllCandidates() {
  const session = await auth();
  assertAdmin(session);

  await prisma.harvestCandidate.deleteMany({});

  revalidatePath('/admin/harvester');
}

/**
 * Turn the weekly automatic harvest on or off. When on, the Vercel cron
 * job (/api/cron/harvest) runs a harvest once a week automatically.
 */
export async function setAutoRun(enabled: boolean) {
  const session = await auth();
  assertAdmin(session);

  await prisma.harvestConfig.upsert({
    where: { id: 1 },
    update: { autoRun: enabled },
    create: { id: 1, autoRun: enabled },
  });

  revalidatePath('/admin/harvester');
}

export async function rejectCandidate(candidateId: string) {
  const session = await auth();
  assertAdmin(session);

  await prisma.harvestCandidate.update({
    where: { id: candidateId },
    data: { status: 'rejected' },
  });

  revalidatePath('/admin/harvester');
}

export async function bulkRejectCandidates(ids: string[]): Promise<{ rejected: number }> {
  const session = await auth();
  assertAdmin(session);
  if (!ids.length) return { rejected: 0 };
  const { count } = await prisma.harvestCandidate.updateMany({
    where: { id: { in: ids }, status: 'pending' },
    data: { status: 'rejected' },
  });
  revalidatePath('/admin/harvester');
  return { rejected: count };
}

export interface BulkApproveResult {
  approved: number;
  skipped: number; // duplicates skipped
}

export async function bulkApproveSimple(ids: string[]): Promise<BulkApproveResult> {
  const session = await auth();
  assertAdmin(session);
  if (!ids.length) return { approved: 0, skipped: 0 };

  const candidates = await prisma.harvestCandidate.findMany({
    where: { id: { in: ids }, status: 'pending' },
  });

  let approved = 0;
  let skipped = 0;

  for (const c of candidates) {
    // Exact full YouTube title; cleaned line becomes the subtitle.
    const title = c.rawTitle.trim() || c.cleanTitle.trim();
    const subtitle = c.cleanTitle.trim() || null;
    const youtubeId = c.youtubeId;

    // Skip ONLY a genuine duplicate of the same YouTube video — never by title.
    if (youtubeId) {
      const existing = await prisma.song.findFirst({
        where: { youtubeId },
        select: { id: true },
      });
      if (existing) { skipped++; continue; }
    }

    const slug = await uniqueSlug(slugify(subtitle || title));
    const releaseYear = c.releaseYear ?? null;

    const song = await prisma.song.create({
      data: {
        slug, title, subtitle,
        lyricistCredit: 'Jayesh Prajapati "JAYKAVI"',
        language: 'Gujarati',
        artworkUrl: c.thumbnailUrl,
        releaseYear,
        youtubeId,
        viewCount: c.viewCount ?? 0,
        platformLinks: youtubeId ? {
          create: {
            platform: 'youtube',
            url: `https://www.youtube.com/watch?v=${youtubeId}`,
            isPrimary: true,
          },
        } : undefined,
      },
    });

    // Attach singer guess if present
    const singerNames = (c.singerGuess ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    for (const name of singerNames) {
      const singer = await prisma.singer.upsert({
        where: { legacyId: `auto-${name.toLowerCase().replace(/\s+/g, '-')}` },
        update: {},
        create: { legacyId: `auto-${name.toLowerCase().replace(/\s+/g, '-')}`, name },
      });
      await prisma.songSinger.create({ data: { songId: song.id, singerId: singer.id } });
    }

    await prisma.harvestCandidate.update({
      where: { id: c.id },
      data: { status: 'approved', songId: song.id },
    });

    approved++;
  }

  revalidatePath('/admin/harvester');
  revalidatePath('/admin/songs');
  revalidatePath('/songs');
  return { approved, skipped };
}

export async function saveHarvestConfig(formData: FormData) {
  const session = await auth();
  assertAdmin(session);

  function lines(key: string) {
    const v = formData.get(key);
    return typeof v === 'string'
      ? v.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
  }

  const maxResultsRaw = parseInt(formData.get('maxResultsPerTerm') as string || '100', 10);
  const maxResults = Number.isFinite(maxResultsRaw)
    ? Math.min(Math.max(maxResultsRaw, 1), 500)
    : 100;

  await prisma.harvestConfig.upsert({
    where: { id: 1 },
    update: {
      ownChannels: lines('ownChannels'),
      searchChannels: lines('searchChannels'),
      searchTerms: lines('searchTerms'),
      creditMustContain: lines('creditMustContain'),
      knownSingers: lines('knownSingers'),
      maxResultsPerTerm: maxResults,
    },
    create: {
      id: 1,
      ownChannels: lines('ownChannels'),
      searchChannels: lines('searchChannels'),
      searchTerms: lines('searchTerms'),
      creditMustContain: lines('creditMustContain'),
      knownSingers: lines('knownSingers'),
      maxResultsPerTerm: maxResults,
    },
  });

  revalidatePath('/admin/harvester');
}
