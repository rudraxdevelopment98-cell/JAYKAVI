'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

const DURATION = 5000;

export default function TopVideosCarousel({ songs }: { songs: Song[] }) {
  const items = songs
    .filter((s) => s.embed?.youtubeId)
    .slice(0, 5);

  const n = items.length;
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused || n < 2) return;
    setProgress(0);
    const startTime = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(p);
      if (elapsed >= DURATION) {
        clearInterval(id);
        setCur((c) => (c + 1) % n);
      }
    }, 50);
    return () => clearInterval(id);
  }, [cur, paused, n]);

  function goTo(i: number) {
    setCur(i);
    setProgress(0);
  }

  if (n < 1) return null;

  const song = items[cur];
  const ytId = song.embed!.youtubeId!;

  return (
    <div
      className="tvc"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Main featured tile ── */}
      <div className="tvc-stage">
        {/* All images stacked — only active one visible via opacity transition */}
        {items.map((item, i) => (
          <img
            key={item.embed!.youtubeId}
            src={`https://img.youtube.com/vi/${item.embed!.youtubeId}/hqdefault.jpg`}
            alt={item.title}
            className={`tvc-img${i === cur ? ' tvc-img--on' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}

        {/* Gradient overlays */}
        <div className="tvc-grad-top" />
        <div className="tvc-grad-bot" />

        {/* Rank badge */}
        <div className="tvc-rank font-serif" aria-hidden>
          {cur + 1}
        </div>

        {/* View count */}
        <div className="tvc-views">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C20.27 7.61 17 4.5 12 4.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
          </svg>
          {fmt(song.viewCount)} views
        </div>

        {/* Play overlay — visible on hover */}
        <a
          href={`https://www.youtube.com/watch?v=${ytId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tvc-play-btn"
          aria-label={`Watch ${song.title} on YouTube`}
        >
          <span className="tvc-play-icon">
            <svg viewBox="0 0 24 24" fill="white" width="32" height="32" aria-hidden>
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          </span>
        </a>

        {/* Caption at bottom */}
        <div className="tvc-caption">
          <Link href={`/songs/${song.slug}`} className="tvc-caption-title font-serif">
            {song.title}
          </Link>
          {song.performingSingers?.length > 0 && (
            <div className="tvc-caption-sub">
              {song.performingSingers.join(', ')}
              {song.releaseYear ? ` · ${song.releaseYear}` : ''}
            </div>
          )}
          <div className="tvc-caption-btns">
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tvc-btn-yt"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-2.75C14.42 1.5 11.58 1.5 10.18 3.94A4.83 4.83 0 016.41 6.69C4.17 7.89 4.17 10.11 6.41 11.31a4.83 4.83 0 013.77 2.75c1.4 2.44 4.24 2.44 5.64 0a4.83 4.83 0 013.77-2.75c2.24-1.2 2.24-3.42 0-4.62z"/>
              </svg>
              Watch on YouTube
            </a>
            <Link href={`/songs/${song.slug}`} className="tvc-btn-lyr">
              View Lyrics
            </Link>
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          className="tvc-arrow tvc-arrow-l"
          onClick={() => goTo((cur - 1 + n) % n)}
          aria-label="Previous video"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          className="tvc-arrow tvc-arrow-r"
          onClick={() => goTo((cur + 1) % n)}
          aria-label="Next video"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* ── Preview strip ── */}
      <div className="tvc-strip" role="tablist" aria-label="Video list">
        {items.map((item, i) => {
          const id = item.embed!.youtubeId!;
          const active = i === cur;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              aria-label={`Video ${i + 1}: ${item.title}`}
              className={`tvc-preview${active ? ' tvc-preview--on' : ''}`}
              onClick={() => goTo(i)}
            >
              <img
                src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                alt={item.title}
                className="tvc-preview-img"
                loading="lazy"
              />
              <div className="tvc-preview-scrim" />
              <span className="tvc-preview-num font-serif" aria-hidden>{i + 1}</span>
              {/* Progress bar for active tile */}
              {active && (
                <span
                  className="tvc-preview-bar"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
