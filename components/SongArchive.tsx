'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import SongCard from './SongCard';

interface Facets {
  languages: string[]; genres: string[]; moods: string[];
  years: number[]; singers: string[]; platforms: string[];
}

export default function SongArchive({ songs, facets }: { songs: Song[]; facets: Facets }) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const singer = params.get('singer') ?? '';
  const genre = params.get('genre') ?? '';
  const year = params.get('year') ?? '';
  const sort = params.get('sort') ?? 'most-viewed';
  const view = params.get('view') ?? 'grid';

  // debounce the search box into the URL
  useEffect(() => {
    const t = setTimeout(() => setParam('q', q || null), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/songs?${next.toString()}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    let list = [...songs];
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((s) =>
        s.title.toLowerCase().includes(needle) ||
        s.altTitles?.some((a) => a.toLowerCase().includes(needle)) ||
        s.performingSingers?.some((p) => p.toLowerCase().includes(needle)) ||
        s.lyrics?.toLowerCase().includes(needle)
      );
    }
    if (singer) list = list.filter((s) => s.performingSingers?.includes(singer));
    if (genre) list = list.filter((s) => s.genre?.includes(genre));
    if (year) list = list.filter((s) => String(s.releaseYear) === year);

    switch (sort) {
      case 'newest': list.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0)); break;
      case 'oldest': list.sort((a, b) => (a.releaseYear ?? 9999) - (b.releaseYear ?? 9999)); break;
      case 'az': list.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: list.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    }
    return list;
  }, [songs, q, singer, genre, year, sort]);

  const selectStyle: React.CSSProperties = {
    background: 'var(--panel-solid)', color: 'var(--text)', border: '1px solid var(--line)',
    borderRadius: 100, padding: '9px 16px', fontSize: '.85rem', cursor: 'pointer',
  };

  return (
    <div>
      {/* search + filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, singer, or lyrics…"
          style={{ ...selectStyle, flex: '1 1 260px', minWidth: 200, cursor: 'text' }}
        />
        <select value={singer} onChange={(e) => setParam('singer', e.target.value || null)} style={selectStyle}>
          <option value="">All singers</option>
          {facets.singers.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={genre} onChange={(e) => setParam('genre', e.target.value || null)} style={selectStyle}>
          <option value="">All genres</option>
          {facets.genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {facets.years.length > 0 && (
          <select value={year} onChange={(e) => setParam('year', e.target.value || null)} style={selectStyle}>
            <option value="">All years</option>
            {facets.years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <select value={sort} onChange={(e) => setParam('sort', e.target.value)} style={selectStyle}>
          <option value="most-viewed">Most viewed</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A–Z</option>
        </select>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button onClick={() => setParam('view', 'grid')} style={{ ...selectStyle, opacity: view === 'grid' ? 1 : .5 }}>Grid</button>
          <button onClick={() => setParam('view', 'list')} style={{ ...selectStyle, opacity: view === 'list' ? 1 : .5 }}>List</button>
        </div>
      </div>

      <p className="text-muted" style={{ fontSize: '.85rem', marginBottom: 20 }}>
        {filtered.length} {filtered.length === 1 ? 'song' : 'songs'}
      </p>

      {filtered.length === 0 ? (
        <p className="text-muted">No songs match your filters yet.</p>
      ) : view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((s) => (
            <Link key={s.id} href={`/songs/${s.slug}`} style={{
              display: 'flex', justifyContent: 'space-between', gap: 16, padding: '16px 18px',
              borderBottom: '1px solid var(--line)', textDecoration: 'none', alignItems: 'center',
            }}>
              <span className="font-serif" style={{ fontSize: '1.1rem' }}>{s.title}</span>
              <span className="text-muted" style={{ fontSize: '.82rem', textAlign: 'right' }}>
                {s.performingSingers?.join(', ') || s.language}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 22 }}>
          {filtered.map((s, i) => <SongCard key={s.id} song={s} index={i} />)}
        </div>
      )}
    </div>
  );
}
