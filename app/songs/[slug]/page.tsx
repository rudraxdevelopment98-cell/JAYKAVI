import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllSongs, getSongBySlug, getCollectionById } from '@/lib/data';
import PlatformLinkButtons from '@/components/PlatformLinkButtons';
import LyricsViewer from '@/components/LyricsViewer';
import TrackView from '@/components/TrackView';
import JsonLd from '@/components/JsonLd';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const songs = await getAllSongs();
  return songs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const song = await getSongBySlug(params.slug);
  if (!song) return { title: 'Song not found' };
  const singers = song.performingSingers.length ? ` · Sung by ${song.performingSingers.join(', ')}` : '';
  const desc = song.lyrics
    ? `${song.lyrics.slice(0, 140).replace(/\n/g, ' ')}…`
    : `${song.title} — Gujarati song written by ${song.lyricist}${singers}.`;
  const images = song.artworkUrl ? [song.artworkUrl] : [];
  return {
    title: song.title,
    description: desc,
    alternates: { canonical: `/songs/${song.slug}` },
    openGraph: {
      title: song.title,
      description: desc,
      type: 'music.song',
      url: absoluteUrl(`/songs/${song.slug}`),
      images,
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title: song.title,
      description: desc,
      images,
    },
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
      (s.collectionId === song.collectionId && !!song.collectionId) ||
      s.performingSingers.some((p) => song.performingSingers.includes(p))
    ))
    .slice(0, 6);

  // Structured data for rich search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url: absoluteUrl(`/songs/${song.slug}`),
    inLanguage: song.language || 'Gujarati',
    ...(song.artworkUrl ? { image: song.artworkUrl } : {}),
    ...(song.releaseYear ? { datePublished: String(song.releaseYear) } : {}),
    lyricist: { '@type': 'Person', name: song.lyricist },
    ...(song.performingSingers.length
      ? { byArtist: song.performingSingers.map((n) => ({ '@type': 'Person', name: n })) }
      : {}),
    ...(song.composer ? { composer: { '@type': 'Person', name: song.composer } } : {}),
  };

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <JsonLd data={jsonLd} />
      <TrackView slug={song.slug} />
      {/* ── Hero ── */}
      <div className="song-hero" style={{
        background: song.artworkUrl
          ? `linear-gradient(to bottom, rgba(10,10,11,.65) 0%, rgba(10,10,11,.9) 70%, var(--bg) 100%), url(${song.artworkUrl}) center/cover no-repeat`
          : 'var(--hero-grad)',
      }}>
        <div className="song-hero-inner">
          <Link href="/songs" className="text-muted" style={{ textDecoration: 'none', fontSize: '.85rem' }}>← All songs</Link>
          {song.genre?.[0] && (
            <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.74rem', fontWeight: 600, marginTop: 18 }}>
              {song.genre.join(' · ')}
            </p>
          )}
          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem,6vw,5rem)', fontWeight: 700, lineHeight: 1.05, margin: '10px 0 16px', letterSpacing: '-.01em' }}>
            {song.title}
          </h1>
          {song.performingSingers.length > 0 && (
            <p style={{ fontSize: '1.05rem', margin: '0 0 22px' }}>
              Sung by <strong>{song.performingSingers.join(', ')}</strong>
            </p>
          )}
          <PlatformLinkButtons links={song.platformLinks} />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="song-body-wrap">
        <div className="song-grid">
          {/* lyrics + embed */}
          <div>
            {song.embed?.youtubeId && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 32, borderRadius: 14, overflow: 'hidden' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${song.embed.youtubeId}`}
                  title={song.title} allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
            )}
            <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: 16 }}>Lyrics</h2>
            {song.lyrics ? (
              <LyricsViewer
                lyrics={song.lyrics}
                translations={song.lyricsTranslations}
                title={song.title}
              />
            ) : (
              <p className="text-muted">Lyrics will be added soon.</p>
            )}
          </div>

          {/* credits sidebar */}
          <aside>
            <div className="glass credits-card">
              <h3 className="font-serif" style={{ fontSize: '1.15rem', marginBottom: 18 }}>Credits</h3>
              <Credit label="Lyricist" value={song.lyricist} />
              {song.performingSingers.length > 0 && <Credit label="Singer(s)" value={song.performingSingers.join(', ')} />}
              {song.composer && <Credit label="Composer" value={song.composer} />}
              {collection && <Credit label="Collection" value={collection.title} />}
              {song.releaseYear && <Credit label="Year" value={String(song.releaseYear)} />}
              {song.language && <Credit label="Language" value={song.language} />}
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: 18 }}>Related songs</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {related.map((r) => (
                <Link key={r.id} href={`/songs/${r.slug}`} className="glass" style={{ textDecoration: 'none', padding: '12px 18px', borderRadius: 12 }}>
                  <span className="font-serif">{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .song-hero {
          padding: clamp(100px,16vh,180px) clamp(20px,6vw,96px) clamp(40px,6vh,80px);
        }
        .song-hero-inner { max-width: 800px; }
        .song-body-wrap {
          max-width: 1100px; margin: 0 auto;
          padding: clamp(32px,4vh,60px) clamp(20px,6vw,96px) clamp(60px,9vh,120px);
        }
        .song-grid {
          display: grid;
          grid-template-columns: minmax(0,2fr) minmax(0,1fr);
          gap: 48px;
        }
        .lyrics-body { font-size: clamp(1rem,1.5vw,1.15rem); }
        .credits-card { padding: 24px; border-radius: 18px; position: sticky; top: 90px; }

        @media (max-width: 820px) {
          .song-grid { grid-template-columns: 1fr; gap: 32px; }
          .credits-card { position: static; }
        }
        @media (max-width: 480px) {
          .song-hero { padding-left: 5vw; padding-right: 5vw; }
          .song-body-wrap { padding-left: 5vw; padding-right: 5vw; }
        }
      `}</style>
    </div>
  );
}

function Credit({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="text-muted" style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.18em' }}>{label}</div>
      <div style={{ fontSize: '.97rem', marginTop: 3, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}
