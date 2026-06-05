'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Song, Collection } from '@/lib/types';

type SortKey = 'az' | 'year' | 'views';

export default function LyricsLibrary({
  songs,
  collections,
  traditional,
}: {
  songs: Song[];
  collections: Collection[];
  traditional: boolean;
}) {
  const [q, setQ] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [lyricsOnly, setLyricsOnly] = useState(true);
  const [sort, setSort] = useState<SortKey>('az');

  // ── Facets derived from the songs themselves ──
  const { languages, genres } = useMemo(() => {
    const l = new Set<string>();
    const g = new Set<string>();
    songs.forEach((s) => {
      if (s.language) l.add(s.language);
      s.genre?.forEach((x) => g.add(x));
    });
    return { languages: [...l].sort(), genres: [...g].sort() };
  }, [songs]);

  const collMap = useMemo(() => {
    const m = new Map<string, Collection>();
    collections.forEach((c) => m.set(c.id, c));
    return m;
  }, [collections]);

  // ── Filtering + sorting ──
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = songs.filter((s) => {
      if (lyricsOnly && !(s.lyrics && s.lyrics.trim())) return false;
      if (collectionId && s.collectionId !== collectionId) return false;
      if (language && s.language !== language) return false;
      if (genre && !s.genre?.includes(genre)) return false;
      if (needle) {
        const hay = [
          s.title,
          s.lyrics,
          ...(s.altTitles ?? []),
          ...(s.performingSingers ?? []),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    out = [...out].sort((a, b) => {
      if (sort === 'year') return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
      if (sort === 'views') return (b.viewCount ?? 0) - (a.viewCount ?? 0);
      return a.title.localeCompare(b.title);
    });
    return out;
  }, [songs, q, collectionId, language, genre, lyricsOnly, sort]);

  const withLyricsCount = useMemo(
    () => songs.filter((s) => s.lyrics && s.lyrics.trim()).length,
    [songs],
  );

  const activeFilters =
    (collectionId ? 1 : 0) + (language ? 1 : 0) + (genre ? 1 : 0);

  function clearAll() {
    setCollectionId(null);
    setLanguage(null);
    setGenre(null);
    setQ('');
  }

  return (
    <div className={`lib${traditional ? ' lib--trad' : ''}`}>
      {/* ── Header ── */}
      <header className="lib-head">
        <p className="lib-eyebrow">{traditional ? 'ગ્રંથાલય · The Library' : 'The Lyric Library'}</p>
        <h1 className="font-serif lib-title">
          {traditional ? 'શબ્દ સંગ્રહ' : 'Every word, preserved'}
        </h1>
        <p className="lib-sub text-muted">
          {withLyricsCount} songs with full lyrics · {collections.length} collections · search, filter &amp; read.
        </p>
      </header>

      {/* ── Search ── */}
      <div className="lib-searchbar">
        <svg className="lib-search-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles, lyrics, singers…"
          aria-label="Search the lyric library"
        />
        {q && (
          <button className="lib-clear-q" onClick={() => setQ('')} aria-label="Clear search">✕</button>
        )}
      </div>

      {/* ── Filter rows ── */}
      <div className="lib-filters">
        {/* Collections */}
        {collections.length > 0 && (
          <div className="lib-chiprow">
            <span className="lib-chiplabel">Collection</span>
            <div className="lib-chips">
              <Chip active={!collectionId} onClick={() => setCollectionId(null)}>All</Chip>
              {collections.map((c) => (
                <Chip key={c.id} active={collectionId === c.id} onClick={() => setCollectionId(c.id)}>
                  {c.title}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 1 && (
          <div className="lib-chiprow">
            <span className="lib-chiplabel">Language</span>
            <div className="lib-chips">
              <Chip active={!language} onClick={() => setLanguage(null)}>All</Chip>
              {languages.map((l) => (
                <Chip key={l} active={language === l} onClick={() => setLanguage(l)}>{l}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {genres.length > 1 && (
          <div className="lib-chiprow">
            <span className="lib-chiplabel">Genre</span>
            <div className="lib-chips">
              <Chip active={!genre} onClick={() => setGenre(null)}>All</Chip>
              {genres.map((g) => (
                <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="lib-toolbar">
        <div className="lib-toolbar-left">
          <span className="lib-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          {(activeFilters > 0 || q) && (
            <button className="lib-clearall" onClick={clearAll}>Clear filters</button>
          )}
        </div>
        <div className="lib-toolbar-right">
          <label className="lib-toggle">
            <input type="checkbox" checked={lyricsOnly} onChange={(e) => setLyricsOnly(e.target.checked)} />
            <span>With lyrics only</span>
          </label>
          <select className="lib-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
            <option value="az">A–Z</option>
            <option value="year">Newest</option>
            <option value="views">Most read</option>
          </select>
        </div>
      </div>

      {/* ── Tiles ── */}
      {filtered.length === 0 ? (
        <div className="lib-empty">
          <span style={{ fontSize: '2.4rem', opacity: .4 }}>📖</span>
          <p className="text-muted">No songs match your filters.</p>
          <button className="lib-clearall" onClick={clearAll}>Reset</button>
        </div>
      ) : (
        <div className="lib-grid">
          {filtered.map((s) => {
            const coll = s.collectionId ? collMap.get(s.collectionId) : undefined;
            const hasLyrics = !!(s.lyrics && s.lyrics.trim());
            return (
              <Link key={s.id} href={`/songs/${s.slug}`} className="lib-card">
                <div
                  className="lib-card-art"
                  style={
                    s.artworkUrl
                      ? { backgroundImage: `url(${s.artworkUrl})` }
                      : undefined
                  }
                >
                  {!s.artworkUrl && <span className="lib-card-art-ph">❖</span>}
                  {hasLyrics && <span className="lib-badge">✦ Lyrics</span>}
                </div>
                <div className="lib-card-body">
                  <h3 className="font-serif lib-card-title">{s.title}</h3>
                  {s.performingSingers?.length > 0 && (
                    <p className="lib-card-singers text-muted">{s.performingSingers.join(', ')}</p>
                  )}
                  <div className="lib-card-meta">
                    {coll && <span className="lib-tag">{coll.title}</span>}
                    {s.language && <span className="lib-tag lib-tag-soft">{s.language}</span>}
                    {s.releaseYear ? <span className="lib-card-year text-muted">{s.releaseYear}</span> : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`lib-chip${active ? ' active' : ''}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

const styles = `
  .lib { max-width: 1180px; margin: 0 auto; padding: clamp(110px,15vh,170px) clamp(20px,6vw,80px) 100px; }

  .lib-eyebrow {
    text-transform: uppercase; letter-spacing: .32em; font-size: .72rem; font-weight: 600;
    color: var(--accent); margin: 0 0 12px;
  }
  .lib-title { font-size: clamp(2.2rem,6vw,4.2rem); font-weight: 600; line-height: 1.04; margin: 0 0 14px; letter-spacing: -.015em; }
  .lib--trad .lib-title { font-weight: 800; }
  .lib-sub { font-size: 1rem; margin: 0 0 36px; }

  /* Search */
  .lib-searchbar {
    position: relative; display: flex; align-items: center; margin-bottom: 26px;
  }
  .lib-search-ico { position: absolute; left: 20px; color: var(--muted); pointer-events: none; }
  .lib-searchbar input {
    width: 100%; background: var(--panel-solid); color: var(--text);
    border: 1px solid var(--line); border-radius: 100px;
    padding: 16px 50px 16px 52px; font-size: 1.02rem; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .lib-searchbar input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
  .lib-clear-q {
    position: absolute; right: 14px; width: 30px; height: 30px; border-radius: 50%;
    border: none; background: var(--panel); color: var(--text); cursor: pointer; font-size: .8rem;
  }

  /* Filters */
  .lib-filters { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
  .lib-chiprow { display: flex; align-items: flex-start; gap: 14px; }
  .lib-chiplabel {
    flex-shrink: 0; width: 86px; padding-top: 8px;
    font-size: .68rem; text-transform: uppercase; letter-spacing: .14em; font-weight: 700; color: var(--muted);
  }
  .lib-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .lib-chip {
    padding: 7px 15px; border-radius: 100px; font-size: .82rem; font-weight: 500;
    background: var(--panel); color: var(--text); border: 1px solid var(--line);
    cursor: pointer; transition: all .18s; white-space: nowrap;
  }
  .lib-chip:hover { border-color: var(--accent); transform: translateY(-1px); }
  .lib-chip.active { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 600; }
  .lib--trad .lib-chip.active { color: #1a1200; }

  /* Toolbar */
  .lib-toolbar {
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
    padding: 14px 0; margin-bottom: 22px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  }
  .lib-toolbar-left { display: flex; align-items: center; gap: 16px; }
  .lib-count { font-size: .9rem; font-weight: 600; }
  .lib-clearall { background: none; border: none; color: var(--accent); cursor: pointer; font-size: .85rem; font-weight: 600; }
  .lib-toolbar-right { display: flex; align-items: center; gap: 18px; }
  .lib-toggle { display: flex; align-items: center; gap: 8px; font-size: .85rem; cursor: pointer; user-select: none; }
  .lib-toggle input { width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer; }
  .lib-sort {
    background: var(--panel-solid); color: var(--text); border: 1px solid var(--line);
    border-radius: 10px; padding: 8px 12px; font-size: .85rem; cursor: pointer; outline: none;
  }

  /* Grid */
  .lib-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;
  }
  .lib-card {
    display: flex; flex-direction: column; text-decoration: none; color: var(--text);
    background: var(--panel); border: 1px solid var(--line); border-radius: 16px; overflow: hidden;
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  }
  .lib-card:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 16px 40px rgba(0,0,0,.28); }
  .lib-card-art {
    position: relative; aspect-ratio: 1 / 1; background-size: cover; background-position: center;
    background-color: var(--panel-solid);
    display: flex; align-items: center; justify-content: center;
  }
  .lib-card-art-ph { font-size: 2.4rem; color: var(--accent); opacity: .5; }
  .lib-badge {
    position: absolute; top: 10px; left: 10px;
    background: color-mix(in srgb, var(--accent) 92%, black); color: var(--bg);
    font-size: .64rem; font-weight: 700; letter-spacing: .06em;
    padding: 4px 9px; border-radius: 100px;
  }
  .lib--trad .lib-badge { color: #1a1200; }
  .lib-card-body { padding: 14px 15px 16px; display: flex; flex-direction: column; gap: 7px; flex: 1; }
  .lib-card-title { font-size: 1.08rem; line-height: 1.25; margin: 0; font-weight: 600; }
  .lib--trad .lib-card-title { font-style: italic; }
  .lib-card-singers { font-size: .8rem; margin: 0; line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .lib-card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: auto; padding-top: 6px; }
  .lib-tag {
    font-size: .66rem; font-weight: 600; letter-spacing: .02em;
    padding: 3px 8px; border-radius: 6px;
    background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent);
  }
  .lib-tag-soft { background: var(--panel-solid); color: var(--muted); }
  .lib-card-year { font-size: .72rem; margin-left: auto; }

  /* Empty */
  .lib-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 80px 0; text-align: center; }

  @media (max-width: 640px) {
    .lib-chiprow { flex-direction: column; gap: 8px; }
    .lib-chiplabel { width: auto; padding-top: 0; }
    .lib-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
    .lib-card-title { font-size: .98rem; }
  }
`;
