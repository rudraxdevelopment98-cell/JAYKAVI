import raw from '@/data/songwriter_data.json';
import type { SiteData, Song, Collection, JourneyMilestone, Singer, Lyricist } from './types';

/**
 * STAGE 1: data comes from the bundled JSON file.
 * STAGE 2 (Sanity): replace the body of these functions with Sanity
 * queries. Nothing else in the app needs to change — every page imports
 * from here, so this file is the only data source.
 */

const data = raw as unknown as SiteData;

export function getLyricist(): Lyricist {
  return data.lyricist;
}

export function getSocial(): Record<string, string> {
  return data.contact?.public?.social ?? {};
}

export function getAllSongs(): Song[] {
  return data.songs ?? [];
}

export function getSongBySlug(slug: string): Song | undefined {
  return getAllSongs().find((s) => s.slug === slug);
}

export function getTrendingSongs(): Song[] {
  return getAllSongs().filter((s) => s.isTrending);
}

export function getTopSongs(limit = 10): Song[] {
  return [...getAllSongs()]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, limit);
}

export function getAllSingers(): Singer[] {
  return data.singers ?? [];
}

export function getSingerNames(): string[] {
  const fromSingers = getAllSingers().map((s) => s.name);
  const fromSongs = getAllSongs().flatMap((s) => s.performingSingers);
  return Array.from(new Set([...fromSingers, ...fromSongs])).sort();
}

export function getAllCollections(): Collection[] {
  return data.collections ?? [];
}

export function getCollectionById(id: string | null): Collection | undefined {
  if (!id) return undefined;
  return getAllCollections().find((c) => c.id === id);
}

export function getJourney(): JourneyMilestone[] {
  return [...(data.journey ?? [])].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
}

export function getSongsWithLyrics(): Song[] {
  return getAllSongs().filter((s) => s.lyrics && s.lyrics.trim().length > 0);
}

// Facets for the filter bar
export function getFacets() {
  const songs = getAllSongs();
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
    singers: getSingerNames(),
    platforms: [...platforms].sort(),
  };
}
