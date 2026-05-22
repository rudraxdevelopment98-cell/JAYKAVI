import { getSongsWithLyrics, getAllSongs } from '@/lib/data';
import LyricsList from './LyricsList';

export const metadata = { title: 'Lyrics — JAYKAVI' };

export default async function LyricsPage() {
  const [withLyrics, all] = await Promise.all([getSongsWithLyrics(), getAllSongs()]);

  return (
    <div
      style={{
        padding: '16vh 6vw 9vh',
        maxWidth: 900,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <p
        className="accent"
        style={{
          textTransform: 'uppercase',
          letterSpacing: '.3em',
          fontSize: '.76rem',
          fontWeight: 600,
        }}
      >
        Lyrics
      </p>
      <h1
        className="font-serif"
        style={{
          fontSize: 'clamp(2.2rem,5vw,3.6rem)',
          fontWeight: 600,
          margin: '12px 0 28px',
        }}
      >
        The lyric library
      </h1>

      <LyricsList withLyrics={withLyrics} all={all} />
    </div>
  );
}
