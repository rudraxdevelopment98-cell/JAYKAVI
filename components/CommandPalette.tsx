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

const TYPE_META: Record<Hit['type'], { label: string; icon: string }> = {
  song:       { label: 'Song',       icon: '🎵' },
  singer:     { label: 'Singer',     icon: '🎤' },
  collection: { label: 'Collection', icon: '📀' },
  post:       { label: 'Post',       icon: '📝' },
};

const QUICK_LINKS: Hit[] = [
  { type: 'song', title: 'All Songs', href: '/songs' },
  { type: 'collection', title: 'Explore Collections', href: '/explore' },
  { type: 'singer', title: 'All Singers', href: '/singers' },
  { type: 'post', title: 'Blog', href: '/blog' },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setHits([]);
    setActive(0);
  }, []);

  // Open with ⌘K / Ctrl+K (or "/")
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

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Debounced fetch
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

  const results = q.trim() ? hits : QUICK_LINKS;

  function go(hit: Hit) {
    close();
    router.push(hit.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active]); }
  }

  if (!open) return null;

  return (
    <div
      className="cmdk-overlay"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className="cmdk-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search songs, singers, collections…"
            className="cmdk-input"
          />
          <kbd className="cmdk-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="cmdk-results">
          {loading && <div className="cmdk-empty">Searching…</div>}
          {!loading && q.trim() && results.length === 0 && (
            <div className="cmdk-empty">No results for “{q}”.</div>
          )}
          {!loading && !q.trim() && (
            <p className="cmdk-section">Quick links</p>
          )}
          {results.map((hit, i) => (
            <button
              key={hit.href + i}
              onClick={() => go(hit)}
              onMouseEnter={() => setActive(i)}
              className={`cmdk-item${i === active ? ' cmdk-item--active' : ''}`}
            >
              {hit.image ? (
                <img src={hit.image} alt="" className="cmdk-thumb" />
              ) : (
                <span className="cmdk-thumb cmdk-thumb--icon">{TYPE_META[hit.type].icon}</span>
              )}
              <span className="cmdk-item-text">
                <span className="cmdk-item-title">{hit.title}</span>
                {hit.subtitle && <span className="cmdk-item-sub">{hit.subtitle}</span>}
              </span>
              <span className="cmdk-badge">{TYPE_META[hit.type].label}</span>
            </button>
          ))}
        </div>

        <div className="cmdk-footer">
          <span><kbd className="cmdk-kbd">↑</kbd><kbd className="cmdk-kbd">↓</kbd> navigate</span>
          <span><kbd className="cmdk-kbd">↵</kbd> open</span>
          <span><kbd className="cmdk-kbd">⌘K</kbd> toggle</span>
        </div>
      </div>

      <style>{`
        .cmdk-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: clamp(60px,12vh,140px) 16px 16px;
          animation: cmdkFade .12s ease;
        }
        @keyframes cmdkFade { from { opacity: 0 } to { opacity: 1 } }
        .cmdk-panel {
          width: 100%; max-width: 600px;
          background: var(--bg,#0d0d0f); color: var(--text,#eee);
          border: 1px solid var(--line,#2a2a2a); border-radius: 16px;
          box-shadow: 0 24px 80px rgba(0,0,0,.5);
          overflow: hidden;
          animation: cmdkPop .14s cubic-bezier(.2,.8,.2,1);
        }
        @keyframes cmdkPop { from { transform: translateY(-8px) scale(.98); opacity:.6 } to { transform:none; opacity:1 } }
        .cmdk-input-row {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 18px; border-bottom: 1px solid var(--line,#2a2a2a);
          color: var(--muted,#999);
        }
        .cmdk-input {
          flex: 1; background: transparent; border: 0; outline: none;
          font-size: 1.05rem; color: var(--text,#eee);
        }
        .cmdk-input::placeholder { color: var(--muted,#777); }
        .cmdk-results { max-height: min(56vh,440px); overflow-y: auto; padding: 8px; }
        .cmdk-section {
          font-size: .7rem; text-transform: uppercase; letter-spacing: .12em;
          color: var(--muted,#888); padding: 8px 10px 4px; margin: 0;
        }
        .cmdk-empty { padding: 28px; text-align: center; color: var(--muted,#888); font-size: .9rem; }
        .cmdk-item {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 9px 10px; border-radius: 10px; border: 0; cursor: pointer;
          background: transparent; color: inherit; text-align: left;
          transition: background .12s;
        }
        .cmdk-item--active { background: var(--panel,rgba(255,255,255,.07)); }
        .cmdk-thumb {
          width: 40px; height: 40px; border-radius: 8px; object-fit: cover;
          flex-shrink: 0; background: var(--panel,#1c1c1e);
        }
        .cmdk-thumb--icon { display: grid; place-items: center; font-size: 1.1rem; }
        .cmdk-item-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .cmdk-item-title { font-size: .95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cmdk-item-sub { font-size: .78rem; color: var(--muted,#888); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cmdk-badge {
          flex-shrink: 0; font-size: .68rem; padding: 3px 8px; border-radius: 100px;
          background: var(--panel,rgba(255,255,255,.07)); color: var(--muted,#aaa);
          border: 1px solid var(--line,#2a2a2a);
        }
        .cmdk-footer {
          display: flex; gap: 16px; padding: 10px 16px;
          border-top: 1px solid var(--line,#2a2a2a);
          font-size: .72rem; color: var(--muted,#888);
        }
        .cmdk-kbd {
          font-family: inherit; font-size: .68rem; padding: 1px 6px; border-radius: 5px;
          border: 1px solid var(--line,#333); background: var(--panel,rgba(255,255,255,.05));
          color: var(--muted,#aaa); margin: 0 1px;
        }
      `}</style>
    </div>
  );
}
