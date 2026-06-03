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
  const hasArt = !!song.artworkUrl;

  return (
    <motion.div
      className="sc-wrap"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.25) }}
    >
      <Link href={`/songs/${song.slug}`} className="sc-link">
        {/* Thumbnail */}
        <div
          className={`sc-art${hasArt ? '' : ' sc-art-fallback'}`}
          style={hasArt ? undefined : { background: gradFor(song.slug) }}
        >
          {hasArt && (
            <img
              src={song.artworkUrl!}
              alt={song.title}
              loading="lazy"
              className="sc-art-img"
            />
          )}
          {song.genre?.[0] && (
            <span className="sc-genre">{song.genre[0]}</span>
          )}
          {/* Large title overlay — shown on desktop fallback, hidden on mobile */}
          {!hasArt && (
            <div className="font-serif sc-art-title">{song.title}</div>
          )}
        </div>

        {/* Info */}
        <div className="sc-info">
          <h3 className="font-serif sc-title">{song.title}</h3>
          <div className="sc-sub text-muted">
            {singers || song.language}
            {song.releaseYear ? ` · ${song.releaseYear}` : ''}
          </div>
          {platforms.length > 0 && (
            <div className="sc-platforms">
              {platforms.slice(0, 3).map((p) => (
                <span key={p} className="sc-platform text-muted">
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
