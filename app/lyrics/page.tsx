'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getSongsWithLyrics, getAllSongs } from '@/lib/data';

export default function LyricsPage() {
  const withLyrics = getSongsWithLyrics();
  const all = getAllSongs();
  const list = withLyrics.length > 0 ? withLyrics : all; // fall back to titles before lyrics are added
  const [q, setQ] = useState('');

  const filtered = list.filter((s) => {
    const n = q.toLowerCase();
    return !n || s.title.toLowerCase().includes(n) || s.lyrics?.toLowerCase().includes(n);
  }).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div style={{ padding: '16vh 6vw 9vh', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>Lyrics</p>
      <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)', fontWeight: 600, margin: '12px 0 28px' }}>The lyric library</h1>

      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search within lyrics and titles…"
        style={{ width: '100%', background: 'var(--panel-solid)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 100, padding: '14px 22px', fontSize: '1rem', marginBottom: 30 }}
      />

      {withLyrics.length === 0 && (
        <p className="text-muted" style={{ marginBottom: 24 }}>Full lyrics are being added. For now this lists every song — open one to read its lyrics as they go live.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filtered.map((s) => (
          <Link key={s.id} href={`/songs/${s.slug}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '18px 4px', borderBottom: '1px solid var(--line)', textDecoration: 'none', alignItems: 'baseline' }}>
            <span className="font-serif" style={{ fontSize: '1.25rem' }}>{s.title}</span>
            <span className="text-muted" style={{ fontSize: '.82rem' }}>{s.performingSingers?.join(', ')}</span>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-muted">No matches.</p>}
      </div>
    </div>
  );
}
