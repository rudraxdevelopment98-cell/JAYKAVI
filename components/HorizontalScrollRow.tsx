'use client';
import type { Song } from '@/lib/types';
import SongCard from './SongCard';

export default function HorizontalScrollRow({
  songs, ranked = false,
}: { songs: Song[]; ranked?: boolean }) {
  if (!songs || songs.length === 0) return null;

  return (
    <div className="h-scroll-row">
      {songs.map((song, i) => (
        <div key={song.id} className="h-scroll-item" style={{ position: 'relative' }}>
          {ranked && (
            <div className="font-serif" aria-hidden style={{
              position: 'absolute', left: -10, bottom: -8, fontSize: 'clamp(4rem,7vw,7rem)', lineHeight: 1,
              fontWeight: 700, color: 'var(--panel-solid)', WebkitTextStroke: '2px var(--line)',
              zIndex: 0, pointerEvents: 'none', userSelect: 'none',
            }}>{i + 1}</div>
          )}
          <div style={{ position: 'relative', zIndex: 1, marginLeft: ranked ? 24 : 0 }}>
            <SongCard song={song} index={i} />
          </div>
        </div>
      ))}
    </div>
  );
}
