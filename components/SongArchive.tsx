'use client';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import SongCard from './SongCard';

interface Facets {
  languages: string[]; genres: string[]; moods: string[];
  years: number[]; singers: string[]; platforms: string[];
}

// ---- FilterDropdown ----

interface DropdownOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  placeholder?: string;
}

function FilterDropdown({ value, options, onChange, placeholder = 'All' }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setOpen(false);
  }, [onChange]);

  const triggerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--panel-solid)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: 100,
    padding: '9px 16px',
    fontSize: '.85rem',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
  };

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: '100%',
    background: 'var(--panel)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    zIndex: 50,
    maxHeight: open ? 260 : 0,
    overflowY: 'auto',
    opacity: open ? 1 : 0,
    transition: 'max-height 0.22s ease, opacity 0.18s ease',
    pointerEvents: open ? 'auto' : 'none',
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={triggerStyle}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: 0.6,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div style={panelStyle} role="listbox">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(opt.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                width: '100%',
                padding: '9px 14px',
                fontSize: '.85rem',
                background: 'transparent',
                color: isSelected ? 'var(--accent)' : 'var(--text)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--accent) 15%, transparent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- SongArchive ----

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

  const singerOptions: DropdownOption[] = [
    { value: '', label: 'All singers' },
    ...facets.singers.map((s) => ({ value: s, label: s })),
  ];

  const genreOptions: DropdownOption[] = [
    { value: '', label: 'All genres' },
    ...facets.genres.map((g) => ({ value: g, label: g })),
  ];

  const yearOptions: DropdownOption[] = [
    { value: '', label: 'All years' },
    ...facets.years.map((y) => ({ value: String(y), label: String(y) })),
  ];

  const sortOptions: DropdownOption[] = [
    { value: 'most-viewed', label: 'Most viewed' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'az', label: 'A–Z' },
  ];

  return (
    <div>
      {/* search + filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, singer, or lyrics…"
          style={{ ...selectStyle, flex: '1 1 260px', minWidth: 200, cursor: 'text' }}
        />
        <FilterDropdown
          value={singer}
          options={singerOptions}
          onChange={(val) => setParam('singer', val || null)}
          placeholder="All singers"
        />
        <FilterDropdown
          value={genre}
          options={genreOptions}
          onChange={(val) => setParam('genre', val || null)}
          placeholder="All genres"
        />
        {facets.years.length > 0 && (
          <FilterDropdown
            value={year}
            options={yearOptions}
            onChange={(val) => setParam('year', val || null)}
            placeholder="All years"
          />
        )}
        <FilterDropdown
          value={sort}
          options={sortOptions}
          onChange={(val) => setParam('sort', val)}
          placeholder="Sort"
        />
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
        <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 22 }}>
          {filtered.map((s, i) => <SongCard key={s.id} song={s} index={i} />)}
        </div>
      )}
    </div>
  );
}
