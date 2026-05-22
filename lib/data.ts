import raw from '@/data/songwriter_data.json';
import { prisma } from './prisma';
import type {
  SiteData, Song, Collection, JourneyMilestone, Singer, Lyricist, Platform,
} from './types';

/**
 * Data layer for the public site.
 *
 * Strategy: try Prisma first. If the database is unreachable OR returns an empty
 * result for the primary query, fall back to the bundled JSON snapshot so the
 * site keeps working in dev (before DB setup) and during failover.
 */

const json = raw as unknown as SiteData;

async function tryDb<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback();
  }
}

// -------- Lyricist --------

export async function getLyricist(): Promise<Lyricist> {
  return tryDb(
    async () => {
      const row = await prisma.lyricist.findFirst({ where: { id: 1 } });
      if (!row) return json.lyricist;
      return {
        name: row.name,
        penName: row.penName ?? undefined,
        displayName: row.displayName ?? undefined,
        creditVariants: row.creditVariants,
        title: row.title ?? undefined,
        tagline: row.tagline,
        bornPlace: row.bornPlace ?? undefined,
        basedIn: row.basedIn ?? undefined,
        birthDate: row.birthDate ?? undefined,
        languages: row.languages,
        genres: row.genres,
        careerStartYear: row.careerStartYear ?? undefined,
        stats: {
          songsWritten: row.songsWritten ?? undefined,
          songsPublishedOnStreaming: row.songsPublishedOnStreaming ?? undefined,
        },
        bio: row.bio,
        philosophy: row.philosophy ?? undefined,
        awards: row.awards,
        press: row.press,
      };
    },
    () => json.lyricist,
  );
}

// -------- Social / Contact --------

export async function getSocial(): Promise<Record<string, string>> {
  return tryDb(
    async () => {
      const c = await prisma.contact.findFirst({ where: { id: 1 } });
      if (!c) return json.contact?.public?.social ?? {};
      const out: Record<string, string> = {};
      if (c.instagram) out.instagram = c.instagram;
      if (c.instagramSecondary) out.instagramSecondary = c.instagramSecondary;
      if (c.youtube) out.youtube = c.youtube;
      if (c.spotify) out.spotify = c.spotify;
      if (c.jiosaavn) out.jiosaavn = c.jiosaavn;
      return out;
    },
    () => json.contact?.public?.social ?? {},
  );
}

// -------- Singers --------

export async function getAllSingers(): Promise<Singer[]> {
  return tryDb(
    async () => {
      const rows = await prisma.singer.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });
      if (rows.length === 0) return json.singers ?? [];
      return rows.map((r) => ({
        id: r.legacyId ?? r.id,
        name: r.name,
        photoUrl: r.photoUrl,
        bio: r.bio,
      }));
    },
    () => json.singers ?? [],
  );
}

// -------- Collections --------

export async function getAllCollections(): Promise<Collection[]> {
  return tryDb(
    async () => {
      const rows = await prisma.collection.findMany({
        orderBy: [{ year: 'desc' }, { title: 'asc' }],
      });
      if (rows.length === 0) return json.collections ?? [];
      return rows.map((r) => ({
        id: r.legacyId ?? r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        coverUrl: r.coverUrl ?? '',
        year: r.year,
      }));
    },
    () => json.collections ?? [],
  );
}

export async function getCollectionById(id: string | null): Promise<Collection | undefined> {
  if (!id) return undefined;
  const all = await getAllCollections();
  return all.find((c) => c.id === id);
}

// -------- Songs --------

const songInclude = {
  singers: { include: { singer: true } },
  platformLinks: true,
  lyricsTranslations: true,
  collection: true,
} as const;

function dbSongToJson(s: any): Song {
  return {
    id: s.legacyId ?? s.id,
    slug: s.slug,
    title: s.title,
    altTitles: s.altTitles ?? [],
    lyricist: s.lyricistCredit,
    performingSingers: (s.singers ?? []).map((sg: any) => sg.singer.name),
    composer: s.composer,
    collectionId: s.collection?.legacyId ?? s.collectionId ?? null,
    language: s.language,
    genre: s.genre ?? [],
    mood: s.mood ?? [],
    releaseYear: s.releaseYear,
    artworkUrl: s.artworkUrl ?? '',
    lyrics: s.lyrics ?? '',
    lyricsTranslations: (s.lyricsTranslations ?? []).map((t: any) => ({
      language: t.language, text: t.text,
    })),
    platformLinks: (s.platformLinks ?? []).map((l: any) => ({
      platform: l.platform as Platform, url: l.url, isPrimary: l.isPrimary,
    })),
    viewCount: s.viewCount ?? 0,
    isTrending: !!s.isTrending,
    embed: { youtubeId: s.youtubeId, spotifyTrackId: s.spotifyTrackId },
  };
}

export async function getAllSongs(): Promise<Song[]> {
  return tryDb(
    async () => {
      const rows = await prisma.song.findMany({
        include: songInclude,
        orderBy: [{ releaseYear: 'desc' }, { title: 'asc' }],
      });
      if (rows.length === 0) return json.songs ?? [];
      return rows.map(dbSongToJson);
    },
    () => json.songs ?? [],
  );
}

export async function getSongBySlug(slug: string): Promise<Song | undefined> {
  return tryDb(
    async () => {
      const row = await prisma.song.findUnique({
        where: { slug },
        include: songInclude,
      });
      if (row) return dbSongToJson(row);
      return (json.songs ?? []).find((s) => s.slug === slug);
    },
    () => (json.songs ?? []).find((s) => s.slug === slug),
  );
}

export async function getTrendingSongs(): Promise<Song[]> {
  const all = await getAllSongs();
  return all.filter((s) => s.isTrending);
}

export async function getTopSongs(limit = 10): Promise<Song[]> {
  const all = await getAllSongs();
  return [...all]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, limit);
}

export async function getSingerNames(): Promise<string[]> {
  const singers = await getAllSingers();
  const songs = await getAllSongs();
  const fromSingers = singers.map((s) => s.name);
  const fromSongs = songs.flatMap((s) => s.performingSingers);
  return Array.from(new Set([...fromSingers, ...fromSongs])).sort();
}

export async function getSongsWithLyrics(): Promise<Song[]> {
  const all = await getAllSongs();
  return all.filter((s) => s.lyrics && s.lyrics.trim().length > 0);
}

// -------- Journey --------

export async function getJourney(): Promise<JourneyMilestone[]> {
  return tryDb(
    async () => {
      const rows = await prisma.journeyMilestone.findMany({
        orderBy: [{ sortOrder: 'asc' }, { year: 'asc' }],
      });
      if (rows.length === 0)
        return [...(json.journey ?? [])].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
      return rows.map((r) => ({
        id: r.legacyId ?? r.id,
        year: r.year,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        relatedSongIds: r.relatedSongIds,
      }));
    },
    () => [...(json.journey ?? [])].sort((a, b) => (a.year ?? 0) - (b.year ?? 0)),
  );
}

// -------- Facets --------

export async function getFacets() {
  const songs = await getAllSongs();
  const singerNames = await getSingerNames();
  const languages = new Set<string>();
  const genres = new Set<string>();
  const moods = new Set<string>();
  const years = new Set<number>();
  const platforms = new Set<string>();
  songs.forEach((s) => {
    if (s.language) languages.add(s.language);
    s.genre?.forEach((g) => genres.add(g));
    s.mood?.forEach((m) => moods.add(m));
    if (s.releaseYear) years.add(s.releaseYear);
    s.platformLinks?.forEach((p) => platforms.add(p.platform));
  });
  return {
    languages: [...languages].sort(),
    genres: [...genres].sort(),
    moods: [...moods].sort(),
    years: [...years].sort((a, b) => b - a),
    singers: singerNames,
    platforms: [...platforms].sort(),
  };
}
