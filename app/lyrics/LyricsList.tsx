'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';

export default function LyricsList({
  withLyrics,
  all,
}: {
  withLyrics: Song[];
  all: Song[];
}) {
  const [q, setQ] = useState('');

  const filtered = all
    .filter((s) => {
      const n = q.toLowerCase();
      return (
        !n ||
        s.title.toLowerCase().includes(n) ||
        s.lyrics?.toLowerCase().includes(n)
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search within lyrics and titles…"
        style={{
          width: '100%',
          background: 'var(--panel-solid)',
          color: 'var(--text)',
          border: '1px solid var(--line)',
          borderRadius: 100,
          padding: '14px 22px',
          fontSize: '1rem',
          marginBottom: 30,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filtered.map((s) => (
          <Link
            key={s.id}
            href={`/songs/${s.slug}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              padding: '18px 4px',
              borderBottom: '1px solid var(--line)',
              textDecoration: 'none',
              alignItems: 'baseline',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flex: 1, minWidth: 0 }}>
              <span className="font-serif" style={{ fontSize: '1.2rem' }}>
                {s.title}
              </span>
              {s.lyrics ? (
                <span className="accent" style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ✦ Lyrics
                </span>
              ) : null}
            </div>
            <span className="text-muted" style={{ fontSize: '.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {s.performingSingers?.join(', ')}
            </span>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-muted">No matches.</p>}
      </div>
    </>
  );
}
