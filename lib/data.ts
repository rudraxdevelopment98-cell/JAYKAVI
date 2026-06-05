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

export async function getSongsByCollection(collectionDbId: string): Promise<Song[]> {
  return tryDb(
    async () => {
      const rows = await prisma.song.findMany({
        where: { collectionId: collectionDbId },
        include: songInclude,
        orderBy: [{ releaseYear: 'desc' }, { title: 'asc' }],
      });
      return rows.map(dbSongToJson);
    },
    () => [],
  );
}

export async function getSongsBySingerDbId(singerDbId: string): Promise<Song[]> {
  return tryDb(
    async () => {
      const rows = await prisma.song.findMany({
        where: { singers: { some: { singerId: singerDbId } } },
        include: songInclude,
        orderBy: [{ releaseYear: 'desc' }, { title: 'asc' }],
      });
      return rows.map(dbSongToJson);
    },
    () => [],
  );
}

export async function getSingerByParam(idOrLegacyId: string): Promise<{ id: string; legacyId: string | null; name: string; photoUrl: string | null; bio: string | null } | null> {
  return tryDb(
    async () => {
      const row = await prisma.singer.findFirst({
        where: { OR: [{ id: idOrLegacyId }, { legacyId: idOrLegacyId }] },
        select: { id: true, legacyId: true, name: true, photoUrl: true, bio: true },
      });
      return row ?? null;
    },
    () => null,
  );
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

// -------- Site Settings --------

export async function getActiveTheme(): Promise<string> {
  try {
    const row = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    return row?.activeTheme ?? 'default';
  } catch {
    return 'default';
  }
}

export async function setSiteTheme(theme: string): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { activeTheme: theme },
    create: { id: 1, activeTheme: theme },
  });
}

// ── Traditional theme customization ──────────────────────────────────────

export interface TraditionalSettings {
  mantra: string;
  heroPortrait: string | null;
  heroDeity: string | null;
  heroBg: string | null;
  heroBgVideo: string | null;
  features: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ];
}

export const TRAD_DEFAULTS: TraditionalSettings = {
  mantra: '॥ જય શ્રી કૃષ્ણ ॥',
  heroPortrait: null,
  heroDeity: null,
  heroBg: null,
  heroBgVideo: null,
  features: [
    { title: 'ભક્તિ',    desc: 'શુદ્ધ ભાવ અને શ્રદ્ધા' },
    { title: 'સંગીત',    desc: 'સુરોથી સર્જાયેલ ભક્તિ' },
    { title: 'સંસ્કૃતિ', desc: 'ગુજરાતી સંસ્કૃતિનો સંગમ' },
    { title: 'સેવા',     desc: 'સંગીત દ્વારા સેવા અને સમર્પણ' },
  ],
};

export async function getTraditionalSettings(): Promise<TraditionalSettings> {
  try {
    const row = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    if (!row) return TRAD_DEFAULTS;
    const d = TRAD_DEFAULTS;
    return {
      mantra:       row.tradMantra       || d.mantra,
      heroPortrait: row.tradHeroPortrait  || null,
      heroDeity:    row.tradHeroDeity     || null,
      heroBg:       row.tradHeroBg        || null,
      heroBgVideo:  row.tradHeroBgVideo   || null,
      features: [
        { title: row.tradF1Title || d.features[0].title, desc: row.tradF1Desc || d.features[0].desc },
        { title: row.tradF2Title || d.features[1].title, desc: row.tradF2Desc || d.features[1].desc },
        { title: row.tradF3Title || d.features[2].title, desc: row.tradF3Desc || d.features[2].desc },
        { title: row.tradF4Title || d.features[3].title, desc: row.tradF4Desc || d.features[3].desc },
      ],
    };
  } catch {
    return TRAD_DEFAULTS;
  }
}

export async function setTraditionalSettings(s: TraditionalSettings): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      tradMantra:        s.mantra,
      tradHeroPortrait:  s.heroPortrait  || null,
      tradHeroDeity:     s.heroDeity     || null,
      tradHeroBg:        s.heroBg        || null,
      tradHeroBgVideo:   s.heroBgVideo   || null,
      tradF1Title: s.features[0].title, tradF1Desc: s.features[0].desc,
      tradF2Title: s.features[1].title, tradF2Desc: s.features[1].desc,
      tradF3Title: s.features[2].title, tradF3Desc: s.features[2].desc,
      tradF4Title: s.features[3].title, tradF4Desc: s.features[3].desc,
    },
    create: {
      id: 1,
      tradMantra:        s.mantra,
      tradHeroPortrait:  s.heroPortrait  || null,
      tradHeroDeity:     s.heroDeity     || null,
      tradHeroBg:        s.heroBg        || null,
      tradHeroBgVideo:   s.heroBgVideo   || null,
      tradF1Title: s.features[0].title, tradF1Desc: s.features[0].desc,
      tradF2Title: s.features[1].title, tradF2Desc: s.features[1].desc,
      tradF3Title: s.features[2].title, tradF3Desc: s.features[2].desc,
      tradF4Title: s.features[3].title, tradF4Desc: s.features[3].desc,
    },
  });
}
