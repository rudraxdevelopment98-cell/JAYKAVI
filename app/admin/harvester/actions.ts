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

export async function approveCandidate(candidateId: string, overrides: {
  title: string;
  singerNames: string;
  releaseYear: string;
  youtubeId: string;
}) {
  const session = await auth();
  assertAdmin(session);

  const candidate = await prisma.harvestCandidate.findUniqueOrThrow({
    where: { id: candidateId },
  });

  const title = overrides.title.trim() || candidate.cleanTitle;
  const slug = await uniqueSlug(slugify(title));
  const releaseYear = overrides.releaseYear ? parseInt(overrides.releaseYear, 10) : candidate.releaseYear;
  const youtubeId = overrides.youtubeId.trim() || candidate.youtubeId;

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

  // Mark candidate as approved
  await prisma.harvestCandidate.update({
    where: { id: candidateId },
    data: { status: 'approved', songId: song.id },
  });

  revalidatePath('/admin/harvester');
  revalidatePath('/admin/songs');
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
      searchTerms: lines('searchTerms'),
      creditMustContain: lines('creditMustContain'),
      knownSingers: lines('knownSingers'),
      maxResultsPerTerm: Number.isFinite(maxResults) ? maxResults : 100,
    },
    create: {
      id: 1,
      ownChannels: lines('ownChannels'),
      searchTerms: lines('searchTerms'),
      creditMustContain: lines('creditMustContain'),
      knownSingers: lines('knownSingers'),
      maxResultsPerTerm: Number.isFinite(maxResults) ? maxResults : 100,
    },
  });

  revalidatePath('/admin/harvester');
}
