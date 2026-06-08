'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchFromYouTube, searchGoogle } from '@/lib/lyricsFetch';
import { hydrateVideos, extractSingersFromDescription } from '@/lib/youtube';
import { parseSingerNames, normalizeSingerKey } from '@/lib/singers';

function assertAdmin(s: any) {
  if (!s || !s.isAdmin) throw new Error('Unauthorized');
}
function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}
function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === '' ? null : s;
}
function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}
function csv(v: FormDataEntryValue | null): string[] {
  if (typeof v !== 'string') return [];
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

interface PlatformLinkInput {
  platform: string;
  url: string;
  isPrimary: boolean;
}

interface TranslationInput {
  language: string;
  text: string;
}

function parseJsonField<T>(v: FormDataEntryValue | null): T[] {
  if (typeof v !== 'string' || !v.trim()) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await prisma.song.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i++;
    slug = `${base}-${i}`;
  }
}

interface SongPayload {
  title: string;
  subtitle: string | null;
  slug: string;
  altTitles: string[];
  lyricistCredit: string;
  composer: string | null;
  collectionId: string | null;
  language: string;
  genre: string[];
  mood: string[];
  releaseYear: number | null;
  artworkUrl: string | null;
  lyrics: string;
  viewCount: number;
  isTrending: boolean;
  youtubeId: string | null;
  spotifyTrackId: string | null;
}

function buildPayload(formData: FormData): SongPayload & {
  singerIds: string[];
  platformLinks: PlatformLinkInput[];
  lyricsTranslations: TranslationInput[];
} {
  const title = str(formData.get('title'));
  const subtitle = strOrNull(formData.get('subtitle'));
  return {
    title,
    subtitle,
    slug: str(formData.get('slug')) || slugify(subtitle || title),
    altTitles: csv(formData.get('altTitles')),
    lyricistCredit: str(formData.get('lyricistCredit')) || 'Jayesh Prajapati "JAYKAVI"',
    composer: strOrNull(formData.get('composer')),
    collectionId: strOrNull(formData.get('collectionId')),
    language: str(formData.get('language')) || 'Gujarati',
    genre: csv(formData.get('genre')),
    mood: csv(formData.get('mood')),
    releaseYear: intOrNull(formData.get('releaseYear')),
    artworkUrl: strOrNull(formData.get('artworkUrl')),
    lyrics: str(formData.get('lyrics')),
    viewCount: intOrNull(formData.get('viewCount')) ?? 0,
    isTrending: formData.get('isTrending') === 'on',
    youtubeId: strOrNull(formData.get('youtubeId')),
    spotifyTrackId: strOrNull(formData.get('spotifyTrackId')),
    singerIds: csv(formData.get('singerIds')),
    platformLinks: parseJsonField<PlatformLinkInput>(formData.get('platformLinks')),
    lyricsTranslations: parseJsonField<TranslationInput>(formData.get('lyricsTranslations')),
  };
}

export async function createSong(formData: FormData): Promise<{ error: string } | void> {
  const session = await auth();
  assertAdmin(session);
  const p = buildPayload(formData);
  if (!p.title) return { error: 'Title is required' };

  // Only a shared YouTube video ID counts as a true duplicate — two distinct
  // videos may legitimately share a title.
  if (p.youtubeId) {
    const duplicate = await prisma.song.findFirst({
      where: { youtubeId: p.youtubeId },
      select: { title: true },
    });
    if (duplicate) {
      return { error: `A song with this YouTube ID already exists: "${duplicate.title}"` };
    }
  }

  const slug = await uniqueSlug(p.slug);

  const song = await prisma.song.create({
    data: {
      title: p.title,
      subtitle: p.subtitle,
      slug,
      altTitles: p.altTitles,
      lyricistCredit: p.lyricistCredit,
      composer: p.composer,
      collectionId: p.collectionId,
      language: p.language,
      genre: p.genre,
      mood: p.mood,
      releaseYear: p.releaseYear,
      artworkUrl: p.artworkUrl,
      lyrics: p.lyrics,
      viewCount: p.viewCount,
      isTrending: p.isTrending,
      youtubeId: p.youtubeId,
      spotifyTrackId: p.spotifyTrackId,
      singers: {
        create: p.singerIds.map((singerId) => ({ singerId })),
      },
      platformLinks: { create: p.platformLinks },
      lyricsTranslations: { create: p.lyricsTranslations },
    },
  });

  await logActivity({
    actorEmail: session?.user?.email,
    action: 'create',
    entity: 'Song',
    label: song.title,
  });

  revalidatePath('/admin/songs');
  redirect(`/admin/songs/${song.id}`);
}

export async function updateSong(id: string, formData: FormData) {
  const session = await auth();
  assertAdmin(session);
  const p = buildPayload(formData);
  if (!p.title) throw new Error('Title is required');

  const slug = await uniqueSlug(p.slug, id);

  await prisma.$transaction([
    prisma.song.update({
      where: { id },
      data: {
        title: p.title,
        subtitle: p.subtitle,
        slug,
        altTitles: p.altTitles,
        lyricistCredit: p.lyricistCredit,
        composer: p.composer,
        collectionId: p.collectionId,
        language: p.language,
        genre: p.genre,
        mood: p.mood,
        releaseYear: p.releaseYear,
        artworkUrl: p.artworkUrl,
        lyrics: p.lyrics,
        viewCount: p.viewCount,
        isTrending: p.isTrending,
        youtubeId: p.youtubeId,
        spotifyTrackId: p.spotifyTrackId,
      },
    }),
    prisma.songSinger.deleteMany({ where: { songId: id } }),
    prisma.platformLink.deleteMany({ where: { songId: id } }),
    prisma.lyricsTranslation.deleteMany({ where: { songId: id } }),
    ...p.singerIds.map((singerId) =>
      prisma.songSinger.create({ data: { songId: id, singerId } })
    ),
    ...p.platformLinks.map((l) =>
      prisma.platformLink.create({ data: { songId: id, ...l } })
    ),
    ...p.lyricsTranslations.map((t) =>
      prisma.lyricsTranslation.create({ data: { songId: id, ...t } })
    ),
  ]);

  await logActivity({
    actorEmail: session?.user?.email,
    action: 'update',
    entity: 'Song',
    label: p.title,
  });

  revalidatePath('/admin/songs');
  revalidatePath(`/admin/songs/${id}`);
  revalidatePath('/songs');
  redirect('/admin/songs');
}

export interface FetchLyricsResult {
  suggestion: {
    source: 'youtube' | 'google';
    label: string;
    url?: string;
    text: string;
    confidence: 'high' | 'medium' | 'low';
  } | null;
  searchHits: { title: string; link: string; snippet: string }[];
  searchConfigured: boolean;
}

export async function fetchLyricsAction(input: {
  youtubeId?: string | null;
  title: string;
  singers?: string;
}): Promise<FetchLyricsResult> {
  const session = await auth();
  assertAdmin(session);
  let suggestion: FetchLyricsResult['suggestion'] = null;
  if (input.youtubeId) {
    const s = await fetchFromYouTube(input.youtubeId);
    if (s) suggestion = s;
  }

  const searchConfigured = Boolean(
    process.env.GOOGLE_CSE_ID &&
      (process.env.GOOGLE_SEARCH_API_KEY || process.env.YOUTUBE_API_KEY)
  );
  let searchHits: FetchLyricsResult['searchHits'] = [];
  if (searchConfigured && input.title) {
    searchHits = await searchGoogle(input.title, input.singers ?? '');
  }

  return { suggestion, searchHits, searchConfigured };
}

export async function deleteSong(id: string) {
  const session = await auth();
  assertAdmin(session);
  const existing = await prisma.song.findUnique({ where: { id }, select: { title: true } });
  await prisma.song.delete({ where: { id } });
  await logActivity({
    actorEmail: session?.user?.email,
    action: 'delete',
    entity: 'Song',
    label: existing?.title ?? id,
  });
  revalidatePath('/admin/songs');
  redirect('/admin/songs');
}

export async function bulkEditSongs(
  ids: string[],
  patch: {
    collectionId?: string | null;   // undefined = don't touch, null = clear
    language?: string;
    genre?: string[];
    mood?: string[];
    isTrending?: boolean;
    releaseYear?: number | null;
  },
): Promise<{ updated: number }> {
  const session = await auth();
  assertAdmin(session);
  if (!ids.length) return { updated: 0 };

  const data: Record<string, any> = {};
  if ('collectionId' in patch) data.collectionId = patch.collectionId ?? null;
  if (patch.language)          data.language = patch.language;
  if (patch.genre)             data.genre = patch.genre;
  if (patch.mood)              data.mood = patch.mood;
  if (patch.isTrending !== undefined) data.isTrending = patch.isTrending;
  if ('releaseYear' in patch)  data.releaseYear = patch.releaseYear ?? null;

  if (!Object.keys(data).length) return { updated: 0 };

  const { count } = await prisma.song.updateMany({ where: { id: { in: ids } }, data });

  await logActivity({
    actorEmail: session?.user?.email,
    action: 'update',
    entity: 'Song',
    label: `Bulk edit — ${count} song${count !== 1 ? 's' : ''}`,
  });
  revalidatePath('/admin/songs');
  revalidatePath('/songs');
  return { updated: count };
}

export async function bulkDeleteSongs(ids: string[]): Promise<{ deleted: number }> {
  const session = await auth();
  assertAdmin(session);
  if (!ids.length) return { deleted: 0 };
  const { count } = await prisma.song.deleteMany({ where: { id: { in: ids } } });
  await logActivity({
    actorEmail: session?.user?.email,
    action: 'delete',
    entity: 'Song',
    label: `Bulk delete — ${count} song${count !== 1 ? 's' : ''}`,
  });
  revalidatePath('/admin/songs');
  revalidatePath('/songs');
  return { deleted: count };
}

export async function fetchSingersAction(youtubeId: string): Promise<{
  found: string[];
  matched: { id: string; name: string }[];
}> {
  const session = await auth();
  assertAdmin(session);
  if (!youtubeId) return { found: [], matched: [] };

  const map = await hydrateVideos([youtubeId]);
  const v = map.get(youtubeId);
  if (!v) return { found: [], matched: [] };

  // Description credit lines, parsed through the same robust splitter
  const fromDescRaw = extractSingersFromDescription(v.description).join(', ');
  const fromDesc = parseSingerNames(fromDescRaw);

  // Also check the title for known singers in DB
  const allSingers = await prisma.singer.findMany({ select: { id: true, name: true } });
  const fromTitle = allSingers.filter((s) =>
    v.title.toLowerCase().includes(s.name.toLowerCase())
  );

  const found = fromDesc.length > 0 ? fromDesc : fromTitle.map((s) => s.name);

  // Normalized match against DB so case/whitespace variants resolve correctly
  const foundKeys = new Set(found.map(normalizeSingerKey));
  const matched = allSingers.filter((s) => foundKeys.has(normalizeSingerKey(s.name)));

  return { found, matched };
}
