import { getAllSongs, getAllCollections, getActiveTheme } from '@/lib/data';
import LyricsLibrary from './LyricsLibrary';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Lyric Library — JAYKAVI',
  description: 'The complete lyric library — search, filter and read the lyrics of every song written by JAYKAVI.',
};

export default async function LyricsPage() {
  const [songs, collections, activeTheme] = await Promise.all([
    getAllSongs(),
    getAllCollections(),
    getActiveTheme(),
  ]);

  return (
    <LyricsLibrary
      songs={songs}
      collections={collections}
      traditional={activeTheme === 'traditional'}
    />
  );
}
