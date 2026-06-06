'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Hit {
  type: 'song' | 'singer' | 'collection' | 'post';
  title: string;
  subtitle?: string | null;
  href: string;
  image?: string | null;
}

const TYPE_META: Record<Hit['type'], { label: string; icon: string; color: string }> = {
  song:       { label: 'Song',       icon: '🎵', color: '#f59e0b' },
  singer:     { label: 'Singer',     icon: '🎤', color: '#a78bfa' },
  collection: { label: 'Collection', icon: '📀', color: '#34d399' },
  post:       { label: 'Post',       icon: '📝', color: '#60a5fa' },
};

const QUICK_LINKS: Hit[] = [
  { type: 'song',       title: 'All Songs',           href: '/songs' },
  { type: 'collection', title: 'Explore Collections', href: '/explore' },
  { type: 'singer',     title: 'All Singers',         href: '/singers' },
  { type: 'post',       title: 'Blog',                href: '/blog' },
];

const RECENT_KEY = 'cmdk_recent';
const MAX_RECENT = 5;

function loadRecent(): Hit[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function saveRecent(hits: Hit[], newHit: Hit) {
  const filtered = hits.filter((h) => h.href !== newHit.href).slice(0, MAX_RECENT - 1);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([newHit, ...filtered])); } catch { /* noop */ }
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(245,158,11,.35)', color: '#fde68a', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function groupHits(hits: Hit[]): Array<{ type: Hit['type']; items: Hit[] }> {
  const order: Hit['type'][] = ['song', 'singer', 'collection', 'post'];
  return order
    .map((type) => ({ type, items: hits.filter((h) => h.type === type) }))
    .filter((g) => g.items.length > 0);
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<Hit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setHits([]);
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === '/' && !open) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !(e.target as HTMLElement)?.isContentEditable) {
          e.preventDefault();
          setOpen(true);
        }
      } else if (e.key === 'Escape') {
        close();
      }
    }
    function onOpenEvent() { setOpen(true); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-search', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-search', onOpenEvent);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setRecent(loadRecent());
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setHits([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setHits(data.hits ?? []);
        setActive(0);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, open]);

  const results: Hit[] = q.trim() ? hits : (recent.length > 0 ? recent : QUICK_LINKS);
  const showSection = !q.trim();

  function go(hit: Hit) {
    if (q.trim()) {
      const prev = loadRecent();
      saveRecent(prev, hit);
    }
    close();
    router.push(hit.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => {
        const next = Math.min(a + 1, results.length - 1);
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => {
        const next = Math.max(a - 1, 0);
        scrollActiveIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active]);
    }
  }

  function scrollActiveIntoView(idx: number) {
    const el = listRef.current?.querySelector(`[data-idx="${idx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  if (!open) return null;

  const grouped = q.trim() ? groupHits(hits) : null;

  // Flat index lookup for grouped layout
  const flatResults: Hit[] = grouped
    ? grouped.flatMap((g) => g.items)
    : results;

  return (
    <div
      className="cmdk-overlay"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Input ── */}
        <div className="cmdk-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onInputKey}
            placeholder="Search songs, singers, collections…"
            className="cmdk-input"
          />
          {loading && (
            <span className="cmdk-spinner" aria-label="Searching" />
          )}
          <kbd className="cmdk-kbd">ESC</kbd>
        </div>

        {/* ── Results ── */}
        <div className="cmdk-results" ref={listRef}>

          {/* Loading */}
          {loading && <div className="cmdk-empty">Searching…</div>}

          {/* No results */}
          {!loading && q.trim() && hits.length === 0 && (
            <div className="cmdk-empty">
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}>🔍</span>
              No results for &ldquo;{q}&rdquo;
              <span style={{ display: 'block', fontSize: '.78rem', marginTop: 6, color: 'var(--muted,#888)' }}>
                Try a different spelling or browse the quick links below
              </span>
            </div>
          )}

          {/* Grouped results when searching */}
          {!loading && q.trim() && grouped && grouped.length > 0 && (() => {
            let flatIdx = 0;
            return grouped.map((group) => (
              <div key={group.type}>
                <div className="cmdk-group-label">
                  <span style={{ color: TYPE_META[group.type].color }}>{TYPE_META[group.type].icon}</span>
                  {' '}{TYPE_META[group.type].label}{group.items.length > 1 ? 's' : ''}
                  <span className="cmdk-group-count">{group.items.length}</span>
                </div>
                {group.items.map((hit) => {
                  const idx = flatIdx++;
                  return (
                    <HitRow
                      key={hit.href}
                      hit={hit}
                      idx={idx}
                      active={active === idx}
                      query={q}
                      onHover={setActive}
                      onClick={go}
                    />
                  );
                })}
              </div>
            ));
          })()}

          {/* Empty query: recent or quick links */}
          {!loading && !q.trim() && (
            <>
              <p className="cmdk-section">
                {recent.length > 0 ? 'Recent' : 'Quick links'}
                {recent.length > 0 && (
                  <button
                    className="cmdk-section-clear"
                    onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                  >
                    Clear
                  </button>
                )}
              </p>
              {flatResults.map((hit, idx) => (
                <HitRow
                  key={hit.href + idx}
                  hit={hit}
                  idx={idx}
                  active={active === idx}
                  query=""
                  onHover={setActive}
                  onClick={go}
                />
              ))}
              {recent.length > 0 && (
                <>
                  <p className="cmdk-section" style={{ marginTop: 8 }}>Quick links</p>
                  {QUICK_LINKS.map((hit, i) => {
                    const idx = flatResults.length + i;
                    return (
                      <HitRow
                        key={hit.href}
                        hit={hit}
                        idx={idx}
                        active={active === idx}
                        query=""
                        onHover={setActive}
                        onClick={go}
                      />
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cmdk-footer">
          <span><kbd className="cmdk-kbd">↑</kbd><kbd className="cmdk-kbd">↓</kbd> navigate</span>
          <span><kbd className="cmdk-kbd">↵</kbd> open</span>
          <span className="cmdk-footer-spacer" />
          <span className="cmdk-footer-hint">⌘K to toggle</span>
        </div>
      </div>

      <style>{`
        .cmdk-overlay {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(0,0,0,.6); backdrop-filter: blur(6px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: clamp(60px,10vh,120px) 16px 16px;
          animation: cmdkFade .12s ease;
        }
        @keyframes cmdkFade { from { opacity: 0 } to { opacity: 1 } }

        .cmdk-panel {
          width: 100%; max-width: 660px;
          background: var(--bg,#0d0d0f); color: var(--text,#eee);
          border: 1px solid var(--line,#2a2a2a); border-radius: 20px;
          box-shadow: 0 32px 96px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.04);
          overflow: hidden;
          animation: cmdkPop .16s cubic-bezier(.18,.9,.38,1);
        }
        @keyframes cmdkPop {
          from { transform: translateY(-10px) scale(.97); opacity:.5 }
          to   { transform: none; opacity: 1 }
        }

        .cmdk-input-row {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 20px; border-bottom: 1px solid var(--line,#2a2a2a);
          color: var(--muted,#999);
        }
        .cmdk-input {
          flex: 1; background: transparent; border: 0; outline: none;
          font-size: 1.1rem; color: var(--text,#eee);
          font-family: inherit;
        }
        .cmdk-input::placeholder { color: var(--muted,#666); }

        /* Spinner */
        .cmdk-spinner {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 2px solid var(--line,#333);
          border-top-color: var(--accent,#f59e0b);
          border-radius: 50%;
          animation: cmdkSpin .6s linear infinite;
        }
        @keyframes cmdkSpin { to { transform: rotate(360deg) } }

        .cmdk-results {
          max-height: min(58vh, 460px); overflow-y: auto; padding: 10px 8px;
          scroll-behavior: smooth;
        }
        .cmdk-results::-webkit-scrollbar { width: 4px; }
        .cmdk-results::-webkit-scrollbar-track { background: transparent; }
        .cmdk-results::-webkit-scrollbar-thumb { background: var(--line,#333); border-radius: 4px; }

        .cmdk-group-label {
          display: flex; align-items: center; gap: 6px;
          font-size: .68rem; text-transform: uppercase; letter-spacing: .12em;
          color: var(--muted,#888); padding: 10px 10px 4px; margin: 0;
          font-weight: 600;
        }
        .cmdk-group-count {
          margin-left: auto; font-size: .65rem;
          background: var(--panel,rgba(255,255,255,.06));
          border: 1px solid var(--line,#2a2a2a);
          color: var(--muted,#888); padding: 0 6px; border-radius: 100px;
        }

        .cmdk-section {
          display: flex; align-items: center;
          font-size: .68rem; text-transform: uppercase; letter-spacing: .12em;
          color: var(--muted,#888); padding: 8px 10px 4px; margin: 0;
          font-weight: 600;
        }
        .cmdk-section-clear {
          margin-left: auto; font-size: .65rem; font-weight: 400;
          text-transform: none; letter-spacing: 0;
          color: var(--muted,#777); background: none; border: none;
          cursor: pointer; padding: 2px 6px; border-radius: 4px;
          transition: color .15s;
        }
        .cmdk-section-clear:hover { color: var(--text,#eee); }

        .cmdk-empty {
          padding: 36px 28px; text-align: center;
          color: var(--muted,#888); font-size: .95rem; line-height: 1.6;
        }

        .cmdk-item {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 9px 10px; border-radius: 12px; border: 0; cursor: pointer;
          background: transparent; color: inherit; text-align: left;
          transition: background .1s;
        }
        .cmdk-item--active { background: var(--panel,rgba(255,255,255,.07)); }
        .cmdk-item:focus-visible { outline: 2px solid var(--accent,#f59e0b); }

        .cmdk-thumb {
          width: 40px; height: 40px; border-radius: 10px; object-fit: cover;
          flex-shrink: 0; background: var(--panel,#1c1c1e);
        }
        .cmdk-thumb--icon {
          display: grid; place-items: center; font-size: 1.15rem;
        }

        .cmdk-item-text {
          display: flex; flex-direction: column; min-width: 0; flex: 1;
          gap: 2px;
        }
        .cmdk-item-title {
          font-size: .95rem; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; line-height: 1.3;
        }
        .cmdk-item-sub {
          font-size: .78rem; color: var(--muted,#888);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .cmdk-badge {
          flex-shrink: 0; font-size: .62rem; padding: 2px 7px; border-radius: 100px;
          background: var(--panel,rgba(255,255,255,.06));
          color: var(--muted,#aaa);
          border: 1px solid var(--line,#2a2a2a);
          letter-spacing: .04em;
        }

        .cmdk-footer {
          display: flex; align-items: center; gap: 14px; padding: 10px 18px;
          border-top: 1px solid var(--line,#2a2a2a);
          font-size: .72rem; color: var(--muted,#777);
        }
        .cmdk-footer-spacer { flex: 1; }
        .cmdk-footer-hint { color: var(--muted,#666); font-size: .68rem; }

        .cmdk-kbd {
          font-family: inherit; font-size: .66rem; padding: 1px 6px; border-radius: 5px;
          border: 1px solid var(--line,#333); background: var(--panel,rgba(255,255,255,.05));
          color: var(--muted,#aaa); margin: 0 1px;
        }
      `}</style>
    </div>
  );
}

function HitRow({
  hit, idx, active, query, onHover, onClick,
}: {
  hit: Hit; idx: number; active: boolean; query: string;
  onHover: (i: number) => void; onClick: (h: Hit) => void;
}) {
  const meta = TYPE_META[hit.type];
  return (
    <button
      data-idx={idx}
      onClick={() => onClick(hit)}
      onMouseEnter={() => onHover(idx)}
      className={`cmdk-item${active ? ' cmdk-item--active' : ''}`}
    >
      {hit.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hit.image} alt="" className="cmdk-thumb" />
      ) : (
        <span className="cmdk-thumb cmdk-thumb--icon">{meta.icon}</span>
      )}
      <span className="cmdk-item-text">
        <span className="cmdk-item-title">{highlight(hit.title, query)}</span>
        {hit.subtitle && (
          <span className="cmdk-item-sub">{highlight(hit.subtitle, query)}</span>
        )}
      </span>
      <span className="cmdk-badge" style={{ borderColor: `${meta.color}30`, color: meta.color }}>
        {meta.label}
      </span>
    </button>
  );
}
