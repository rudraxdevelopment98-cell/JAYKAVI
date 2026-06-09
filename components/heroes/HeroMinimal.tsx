'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lyricist } from '@/lib/types';

export default function HeroMinimal({ l }: { l: Lyricist }) {
  const words     = l.name.trim().split(/\s+/);
  const firstName = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const lastName  = words.length > 1 ? words[words.length - 1] : l.name;
  const hasStats  = l.stats?.songsWritten || l.stats?.songsPublishedOnStreaming || l.careerStartYear;

  return (
    <header className="hm-root">
      <div className="hm-inner">

        {/* ── Header metadata row ───────────────────── */}
        <motion.div className="hm-meta"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7 }}>
          <span className="hm-meta-label">{l.title ?? 'Lyricist'}</span>
          <span className="hm-meta-dot" aria-hidden />
          <span className="hm-meta-label">{l.languages?.[0] ?? 'Gujarati'}</span>
          {l.careerStartYear && (
            <><span className="hm-meta-dot" aria-hidden /><span className="hm-meta-label">Est. {l.careerStartYear}</span></>
          )}
        </motion.div>

        {/* ── Top rule ──────────────────────────────── */}
        <motion.div className="hm-rule"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          style={{ transformOrigin: 'left' }}
          transition={{ delay: 0.2, duration: 0.75, ease: [.25, .46, .45, .94] }} />

        {/* ── Name block ────────────────────────────── */}
        <div className="hm-name-block">
          {firstName && (
            <motion.div className="hm-name-first font-serif"
              initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.72, ease: [.25, .46, .45, .94] }}>
              {firstName}
            </motion.div>
          )}
          <motion.div className="hm-name-last font-serif"
            initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: firstName ? 0.54 : 0.38, duration: 0.72, ease: [.25, .46, .45, .94] }}>
            {lastName}
          </motion.div>
        </div>

        {/* ── Bottom rule ───────────────────────────── */}
        <motion.div className="hm-rule"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          style={{ transformOrigin: 'right' }}
          transition={{ delay: 0.65, duration: 0.75, ease: [.25, .46, .45, .94] }} />

        {/* ── Pen name + tagline row ─────────────────── */}
        <motion.div className="hm-sub"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88 }}>
          {l.penName && (
            <span className="hm-pen font-serif">&ldquo;{l.penName}&rdquo;</span>
          )}
          {l.penName && l.tagline && <span className="hm-sub-sep" aria-hidden />}
          {l.tagline && <p className="hm-tagline text-muted">{l.tagline}</p>}
        </motion.div>

        {/* ── Links ─────────────────────────────────── */}
        <motion.div className="hm-links"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}>
          <Link href="/journey" className="hm-link">
            Explore the Journey <span className="hm-arrow">→</span>
          </Link>
          <span className="hm-link-sep" aria-hidden />
          <Link href="/songs" className="hm-link hm-link-dim">
            Browse Songs <span className="hm-arrow">→</span>
          </Link>
        </motion.div>

        {/* ── Stats row ─────────────────────────────── */}
        {hasStats && (
          <motion.div className="hm-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}>
            {l.stats?.songsWritten && (
              <HmStat n={l.stats.songsWritten} label="Songs Written" />
            )}
            {l.stats?.songsPublishedOnStreaming && (
              <HmStat n={l.stats.songsPublishedOnStreaming} label="On Streaming" />
            )}
            {l.careerStartYear && (
              <HmStat n={String(l.careerStartYear)} label="Writing Since" />
            )}
          </motion.div>
        )}

        {/* Year watermark (decorative, desktop) */}
        {l.careerStartYear && (
          <div className="hm-watermark font-serif" aria-hidden>{l.careerStartYear}</div>
        )}
      </div>

      <style>{`
        /* ── Root ─────────────────────────────────────── */
        .hm-root {
          min-height: 100svh;
          background: var(--bg);
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .hm-inner {
          width: 100%;
          padding: 110px 7vw 90px;
          position: relative;
          z-index: 2;
        }

        /* ── Meta row ─────────────────────────────────── */
        .hm-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 30px;
        }
        .hm-meta-label {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.42em;
          color: var(--muted);
        }
        .hm-meta-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--muted);
          opacity: 0.4;
          flex-shrink: 0;
        }

        /* ── Rules ────────────────────────────────────── */
        .hm-rule {
          height: 1px;
          background: var(--text);
          opacity: 0.12;
          width: 100%;
        }

        /* ── Name block ───────────────────────────────── */
        .hm-name-block { padding: 22px 0 18px; }
        .hm-name-first {
          font-size: clamp(2rem, 7vw, 7.5rem);
          font-weight: 200;
          line-height: 0.88;
          letter-spacing: -0.04em;
          opacity: 0.45;
          margin-bottom: 0.02em;
        }
        .hm-name-last {
          font-size: clamp(4.5rem, 15vw, 15rem);
          font-weight: 900;
          line-height: 0.85;
          letter-spacing: -0.045em;
          margin-left: -0.015em;
        }

        /* ── Sub row ──────────────────────────────────── */
        .hm-sub {
          display: flex;
          align-items: baseline;
          gap: 22px;
          margin-top: 30px;
          flex-wrap: wrap;
        }
        .hm-pen {
          font-size: clamp(0.88rem, 1.5vw, 1.2rem);
          font-style: italic;
          color: var(--accent);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hm-sub-sep {
          width: 1px; height: 18px;
          background: var(--line);
          flex-shrink: 0;
          align-self: center;
        }
        .hm-tagline {
          margin: 0;
          font-size: clamp(0.88rem, 1.2vw, 1.05rem);
          line-height: 1.78;
          max-width: 56ch;
        }

        /* ── Links ────────────────────────────────────── */
        .hm-links {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-top: 36px;
          flex-wrap: wrap;
        }
        .hm-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          color: var(--text);
          border-bottom: 1.5px solid currentColor;
          padding-bottom: 2px;
          transition: color .2s;
        }
        .hm-link:hover { color: var(--accent); }
        .hm-link-dim { opacity: 0.5; }
        .hm-link-dim:hover { opacity: 1; }
        .hm-arrow { transition: transform .2s; display: inline-block; }
        .hm-link:hover .hm-arrow { transform: translateX(4px); }
        .hm-link-sep { width: 1px; height: 16px; background: var(--line); }

        /* ── Stats ────────────────────────────────────── */
        .hm-stats {
          display: flex;
          align-items: flex-start;
          gap: 44px;
          margin-top: 54px;
          padding-top: 28px;
          border-top: 1px solid var(--line);
          flex-wrap: wrap;
        }
        .hm-stat-n {
          display: block;
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(1.35rem, 2.5vw, 2rem);
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .hm-stat-label {
          display: block;
          font-size: 0.59rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--muted);
          margin-top: 5px;
        }

        /* Year watermark */
        .hm-watermark {
          position: absolute;
          right: 3vw;
          top: 50%;
          transform: translateY(-50%);
          font-size: clamp(6rem, 22vw, 24rem);
          font-weight: 900;
          opacity: 0.025;
          line-height: 1;
          letter-spacing: -0.05em;
          pointer-events: none;
          z-index: 0;
          user-select: none;
        }

        /* ── Responsive ───────────────────────────────── */
        @media (max-width: 768px) {
          .hm-inner  { padding: 100px 6vw 80px; }
          .hm-links  { gap: 16px; }
        }
        @media (max-width: 480px) {
          .hm-inner  { padding: 90px 5vw 80px; }
          .hm-links  { flex-direction: column; align-items: flex-start; gap: 14px; }
          .hm-link-sep { display: none; }
          .hm-stats  { gap: 28px; margin-top: 40px; }
          .hm-watermark { display: none; }
        }
      `}</style>
    </header>
  );
}

function HmStat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <span className="hm-stat-n">{n}</span>
      <span className="hm-stat-label">{label}</span>
    </div>
  );
}
