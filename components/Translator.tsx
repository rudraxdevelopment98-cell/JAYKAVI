'use client';

/*
 * Site-wide language switcher.
 *
 * One floating button → choose Original / English / ગુજરાતી / हिन्दी.
 * Only elements explicitly marked with the `data-i18n` attribute are translated
 * (e.g. song lyrics) — titles, navigation and chrome are left untouched.
 *
 * Translation uses the free, key-less Google translate endpoint from the browser.
 * Results are cached in-memory and in localStorage so repeat views are instant.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Lang = 'original' | 'en' | 'gu' | 'hi';

const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'original', label: 'Original', short: 'A' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'gu', label: 'ગુજરાતી', short: 'ગુ' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
];

const STORE_KEY = 'jk-lang';
const CACHE_KEY = 'jk-tr-cache';

// in-memory translation cache: `${target}::${source}` -> translated
const memCache = new Map<string, string>();

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>;
      for (const k in obj) memCache.set(k, obj[k]);
    }
  } catch { /* ignore */ }
}
function persistCache() {
  try {
    const obj: Record<string, string> = {};
    // cap stored entries so localStorage can't bloat
    let n = 0;
    for (const [k, v] of memCache) {
      obj[k] = v;
      if (++n > 2000) break;
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}

async function translateOne(text: string, target: Lang): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || target === 'original') return text;
  const key = `${target}::${trimmed}`;
  const cached = memCache.get(key);
  if (cached !== undefined) return cached;

  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}` +
      `&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    // data[0] = array of [translatedChunk, originalChunk, ...]
    const out = (data?.[0] ?? []).map((seg: any[]) => seg?.[0] ?? '').join('');
    const result = out || text;
    // preserve original leading/trailing whitespace of the text node
    const lead = text.match(/^\s*/)?.[0] ?? '';
    const tail = text.match(/\s*$/)?.[0] ?? '';
    const final = lead + result.trim() + tail;
    memCache.set(key, final);
    return final;
  } catch {
    return text;
  }
}

// run async tasks with limited concurrency
async function pool<T>(items: T[], limit: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

export default function Translator() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('original');
  const [busy, setBusy] = useState(false);
  const originals = useRef<WeakMap<Text, string>>(new WeakMap());

  // collect translatable text nodes currently in the DOM
  const collectNodes = useCallback((): Text[] => {
    const hosts = Array.from(document.querySelectorAll('[data-i18n]'));
    const nodes: Text[] = [];
    for (const host of hosts) {
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        if (n.nodeValue && n.nodeValue.trim()) nodes.push(n as Text);
        n = walker.nextNode();
      }
    }
    return nodes;
  }, []);

  const apply = useCallback(
    async (target: Lang) => {
      const nodes = collectNodes();
      if (nodes.length === 0) return;

      // remember originals once
      for (const node of nodes) {
        if (!originals.current.has(node)) originals.current.set(node, node.nodeValue ?? '');
      }

      if (target === 'original') {
        for (const node of nodes) {
          const orig = originals.current.get(node);
          if (orig !== undefined) node.nodeValue = orig;
        }
        return;
      }

      setBusy(true);
      await pool(nodes, 6, async (node) => {
        const orig = originals.current.get(node) ?? node.nodeValue ?? '';
        const translated = await translateOne(orig, target);
        node.nodeValue = translated;
      });
      persistCache();
      setBusy(false);
    },
    [collectNodes],
  );

  // initial load: restore preference + cache
  useEffect(() => {
    loadCache();
    try {
      const saved = localStorage.getItem(STORE_KEY) as Lang | null;
      if (saved && saved !== 'original') setLang(saved);
    } catch { /* ignore */ }
  }, []);

  // re-apply whenever the language or the route (page content) changes
  useEffect(() => {
    if (lang === 'original') return;
    // small delay so the new page's DOM is mounted
    const t = setTimeout(() => apply(lang), 120);
    return () => clearTimeout(t);
  }, [lang, pathname, apply]);

  function choose(code: Lang) {
    setLang(code);
    try { localStorage.setItem(STORE_KEY, code); } catch { /* ignore */ }
    setOpen(false);
    apply(code);
  }

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="jk-translator" data-no-i18n>
      {open && (
        <div className="jk-tr-menu" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="menuitemradio"
              aria-checked={lang === l.code}
              className={`jk-tr-item${lang === l.code ? ' active' : ''}`}
              onClick={() => choose(l.code)}
            >
              <span className="jk-tr-short">{l.short}</span>
              <span>{l.label}</span>
              {lang === l.code && <span className="jk-tr-check">✓</span>}
            </button>
          ))}
          <div className="jk-tr-note">Translates lyrics &amp; marked text only</div>
        </div>
      )}

      <button
        className="jk-tr-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
      >
        {busy ? (
          <span className="jk-tr-spin" aria-hidden />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
            <path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
          </svg>
        )}
        <span className="jk-tr-fab-label">{current.short}</span>
      </button>

      <style>{`
        .jk-translator { position: fixed; right: 20px; bottom: 20px; z-index: 180; }
        .jk-tr-fab {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 16px; border-radius: 100px; cursor: pointer;
          background: var(--accent); color: var(--bg); border: none;
          box-shadow: 0 8px 28px rgba(0,0,0,.32); font-weight: 700; font-size: .82rem;
          transition: transform .2s, box-shadow .2s;
        }
        .jk-tr-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 34px rgba(0,0,0,.4); }
        .jk-tr-fab-label { letter-spacing: .04em; }
        .jk-tr-menu {
          position: absolute; bottom: calc(100% + 12px); right: 0; min-width: 210px;
          background: var(--panel-solid); border: 1px solid var(--line); border-radius: 14px;
          padding: 6px; box-shadow: 0 18px 50px rgba(0,0,0,.4); overflow: hidden;
          animation: jkTrIn .18s ease;
        }
        @keyframes jkTrIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .jk-tr-item {
          display: flex; align-items: center; gap: 12px; width: 100%;
          padding: 10px 12px; border: none; background: none; cursor: pointer;
          color: var(--text); font-size: .9rem; border-radius: 9px; text-align: left;
          transition: background .15s;
        }
        .jk-tr-item:hover { background: var(--panel); }
        .jk-tr-item.active { background: color-mix(in srgb, var(--accent) 16%, transparent); }
        .jk-tr-short {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 26px; border-radius: 6px; font-size: .72rem; font-weight: 700;
          background: var(--panel); border: 1px solid var(--line); flex-shrink: 0;
        }
        .jk-tr-check { margin-left: auto; color: var(--accent); font-weight: 700; }
        .jk-tr-note { font-size: .68rem; color: var(--muted); padding: 8px 12px 6px; border-top: 1px solid var(--line); margin-top: 4px; }
        .jk-tr-spin {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid color-mix(in srgb, var(--bg) 40%, transparent); border-top-color: var(--bg);
          animation: jkSpin .7s linear infinite; display: inline-block;
        }
        @keyframes jkSpin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .jk-translator { right: 14px; bottom: 14px; } }
      `}</style>
    </div>
  );
}
