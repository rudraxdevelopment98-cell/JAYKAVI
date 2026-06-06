'use client';

import { useState, useEffect } from 'react';

interface Translation {
  language: string;
  text: string;
}

// ── Gujarati → Latin transliteration ────────────────────────────────────────
// Lightweight, dependency-free. Covers the Gujarati Unicode block well enough
// for reading aloud; not a scholarly scheme.
const GU_VOWELS: Record<string, string> = {
  'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ee', 'ઉ': 'u', 'ઊ': 'oo',
  'ઋ': 'ru', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au', 'અં': 'an', 'અઃ': 'ah',
};
const GU_MATRA: Record<string, string> = {
  'ા': 'aa', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo', 'ૃ': 'ru',
  'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ં': 'n', 'ઃ': 'h', 'ઁ': 'n',
};
const GU_CONS: Record<string, string> = {
  'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
  'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh', 'ઞ': 'ny',
  'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
  'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
  'પ': 'p', 'ફ': 'ph', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
  'ય': 'y', 'ર': 'r', 'લ': 'l', 'ળ': 'l', 'વ': 'v',
  'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h',
};
const GU_DIGITS: Record<string, string> = {
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
  '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
};
const VIRAMA = '્';

function transliterateGujarati(text: string): string {
  let out = '';
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (GU_CONS[ch]) {
      out += GU_CONS[ch];
      if (next === VIRAMA) { i++; continue; }          // half consonant, no vowel
      if (next && GU_MATRA[next]) { out += GU_MATRA[next]; i++; }
      else if (!next || !(GU_MATRA[next] || GU_CONS[next])) { out += 'a'; }
      else { out += 'a'; }
      continue;
    }
    if (GU_VOWELS[ch]) { out += GU_VOWELS[ch]; continue; }
    if (GU_MATRA[ch]) { out += GU_MATRA[ch]; continue; }
    if (GU_DIGITS[ch]) { out += GU_DIGITS[ch]; continue; }
    out += ch; // punctuation, spaces, latin, etc.
  }
  return out;
}

function hasGujarati(text: string): boolean {
  return /[઀-૿]/.test(text);
}

export default function LyricsViewer({
  lyrics,
  translations = [],
  title,
}: {
  lyrics: string;
  translations?: Translation[];
  title: string;
}) {
  const [fontSize, setFontSize] = useState(1.08); // rem
  const [shared, setShared] = useState(false);
  const [romanize, setRomanize] = useState(false);
  // 'original' or a translation language name
  const [view, setView] = useState<'original' | string>('original');

  const baseText =
    view === 'original'
      ? lyrics
      : translations.find((t) => t.language === view)?.text ?? lyrics;

  const activeText = romanize ? transliterateGujarati(baseText) : baseText;
  const canRomanize = hasGujarati(lyrics);

  // Discourage casual copying: block copy/cut/contextmenu within the lyrics body.
  useEffect(() => {
    function blockKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (!t?.closest?.('[data-protected]')) return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 's', 'p'].includes(k)) {
        e.preventDefault();
      }
    }
    document.addEventListener('keydown', blockKey);
    return () => document.removeEventListener('keydown', blockKey);
  }, []);

  async function shareLyrics() {
    const shareData = {
      title,
      text: `${title} — by Jayesh Prajapati "JAYKAVI"`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* user cancelled — ignore */
    }
  }

  function renderLyrics(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) =>
      line.trim() === '' ? (
        <div key={i} style={{ height: 16 }} />
      ) : (
        <p key={i} style={{ margin: 0, lineHeight: 1.9 }}>
          {line}
        </p>
      ),
    );
  }

  const ctrlBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 13px',
    borderRadius: 100,
    border: '1px solid var(--line)',
    background: 'var(--panel)',
    color: 'var(--text)',
    fontSize: '.82rem',
    cursor: 'pointer',
    transition: 'background .2s, border-color .2s',
  };

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 22,
        }}
      >
        {/* Font size */}
        <div style={{ display: 'inline-flex', gap: 4 }}>
          <button
            type="button"
            aria-label="Decrease text size"
            style={ctrlBtn}
            onClick={() => setFontSize((s) => Math.max(0.85, +(s - 0.12).toFixed(2)))}
          >
            A−
          </button>
          <button
            type="button"
            aria-label="Increase text size"
            style={ctrlBtn}
            onClick={() => setFontSize((s) => Math.min(1.8, +(s + 0.12).toFixed(2)))}
          >
            A+
          </button>
        </div>

        {/* Romanize / transliteration toggle */}
        {canRomanize && (
          <button
            type="button"
            style={{ ...ctrlBtn, opacity: romanize ? 1 : 0.7, borderColor: romanize ? 'var(--gold,#f59e0b)' : 'var(--line)' }}
            onClick={() => setRomanize((v) => !v)}
            title="Show pronunciation in English letters"
          >
            {romanize ? '↩ ગુજરાતી' : 'અ→a Romanize'}
          </button>
        )}

        {/* Share (link only) */}
        <button type="button" style={ctrlBtn} onClick={shareLyrics}>
          {shared ? '✓ Link copied' : '↗ Share'}
        </button>

        {/* Translation switcher */}
        {translations.length > 0 && (
          <div style={{ display: 'inline-flex', gap: 4, marginLeft: 'auto' }}>
            <button
              type="button"
              style={{ ...ctrlBtn, opacity: view === 'original' ? 1 : 0.55 }}
              onClick={() => setView('original')}
            >
              Original
            </button>
            {translations.map((t) => (
              <button
                key={t.language}
                type="button"
                style={{ ...ctrlBtn, opacity: view === t.language ? 1 : 0.55 }}
                onClick={() => setView(t.language)}
              >
                {t.language}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lyrics body — copy-protected */}
      <div
        className="font-serif lyrics-body lyrics-protected"
        data-i18n
        data-protected="true"
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ fontSize: `${fontSize}rem`, transition: 'font-size .15s ease', position: 'relative' }}
      >
        {renderLyrics(activeText)}
      </div>

      {/* Copyright notice */}
      <p
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--line)',
          fontSize: '.78rem',
          color: 'var(--muted)',
          lineHeight: 1.6,
        }}
      >
        © {new Date().getFullYear()} Jayesh Prajapati “JAYKAVI”. All rights reserved.
        These lyrics are the original copyrighted work of the author. Reproduction,
        copying, or redistribution in any form without written permission is prohibited.
      </p>

      <style>{`
        .lyrics-protected {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        .lyrics-protected::selection { background: transparent; }
        .lyrics-protected *::selection { background: transparent; }
      `}</style>
    </div>
  );
}
