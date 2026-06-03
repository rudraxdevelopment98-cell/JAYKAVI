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

  const title = overrides.title.trim() || candidate.cleanTitle;
  const releaseYear = overrides.releaseYear ? parseInt(overrides.releaseYear, 10) : candidate.releaseYear;
  const youtubeId = overrides.youtubeId.trim() || candidate.youtubeId;

  // ── Duplicate detection ──────────────────────────────────────────────
  // Look for an existing Song with the same YouTube ID or the same title.
  // Unless the admin explicitly forces it, stop and report the duplicate.
  if (!force) {
    const existing = await prisma.song.findFirst({
      where: {
        OR: [
          youtubeId ? { youtubeId } : undefined,
          { title: { equals: title, mode: 'insensitive' } },
        ].filter(Boolean) as any,
      },
      select: { title: true, slug: true, youtubeId: true },
    });

    if (existing) {
      const reason =
        existing.youtubeId && existing.youtubeId === youtubeId
          ? 'A song with this exact YouTube video already exists.'
          : 'A song with this title already exists.';
      return {
        ok: false,
        duplicate: true,
        duplicateReason: reason,
        existingTitle: existing.title,
        existingSlug: existing.slug,
      };
    }
  }

  const slug = await uniqueSlug(slugify(title));

  // Create the Song
  const song = await prisma.song.create({
    data: {
      slug,
      title,
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

export async function rejectCandidate(candidateId: string) {
  const session = await auth();
  assertAdmin(session);

  await prisma.harvestCandidate.update({
    where: { id: candidateId },
    data: { status: 'rejected' },
  });

  revalidatePath('/admin/harvester');
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

  const maxResults = parseInt(formData.get('maxResultsPerTerm') as string || '100', 10);

  await prisma.harvestConfig.upsert({
    where: { id: 1 },
    update: {
      ownChannels: lines('ownChannels'),
      searchChannels: lines('searchChannels'),
      searchTerms: lines('searchTerms'),
      creditMustContain: lines('creditMustContain'),
      knownSingers: lines('knownSingers'),
      maxResultsPerTerm: Number.isFinite(maxResults) ? maxResults : 100,
    },
    create: {
      id: 1,
      ownChannels: lines('ownChannels'),
      searchChannels: lines('searchChannels'),
      searchTerms: lines('searchTerms'),
      creditMustContain: lines('creditMustContain'),
      knownSingers: lines('knownSingers'),
      maxResultsPerTerm: Number.isFinite(maxResults) ? maxResults : 100,
    },
  });

  revalidatePath('/admin/harvester');
}
