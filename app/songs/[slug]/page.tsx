import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllSongs, getSongBySlug, getCollectionById } from '@/lib/data';
import PlatformLinkButtons from '@/components/PlatformLinkButtons';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const songs = await getAllSongs();
  return songs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const song = await getSongBySlug(params.slug);
  if (!song) return { title: 'Song not found' };
  const desc = song.lyrics ? song.lyrics.slice(0, 150) : `${song.title} — written by ${song.lyricist}`;
  return {
    title: `${song.title} — JAYKAVI`,
    description: desc,
    openGraph: { title: song.title, description: desc, images: song.artworkUrl ? [song.artworkUrl] : [] },
  };
}

export default async function SongDetail({ params }: { params: { slug: string } }) {
  const song = await getSongBySlug(params.slug);
  if (!song) notFound();

  const [collection, all] = await Promise.all([
    getCollectionById(song.collectionId),
    getAllSongs(),
  ]);
  const related = all
    .filter((s) => s.id !== song.id && (
      s.collectionId === song.collectionId && song.collectionId ||
      s.performingSingers.some((p) => song.performingSingers.includes(p))
    ))
    .slice(0, 4);

  // Render lyrics: split by newline, blank lines become spacers
  function renderLyrics(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;
    for (const line of lines) {
      if (line.trim() === '') {
        elements.push(<div key={key++} style={{ height: 20 }} />);
      } else {
        elements.push(<p key={key++} style={{ margin: 0, lineHeight: 1.9 }}>{line}</p>);
      }
    }
    return elements;
  }

  return (
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>
      {/* hero */}
      <div style={{
        padding: '18vh 6vw 6vh',
        background: song.artworkUrl
          ? `linear-gradient(to bottom, rgba(10,10,11,.7) 0%, rgba(10,10,11,.85) 60%, var(--bg) 100%), url(${song.artworkUrl}) center/cover`
          : 'var(--hero-grad)',
        borderRadius: '0 0 24px 24px',
        marginBottom: 0,
      }}>
        <Link href="/songs" className="text-muted" style={{ textDecoration: 'none', fontSize: '.85rem' }}>← All songs</Link>
        {song.genre?.[0] && <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.74rem', fontWeight: 600, marginTop: 20 }}>{song.genre.join(' · ')}</p>}
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.6rem,7vw,5.5rem)', fontWeight: 700, lineHeight: 1.05, margin: '10px 0 18px', letterSpacing: '-.01em' }}>{song.title}</h1>
        {song.performingSingers.length > 0 && (
          <p style={{ fontSize: '1.15rem' }}>Sung by <strong>{song.performingSingers.join(', ')}</strong></p>
        )}
        <div style={{ marginTop: 24 }}>
          <PlatformLinkButtons links={song.platformLinks} />
        </div>
      </div>

      <div style={{ padding: '4vh 6vw 9vh', display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 50 }} className="song-grid">
        {/* lyrics + embed */}
        <div>
          {song.embed?.youtubeId && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 36, borderRadius: 16, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${song.embed.youtubeId}`}
                title={song.title} allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
          )}
          <h2 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: 18 }}>Lyrics</h2>
          {song.lyrics ? (
            <div className="font-serif" style={{ fontSize: '1.15rem' }}>{renderLyrics(song.lyrics)}</div>
          ) : (
            <p className="text-muted">Lyrics will be added soon.</p>
          )}
        </div>

        {/* credits */}
        <aside>
          <div className="glass" style={{ padding: 26, borderRadius: 18, position: 'sticky', top: 100 }}>
            <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: 16 }}>Credits</h3>
            <Credit label="Lyricist" value={song.lyricist} />
            {song.performingSingers.length > 0 && <Credit label="Singer(s)" value={song.performingSingers.join(', ')} />}
            {song.composer && <Credit label="Composer" value={song.composer} />}
            {collection && <Credit label="Collection" value={collection.title} />}
            {song.releaseYear && <Credit label="Year" value={String(song.releaseYear)} />}
            {song.language && <Credit label="Language" value={song.language} />}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div style={{ padding: '0 6vw 9vh' }}>
          <h2 className="font-serif" style={{ fontSize: '1.6rem', marginBottom: 22 }}>Related songs</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {related.map((r) => (
              <Link key={r.id} href={`/songs/${r.slug}`} className="glass" style={{ textDecoration: 'none', padding: '14px 20px', borderRadius: 12 }}>
                <span className="font-serif">{r.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) { .song-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }
      `}</style>
    </div>
  );
}

function Credit({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="text-muted" style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.18em' }}>{label}</div>
      <div style={{ fontSize: '1rem', marginTop: 3 }}>{value}</div>
    </div>
  );
}
