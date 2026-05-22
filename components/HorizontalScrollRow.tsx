'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Song } from '@/lib/types';
import SongCard from './SongCard';

export default function HorizontalScrollRow({
  songs, ranked = false,
}: { songs: Song[]; ranked?: boolean }) {
  if (!songs || songs.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 22, overflowX: 'auto', padding: '10px 4px 28px', scrollSnapType: 'x mandatory' }}>
      {songs.map((song, i) => (
        <div key={song.id} style={{ flex: '0 0 290px', scrollSnapAlign: 'start', position: 'relative' }}>
          {ranked && (
            <div className="font-serif" aria-hidden style={{
              position: 'absolute', left: -14, bottom: -10, fontSize: '7rem', lineHeight: 1,
              fontWeight: 700, color: 'var(--panel-solid)', WebkitTextStroke: '2px var(--line)',
              zIndex: 0, pointerEvents: 'none',
            }}>{i + 1}</div>
          )}
          <div style={{ position: 'relative', zIndex: 1, marginLeft: ranked ? 28 : 0 }}>
            <SongCard song={song} index={i} />
          </div>
        </div>
      ))}
    </div>
  );
}
