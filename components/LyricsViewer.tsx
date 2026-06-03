'use client';

import { useState } from 'react';

interface Translation {
  language: string;
  text: string;
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
  const [copied, setCopied] = useState(false);
  // 'original' or a translation language name
  const [view, setView] = useState<'original' | string>('original');

  const activeText =
    view === 'original'
      ? lyrics
      : translations.find((t) => t.language === view)?.text ?? lyrics;

  async function copyLyrics() {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${activeText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  async function shareLyrics() {
    const shareData = {
      title,
      text: `${title} — lyrics by JAYKAVI`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

        {/* Copy */}
        <button type="button" style={ctrlBtn} onClick={copyLyrics}>
          {copied ? '✓ Copied' : '⧉ Copy lyrics'}
        </button>

        {/* Share */}
        <button type="button" style={ctrlBtn} onClick={shareLyrics}>
          ↗ Share
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

      {/* Lyrics body */}
      <div
        className="font-serif lyrics-body"
        style={{ fontSize: `${fontSize}rem`, transition: 'font-size .15s ease' }}
      >
        {renderLyrics(activeText)}
      </div>
    </div>
  );
}
