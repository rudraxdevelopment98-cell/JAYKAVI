'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lyricist } from '@/lib/types';
import { TextReveal } from '@/components/Reveal';

export default function HeroPortrait({ l, portraitUrl }: { l: Lyricist; portraitUrl?: string | null }) {
  const words = l.name.trim().split(/\s+/);
  const firstName = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const lastName  = words.length > 1 ? words[words.length - 1] : l.name;
  const hasStats  = l.stats?.songsWritten || l.stats?.songsPublishedOnStreaming || l.careerStartYear;

  return (
    <header className="hp-root">
      <div className="hp-layout">

        {/* ── Photo panel ───────────────────────────────── */}
        <motion.div className="hp-photo-side"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: [.25, .46, .45, .94] }}>
          {portraitUrl ? (
            <img src={portraitUrl} alt={l.name} className="hp-photo" />
          ) : (
            <div className="hp-photo-placeholder">
              <span className="hp-initial font-serif">{l.name[0]}</span>
            </div>
          )}
          <div className="hp-photo-vignette" />
          {/* Thin accent line on the right edge */}
          <div className="hp-photo-edge" aria-hidden />
        </motion.div>

        {/* ── Text panel ────────────────────────────────── */}
        <div className="hp-content">
          <motion.p className="hp-eyebrow"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}>
            {l.title ?? 'Lyricist'}
          </motion.p>

          <h1 className="hp-name font-serif">
            {firstName && (
              <span className="hp-name-first">
                <TextReveal delay={0.45}>{firstName}</TextReveal>
              </span>
            )}
            <span className="hp-name-last">
              <TextReveal delay={firstName ? 0.6 : 0.45}>{lastName}</TextReveal>
            </span>
            {l.penName && (
              <motion.span className="hp-pen"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}>
                &ldquo;{l.penName}&rdquo;
              </motion.span>
            )}
          </h1>

          <motion.p className="hp-tagline text-muted"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}>
            {l.tagline}
          </motion.p>

          {hasStats && (
            <motion.div className="hp-stats"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.25 }}>
              {l.stats?.songsWritten && <HpStat n={l.stats.songsWritten} label="Songs Written" />}
              {l.stats?.songsPublishedOnStreaming && (
                <><span className="hp-sep" aria-hidden /><HpStat n={l.stats.songsPublishedOnStreaming} label="On Streaming" /></>
              )}
              {l.careerStartYear && (
                <><span className="hp-sep" aria-hidden /><HpStat n={String(l.careerStartYear)} label="Writing Since" /></>
              )}
            </motion.div>
          )}

          <motion.div className="hp-btns"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.45 }}>
            <Link href="/journey" className="hp-btn-primary">Explore the Journey</Link>
            <Link href="/songs"   className="hp-btn-ghost">Browse Songs</Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        /* ── Root ─────────────────────────────────────── */
        .hp-root {
          min-height: 100svh;
          background: var(--bg);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: stretch;
        }
        .hp-layout { display: flex; width: 100%; align-items: stretch; }

        /* ── Photo panel ──────────────────────────────── */
        .hp-photo-side {
          position: relative;
          width: 40%;
          flex-shrink: 0;
          min-height: 100svh;
          overflow: hidden;
        }
        .hp-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .hp-photo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(155deg, #0d0d1a 0%, #141428 60%, #0a0a14 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hp-initial {
          font-size: 28vw;
          font-weight: 900;
          color: var(--accent);
          opacity: 0.06;
          line-height: 1;
          user-select: none;
        }
        .hp-photo-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, transparent 50%, var(--bg) 100%),
            linear-gradient(to bottom, var(--bg) 0%, transparent 18%, transparent 82%, var(--bg) 100%);
          pointer-events: none;
        }
        .hp-photo-edge {
          position: absolute;
          right: 0; top: 16%; bottom: 16%;
          width: 2px;
          background: linear-gradient(180deg, transparent, var(--accent) 38%, var(--accent) 62%, transparent);
          opacity: 0.3;
        }

        /* ── Content ──────────────────────────────────── */
        .hp-content {
          flex: 1;
          padding: 118px 8vw 90px 6vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        .hp-eyebrow {
          color: var(--accent);
          font-size: 0.64rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.44em;
          margin: 0 0 30px;
        }
        .hp-name { margin: 0; line-height: 0.91; letter-spacing: -0.03em; }
        .hp-name-first {
          display: block;
          font-size: clamp(1.8rem, 5vw, 5rem);
          font-weight: 200;
          opacity: 0.55;
        }
        .hp-name-last {
          display: block;
          font-size: clamp(2.8rem, 8.5vw, 8.5rem);
          font-weight: 900;
          margin-top: -0.04em;
        }
        .hp-pen {
          display: block;
          font-size: clamp(0.85rem, 1.5vw, 1.25rem);
          font-weight: 400;
          font-style: italic;
          font-family: var(--font-fraunces), Georgia, serif;
          letter-spacing: 0.01em;
          margin-top: 14px;
          color: var(--muted);
        }
        .hp-tagline {
          margin: 26px 0 0;
          font-size: clamp(0.88rem, 1.2vw, 1.05rem);
          max-width: 44ch;
          line-height: 1.8;
        }
        .hp-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .hp-sep { width: 1px; height: 32px; background: var(--line); flex-shrink: 0; }
        .hp-stat-n {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(1.3rem, 2.5vw, 1.9rem);
          font-weight: 600;
          line-height: 1;
        }
        .hp-stat-label {
          font-size: 0.59rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-top: 5px;
          color: var(--muted);
        }
        .hp-btns { display: flex; gap: 14px; margin-top: 40px; flex-wrap: wrap; }
        .hp-btn-primary {
          display: inline-flex; align-items: center;
          padding: 14px 32px; border-radius: 5px;
          background: var(--accent); color: var(--bg);
          font-weight: 700; font-size: 0.88rem; letter-spacing: 0.04em;
          text-decoration: none; white-space: nowrap;
          transition: opacity .24s, transform .22s;
        }
        .hp-btn-primary:hover { opacity: 0.85; transform: translateY(-2px); }
        .hp-btn-ghost {
          display: inline-flex; align-items: center;
          padding: 13px 32px; border-radius: 5px;
          border: 1.5px solid var(--line); color: var(--text);
          font-weight: 600; font-size: 0.88rem; letter-spacing: 0.04em;
          text-decoration: none; white-space: nowrap;
          transition: border-color .24s, transform .22s;
        }
        .hp-btn-ghost:hover { border-color: var(--accent); transform: translateY(-2px); }

        /* ── Tablet ─── */
        @media (max-width: 900px) {
          .hp-photo-side { width: 45%; }
          .hp-content { padding: 100px 5vw 80px 4vw; }
        }
        /* ── Mobile ─── */
        @media (max-width: 680px) {
          .hp-layout { flex-direction: column; }
          .hp-photo-side { width: 100%; min-height: 54vw; max-height: 300px; }
          .hp-photo-vignette {
            background: linear-gradient(to bottom, transparent 30%, var(--bg) 100%);
          }
          .hp-photo-edge { display: none; }
          .hp-content { padding: 28px 5vw 80px; justify-content: flex-start; }
          .hp-eyebrow { margin-bottom: 20px; }
        }
        @media (max-width: 480px) {
          .hp-btns { flex-direction: column; gap: 12px; }
          .hp-btn-primary, .hp-btn-ghost { justify-content: center; }
          .hp-sep { display: none; }
        }
      `}</style>
    </header>
  );
}

function HpStat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="hp-stat-n">{n}</div>
      <div className="hp-stat-label">{label}</div>
    </div>
  );
}
