'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Song } from '@/lib/types';

const GRADS = [
  'linear-gradient(160deg,#5B2A86,#1C1C22)',
  'linear-gradient(160deg,#2D6BFF,#1C1C22)',
  'linear-gradient(160deg,#D7263D,#1C1C22)',
  'linear-gradient(160deg,#22918f,#1C1C22)',
  'linear-gradient(160deg,#7a3fb0,#14141a)',
];
function gradFor(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % GRADS.length;
  return GRADS[h];
}

export default function SongCard({ song, index = 0 }: { song: Song; index?: number }) {
  const singers = song.performingSingers?.join(', ');
  const platforms = song.platformLinks?.filter((p) => p.url).map((p) => p.platform) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4, scale: 1.01 }}
      style={{
        borderRadius: 20, overflow: 'hidden', background: 'var(--panel-solid)',
        border: '1px solid var(--line)', cursor: 'pointer', height: '100%',
      }}
    >
      <Link href={`/songs/${song.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div style={{
          height: 240, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 22,
          background: song.artworkUrl ? 'var(--panel-solid)' : gradFor(song.slug),
          overflow: 'hidden',
        }}>
          {song.artworkUrl && (
            <img
              src={song.artworkUrl}
              alt={song.title}
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {song.genre?.[0] && (
            <span style={{
              position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,.4)',
              backdropFilter: 'blur(6px)', color: '#fff', fontSize: '.66rem', padding: '6px 12px',
              borderRadius: 100, letterSpacing: '.12em', textTransform: 'uppercase', zIndex: 1,
            }}>{song.genre[0]}</span>
          )}
          {!song.artworkUrl && (
            <div className="font-serif" style={{ color: '#fff', fontSize: '1.5rem', lineHeight: 1.1, textShadow: '0 2px 20px rgba(0,0,0,.5)' }}>
              {song.title}
            </div>
          )}
        </div>
        <div style={{ padding: '18px 20px 22px' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{song.title}</h3>
          <div className="text-muted" style={{ fontSize: '.84rem', marginTop: 5 }}>
            {singers || song.language}{song.releaseYear ? ` · ${song.releaseYear}` : ''}
          </div>
          {platforms.length > 0 && (
            <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
              {platforms.slice(0, 3).map((p) => (
                <span key={p} className="text-muted" style={{ fontSize: '.68rem', padding: '4px 10px', borderRadius: 100, border: '1px solid var(--line)', textTransform: 'capitalize' }}>
                  {p.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
