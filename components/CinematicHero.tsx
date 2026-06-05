'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lyricist } from '@/lib/types';
import { TextReveal } from './Reveal';

export default function CinematicHero({ l }: { l: Lyricist }) {
  const words = l.name.trim().split(/\s+/);
  const firstName = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const lastName  = words.length > 1 ? words[words.length - 1] : l.name;
  const hasStats  = l.stats?.songsWritten || l.stats?.songsPublishedOnStreaming || l.careerStartYear;

  return (
    <header className="ch-root">
      {/* Web3-style animated ambience: drifting aurora orbs + grid + particles */}
      <div className="ch-ambient" aria-hidden>
        <span className="ch-orb ch-orb-1" />
        <span className="ch-orb ch-orb-2" />
        <span className="ch-orb ch-orb-3" />
        <div className="ch-grid" />
        <div className="ch-particles">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="ch-particle" style={{ ['--i' as any]: i }} />
          ))}
        </div>
      </div>

      {/* Thin left accent line */}
      <div className="ch-edge" aria-hidden />

      {/* Main content */}
      <div className="ch-body">

        {/* Eyebrow */}
        <motion.div className="ch-eyebrow"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: .15, duration: .6 }}>
          <span className="ch-eyebrow-label">{l.title ?? 'Lyricist'}</span>
          <span className="ch-eyebrow-rule" aria-hidden />
        </motion.div>

        {/* Name */}
        <h1 className="ch-name font-serif">
          {firstName && (
            <span className="ch-name-first">
              <TextReveal delay={0.3}>{firstName}</TextReveal>
            </span>
          )}
          <span className="ch-name-last">
            <TextReveal delay={firstName ? 0.45 : 0.3}>{lastName}</TextReveal>
          </span>
          {l.penName && (
            <motion.span className="ch-pen gradient-text"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}>
              &ldquo;{l.penName}&rdquo;
            </motion.span>
          )}
        </h1>

        {/* Tagline */}
        <motion.p className="ch-tagline text-muted"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .85 }}>
          {l.tagline}
        </motion.p>

        {/* Stats bar */}
        {hasStats && (
          <motion.div className="ch-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}>
            {l.stats?.songsWritten && (
              <ChStat n={l.stats.songsWritten} label="Songs Written" />
            )}
            {l.stats?.songsPublishedOnStreaming && (
              <><span className="ch-sep" aria-hidden /><ChStat n={l.stats.songsPublishedOnStreaming} label="On Streaming" /></>
            )}
            {l.careerStartYear && (
              <><span className="ch-sep" aria-hidden /><ChStat n={String(l.careerStartYear)} label="Writing Since" /></>
            )}
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div className="ch-btns"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25 }}>
          <Link href="/journey" className="ch-btn-primary">Explore the Journey</Link>
          <Link href="/songs"   className="ch-btn-ghost">Browse Songs</Link>
        </motion.div>
      </div>

      {/* Decorative right column — desktop only */}
      <motion.aside className="ch-deco" aria-hidden
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}>
        {l.careerStartYear && <span className="ch-deco-text">{l.careerStartYear}</span>}
        <span className="ch-deco-vline" />
        <span className="ch-deco-text">{l.languages?.[0] ?? 'Gujarati'}</span>
      </motion.aside>

      {/* Scroll indicator */}
      <motion.div className="ch-scroll" aria-hidden
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}>
        <motion.span className="ch-scroll-dot"
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
        <span className="ch-scroll-label">Scroll</span>
      </motion.div>

      <style>{`
        /* ── Root ─────────────────────────────────────────────────────────────── */
        .ch-root {
          min-height: 100svh;
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          padding: 115px 7vw 85px;
          position: relative;
          overflow: hidden;
          background: var(--hero-grad);
        }

        /* ── Web3 ambient layer ───────────────────────────────────────────── */
        .ch-ambient { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }

        .ch-orb {
          position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5;
          mix-blend-mode: screen; will-change: transform;
        }
        .ch-orb-1 { width: 42vw; height: 42vw; top: -8%; right: -6%;
          background: radial-gradient(circle at 30% 30%, #5B2A86, transparent 70%);
          animation: chDrift1 22s ease-in-out infinite; }
        .ch-orb-2 { width: 36vw; height: 36vw; bottom: -10%; left: -8%;
          background: radial-gradient(circle at 50% 50%, #2D6BFF, transparent 70%);
          animation: chDrift2 28s ease-in-out infinite; }
        .ch-orb-3 { width: 28vw; height: 28vw; top: 30%; left: 40%;
          background: radial-gradient(circle at 50% 50%, var(--accent), transparent 72%);
          opacity: .28; animation: chDrift3 25s ease-in-out infinite; }
        [data-theme='light'] .ch-orb { opacity: .3; mix-blend-mode: multiply; }

        @keyframes chDrift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-5%,6%) scale(1.12); } }
        @keyframes chDrift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(7%,-5%) scale(1.15); } }
        @keyframes chDrift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8%,-7%) scale(.9); } }

        /* faint moving tech grid */
        .ch-grid {
          position: absolute; inset: -2px;
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 64px 64px; opacity: .5;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 25%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 25%, transparent 80%);
          animation: chGrid 30s linear infinite;
        }
        @keyframes chGrid { from { background-position: 0 0, 0 0; } to { background-position: 64px 64px, 64px 64px; } }

        /* floating particles */
        .ch-particles { position: absolute; inset: 0; }
        .ch-particle {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: var(--accent); opacity: .35;
          left: calc((var(--i) * 7%) + 4%);
          bottom: -10px;
          animation: chRise calc(14s + (var(--i) * 1.3s)) linear infinite;
          animation-delay: calc(var(--i) * -1.7s);
          box-shadow: 0 0 8px var(--accent);
        }
        @keyframes chRise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          12% { opacity: .5; }
          88% { opacity: .5; }
          100% { transform: translateY(-104vh) translateX(28px); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ch-orb, .ch-grid, .ch-particle { animation: none !important; }
        }

        /* Left accent bar */
        .ch-edge {
          position: absolute; left: 0; top: 18%; bottom: 18%; width: 3px;
          background: linear-gradient(180deg, transparent 0%, var(--accent) 38%, var(--accent) 62%, transparent 100%);
          opacity: .45; pointer-events: none;
        }

        /* ── Content block ────────────────────────────────────────────────────── */
        .ch-body { position: relative; z-index: 2; max-width: 840px; }

        /* ── Eyebrow ──────────────────────────────────────────────────────────── */
        .ch-eyebrow { display: flex; align-items: center; gap: 18px; margin-bottom: 32px; }
        .ch-eyebrow-label {
          color: var(--accent); font-size: .66rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .44em;
          flex-shrink: 0; white-space: nowrap;
        }
        .ch-eyebrow-rule {
          flex: 0 0 100px; height: 1px;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: .5;
        }

        /* ── Name ─────────────────────────────────────────────────────────────── */
        .ch-name { margin: 0; line-height: .92; letter-spacing: -.03em; }
        .ch-name-first {
          display: block;
          font-size: clamp(2.4rem, 7.8vw, 7rem);
          font-weight: 300; opacity: .75;
        }
        .ch-name-last {
          display: block;
          font-size: clamp(3.6rem, 12vw, 10.5rem);
          font-weight: 800; margin-top: -.04em;
        }
        .ch-pen {
          display: block;
          font-size: clamp(1rem, 2vw, 1.55rem);
          font-weight: 400; font-style: italic;
          font-family: var(--font-fraunces), Georgia, serif;
          letter-spacing: .01em; margin-top: 14px;
        }

        /* ── Tagline ──────────────────────────────────────────────────────────── */
        .ch-tagline {
          margin-top: 30px;
          font-size: clamp(.9rem, 1.3vw, 1.1rem);
          max-width: 46ch; line-height: 1.8;
        }

        /* ── Stats ────────────────────────────────────────────────────────────── */
        .ch-stats { display: flex; align-items: center; gap: 22px; margin-top: 38px; flex-wrap: wrap; }
        .ch-sep { width: 1px; height: 36px; background: var(--line); flex-shrink: 0; }
        .ch-stat-n {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 600; line-height: 1;
        }
        .ch-stat-label {
          font-size: .6rem; text-transform: uppercase;
          letter-spacing: .22em; margin-top: 5px; color: var(--muted);
        }

        /* ── CTA buttons ──────────────────────────────────────────────────────── */
        .ch-btns { display: flex; gap: 14px; margin-top: 46px; flex-wrap: wrap; }
        .ch-btn-primary {
          display: inline-flex; align-items: center;
          padding: 15px 34px; border-radius: 5px;
          background: var(--accent); color: var(--bg);
          font-weight: 700; font-size: .88rem; letter-spacing: .04em;
          text-decoration: none; white-space: nowrap;
          transition: opacity .24s, transform .22s;
        }
        .ch-btn-primary:hover { opacity: .85; transform: translateY(-2px); }
        .ch-btn-ghost {
          display: inline-flex; align-items: center;
          padding: 14px 34px; border-radius: 5px;
          border: 1.5px solid var(--line); color: var(--text);
          font-weight: 600; font-size: .88rem; letter-spacing: .04em;
          text-decoration: none; white-space: nowrap;
          transition: border-color .24s, transform .22s;
        }
        .ch-btn-ghost:hover { border-color: var(--accent); transform: translateY(-2px); }

        /* ── Deco column (desktop only) ───────────────────────────────────────── */
        .ch-deco {
          display: none;
          flex-direction: column; align-items: center; gap: 18px;
          position: absolute; right: 5.5vw; top: 50%;
          transform: translateY(-50%); z-index: 2;
        }
        .ch-deco-text {
          writing-mode: vertical-rl; text-orientation: mixed;
          font-size: .6rem; letter-spacing: .3em; text-transform: uppercase;
          color: var(--muted); opacity: .4; user-select: none;
        }
        .ch-deco-vline {
          width: 1px; height: 72px;
          background: linear-gradient(180deg, transparent, var(--line), transparent);
        }

        /* ── Scroll cue ───────────────────────────────────────────────────────── */
        .ch-scroll {
          position: absolute; bottom: 34px; left: 7vw;
          display: flex; align-items: center; gap: 10px; z-index: 2;
        }
        .ch-scroll-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); display: block; flex-shrink: 0;
        }
        .ch-scroll-label {
          font-size: .6rem; text-transform: uppercase;
          letter-spacing: .34em; color: var(--muted);
        }

        /* ── Desktop ──────────────────────────────────────────────────────────── */
        @media (min-width: 900px) {
          .ch-deco { display: flex; }
        }

        /* ── Tablet ───────────────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .ch-root { padding: 100px 6vw 80px; }
        }

        /* ── Mobile ───────────────────────────────────────────────────────────── */
        @media (max-width: 599px) {
          .ch-root   { padding: 100px 5vw 90px; }
          .ch-btns   { flex-direction: column; gap: 12px; }
          .ch-btn-primary, .ch-btn-ghost { justify-content: center; padding: 16px 24px; }
          .ch-sep    { display: none; }
          .ch-stats  { gap: 18px; }
          .ch-edge   { top: 22%; bottom: 22%; opacity: .3; }
        }
      `}</style>
    </header>
  );
}

function ChStat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="ch-stat-n">{n}</div>
      <div className="ch-stat-label">{label}</div>
    </div>
  );
}
