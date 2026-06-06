import { ImageResponse } from 'next/og';
import { getSongBySlug } from '@/lib/data';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'JAYKAVI song';

export default async function OgImage({ params }: { params: { slug: string } }) {
  let song: Awaited<ReturnType<typeof getSongBySlug>> | undefined;
  try {
    song = await getSongBySlug(params.slug);
  } catch {
    song = undefined;
  }

  const title = song?.title ?? 'JAYKAVI';
  const subtitle = song?.subtitle ?? '';
  const singers = song?.performingSingers?.join(' · ') ?? '';
  const artwork = song?.artworkUrl || '';

  // Keep very long YouTube titles from overflowing the canvas.
  const displayTitle = title.length > 90 ? title.slice(0, 88) + '…' : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #0c0a09 0%, #1c1410 55%, #0c0a09 100%)',
          fontFamily: 'serif',
          overflow: 'hidden',
        }}
      >
        {/* Ambient artwork wash */}
        {artwork && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork}
            alt=""
            width={630}
            height={630}
            style={{
              position: 'absolute',
              right: -60,
              top: -40,
              width: 720,
              height: 720,
              objectFit: 'cover',
              opacity: 0.22,
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* Gold side accent */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: '#f59e0b' }} />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '70px 80px',
            width: artwork ? 760 : 1040,
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#f4efe4', letterSpacing: 1 }}>
              JAY<span style={{ color: '#f59e0b' }}>KAVI</span>
            </div>
            <div style={{ fontSize: 20, color: 'rgba(244,239,228,.55)' }}>· Gujarati Lyrics</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: displayTitle.length > 48 ? 56 : 72, fontWeight: 700, color: '#f8f4ec', lineHeight: 1.06 }}>
              {displayTitle}
            </div>
            {subtitle && subtitle !== title && (
              <div style={{ fontSize: 30, color: '#f0c069', fontStyle: 'italic' }}>{subtitle}</div>
            )}
            {singers && (
              <div style={{ fontSize: 28, color: 'rgba(244,239,228,.7)' }}>Sung by {singers}</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: 'rgba(244,239,228,.55)' }}>
            <div>Lyrics · Credits · Listen</div>
          </div>
        </div>

        {/* Artwork card */}
        {artwork && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork}
            alt=""
            width={300}
            height={300}
            style={{
              position: 'absolute',
              right: 80,
              top: 165,
              width: 300,
              height: 300,
              objectFit: 'cover',
              borderRadius: 24,
              border: '4px solid rgba(245,158,11,.5)',
            }}
          />
        )}
      </div>
    ),
    { ...size },
  );
}
