'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Song } from '@/lib/types';
import SongArchive from '@/components/SongArchive';

interface Facets {
  languages: string[]; genres: string[]; moods: string[];
  years: number[]; singers: string[]; platforms: string[];
}
interface CollectionLite {
  id: string; slug: string; title: string; description: string;
  coverUrl: string; year: number | null; songCount: number;
}
interface SingerLite {
  id: string; param: string; name: string; photoUrl: string; songCount: number;
}

type Tab = 'songs' | 'collections' | 'singers';
const TABS: { key: Tab; label: string; tradLabel: string }[] = [
  { key: 'songs',       label: 'Songs',       tradLabel: 'ભજન' },
  { key: 'collections', label: 'Collections', tradLabel: 'સંગ્રહ' },
  { key: 'singers',     label: 'Singers',     tradLabel: 'ગાયક' },
];

export default function ExploreTabs({
  songs, facets, collections, singers, traditional,
}: {
  songs: Song[];
  facets: Facets;
  collections: CollectionLite[];
  singers: SingerLite[];
  traditional: boolean;
}) {
  const params = useSearchParams();
  const initial = (params.get('tab') as Tab) || 'songs';
  const [tab, setTab] = useState<Tab>(
    ['songs', 'collections', 'singers'].includes(initial) ? initial : 'songs',
  );

  // Tabs are pure client state. Sync the URL with history.replaceState so the
  // deep-link stays shareable WITHOUT a Next.js navigation (which, on this
  // force-dynamic page, would re-run the server and flash the Suspense fallback).
  function selectTab(t: Tab) {
    setTab(t);
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      sp.set('tab', t);
      window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
    }
  }

  return (
    <div className={`exp${traditional ? ' exp--trad' : ''}`}>
      {/* ── Header ── */}
      <header className="exp-head">
        <p className="exp-eyebrow">{traditional ? 'સંગ્રહાલય' : 'Browse'}</p>
        <h1 className="font-serif exp-title">
          {traditional ? 'સંગ્રહ' : 'Explore the catalogue'}
        </h1>
      </header>

      {/* ── Tab bar ── */}
      <div className="exp-tabs" role="tablist">
        {TABS.map((t) => {
          const count =
            t.key === 'songs' ? songs.length
            : t.key === 'collections' ? collections.length
            : singers.length;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`exp-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => selectTab(t.key)}
            >
              <span>{traditional ? t.tradLabel : t.label}</span>
              <span className="exp-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Panels ── */}
      <div className="exp-panel">
        {tab === 'songs' && (
          <Suspense fallback={<p className="text-muted">Loading…</p>}>
            <SongArchive songs={songs} facets={facets} />
          </Suspense>
        )}

        {tab === 'collections' && (
          collections.length === 0 ? (
            <p className="text-muted">No collections yet.</p>
          ) : (
            <div className="exp-grid exp-grid-coll">
              {collections.map((c) => (
                <Link key={c.id} href={`/collections/${c.slug}`} className="exp-card">
                  <div
                    className="exp-card-cover"
                    style={c.coverUrl ? { backgroundImage: `url(${c.coverUrl})` } : undefined}
                  >
                    <div className="exp-card-scrim" />
                    <div className="exp-card-cover-title font-serif">{c.title}</div>
                  </div>
                  <div className="exp-card-info">
                    {c.description && <p className="exp-card-desc text-muted">{c.description}</p>}
                    <div className="exp-card-foot">
                      <span className="accent">{c.songCount} song{c.songCount !== 1 ? 's' : ''}</span>
                      {c.year && <span className="text-muted">{c.year}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {tab === 'singers' && (
          singers.length === 0 ? (
            <p className="text-muted">No singers yet.</p>
          ) : (
            <div className="exp-grid exp-grid-sing">
              {singers.map((s) => (
                <Link key={s.id} href={`/singers/${s.param}`} className="exp-card">
                  <div
                    className="exp-card-photo"
                    style={s.photoUrl ? { backgroundImage: `url(${s.photoUrl})` } : undefined}
                  >
                    {!s.photoUrl && <span className="exp-card-photo-ph">🎤</span>}
                    <div className="exp-card-scrim" />
                    <div className="exp-card-cover-title font-serif">{s.name}</div>
                  </div>
                  <div className="exp-card-foot exp-card-foot-pad">
                    <span className="accent">{s.songCount} song{s.songCount !== 1 ? 's' : ''}</span>
                    <span className="text-muted">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .exp { max-width: 1200px; margin: 0 auto; padding: clamp(110px,15vh,170px) clamp(20px,6vw,80px) 100px; }
  .exp-eyebrow { text-transform: uppercase; letter-spacing: .3em; font-size: .72rem; font-weight: 600; color: var(--accent); margin: 0 0 10px; }
  .exp-title { font-size: clamp(2.2rem,6vw,4rem); font-weight: 600; line-height: 1.05; margin: 0 0 28px; letter-spacing: -.015em; }
  .exp--trad .exp-title { font-weight: 800; }

  /* Tab bar */
  .exp-tabs {
    display: flex; gap: 4px; flex-wrap: wrap;
    border-bottom: 1px solid var(--line); margin-bottom: 34px;
  }
  .exp-tab {
    position: relative; display: inline-flex; align-items: center; gap: 9px;
    background: none; border: none; cursor: pointer;
    padding: 14px 20px 12px; font-size: 1rem; font-weight: 600; color: var(--muted);
    transition: color .2s; font-family: inherit; border-bottom: 2px solid transparent;
    margin-bottom: -1px;
  }
  .exp-tab:hover { color: var(--text); }
  .exp-tab.active { color: var(--text); border-bottom-color: var(--accent); }
  .exp-tab-count {
    font-size: .7rem; font-weight: 700; padding: 2px 8px; border-radius: 100px;
    background: var(--panel); color: var(--muted); border: 1px solid var(--line);
  }
  .exp-tab.active .exp-tab-count { background: var(--accent); color: var(--bg); border-color: var(--accent); }
  .exp--trad .exp-tab.active .exp-tab-count { color: #1a1200; }

  /* Grids */
  .exp-grid { display: grid; gap: 20px; }
  .exp-grid-coll { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  .exp-grid-sing { grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); }

  .exp-card {
    display: flex; flex-direction: column; text-decoration: none; color: var(--text);
    background: var(--panel); border: 1px solid var(--line); border-radius: 18px; overflow: hidden;
    transition: transform .25s, box-shadow .25s, border-color .25s;
  }
  .exp-card:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 18px 44px rgba(0,0,0,.3); }

  .exp-card-cover, .exp-card-photo {
    position: relative; background-size: cover; background-position: center;
    background-color: var(--panel-solid); display: flex; align-items: flex-end;
  }
  .exp-card-cover { height: 165px; }
  .exp-card-photo { height: 195px; justify-content: center; }
  .exp-card-photo-ph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 3rem; opacity: .25; }
  .exp-card-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.72) 0%, transparent 60%); }
  .exp-card-cover-title {
    position: relative; z-index: 1; padding: 0 16px 14px; color: #fff;
    font-size: 1.3rem; font-weight: 400; line-height: 1.2; font-style: italic;
  }
  .exp-card-info { padding: 14px 18px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .exp-card-desc { font-size: .85rem; margin: 0; line-height: 1.5;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .exp-card-foot { display: flex; align-items: center; justify-content: space-between; font-size: .82rem; font-weight: 600; margin-top: auto; }
  .exp-card-foot-pad { padding: 12px 16px 14px; }

  @media (max-width: 560px) {
    .exp-grid-coll, .exp-grid-sing { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
    .exp-card-cover-title { font-size: 1.05rem; }
  }
`;
