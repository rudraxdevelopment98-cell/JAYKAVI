'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lyricist } from '@/lib/types';
import { TextReveal } from '@/components/Reveal';

export default function HeroFullscreen({
  l,
  bgImageUrl,
  bgVideoUrl,
}: {
  l: Lyricist;
  bgImageUrl?: string | null;
  bgVideoUrl?: string | null;
}) {
  const words     = l.name.trim().split(/\s+/);
  const firstName = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const lastName  = words.length > 1 ? words[words.length - 1] : l.name;
  const hasStats  = l.stats?.songsWritten || l.stats?.songsPublishedOnStreaming || l.languages?.[0];

  return (
    <header className="hfs-root">

      {/* ── Background layer ────────────────────────── */}
      {bgVideoUrl ? (
        <video
          className="hfs-bg hfs-bg-video"
          src={bgVideoUrl}
          autoPlay muted loop playsInline
          poster={bgImageUrl ?? undefined}
        />
      ) : bgImageUrl ? (
        <div className="hfs-bg hfs-bg-img" style={{ backgroundImage: `url(${bgImageUrl})` }} />
      ) : (
        <div className="hfs-bg hfs-bg-default">
          {/* Subtle animated aurora for fallback */}
          <span className="hfs-orb hfs-orb-a" />
          <span className="hfs-orb hfs-orb-b" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="hfs-overlay" />

      {/* Inset decorative frame (desktop) */}
      <div className="hfs-frame" aria-hidden />

      {/* ── Content ─────────────────────────────────── */}
      <div className="hfs-body">
        {/* Credential badge */}
        <motion.div className="hfs-badge"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}>
          <span className="hfs-badge-dot" />
          <span>{l.title ?? 'Lyricist'}</span>
          {l.careerStartYear && (
            <><span className="hfs-badge-pipe" /><span>Since {l.careerStartYear}</span></>
          )}
        </motion.div>

        {/* Name */}
        <h1 className="hfs-name font-serif">
          {firstName && (
            <span className="hfs-name-first">
              <TextReveal delay={0.35}>{firstName}</TextReveal>
            </span>
          )}
          <span className="hfs-name-last">
            <TextReveal delay={firstName ? 0.5 : 0.35}>{lastName}</TextReveal>
          </span>
        </h1>

        {l.penName && (
          <motion.p className="hfs-pen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}>
            &ldquo;{l.penName}&rdquo;
          </motion.p>
        )}

        <motion.p className="hfs-tagline"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}>
          {l.tagline}
        </motion.p>

        <motion.div className="hfs-btns"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15 }}>
          <Link href="/journey" className="hfs-btn-primary">Explore the Journey</Link>
          <Link href="/songs"   className="hfs-btn-ghost">Browse Songs</Link>
        </motion.div>
      </div>

      {/* ── Bottom stats strip ────────────────────────── */}
      {hasStats && (
        <motion.div className="hfs-stats-strip"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}>
          {l.stats?.songsWritten && (
            <div className="hfs-stat">
              <span className="hfs-stat-n">{l.stats.songsWritten}</span>
              <span className="hfs-stat-label">Songs Written</span>
            </div>
          )}
          {l.stats?.songsPublishedOnStreaming && (
            <div className="hfs-stat">
              <span className="hfs-stat-n">{l.stats.songsPublishedOnStreaming}</span>
              <span className="hfs-stat-label">On Streaming</span>
            </div>
          )}
          {l.languages?.[0] && (
            <div className="hfs-stat">
              <span className="hfs-stat-n">{l.languages[0]}</span>
              <span className="hfs-stat-label">Primary Language</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Scroll indicator */}
      <motion.div className="hfs-scroll" aria-hidden
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}>
        <motion.span className="hfs-scroll-dot"
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>

      <style>{`
        /* ── Root ─────────────────────────────────────── */
        .hfs-root {
          min-height: 100svh;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* ── Background ───────────────────────────────── */
        .hfs-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hfs-bg-video {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .hfs-bg-img {
          background-size: cover;
          background-position: center;
        }
        .hfs-bg-default {
          background: linear-gradient(135deg, #07070f 0%, #100a20 50%, #060c1a 100%);
          overflow: hidden;
        }
        .hfs-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          mix-blend-mode: screen;
          will-change: transform;
        }
        .hfs-orb-a {
          width: 55vw; height: 55vw;
          top: -15%; right: -10%;
          background: radial-gradient(circle, #3a1a5e, transparent 70%);
          opacity: .55;
          animation: hfsDrift1 24s ease-in-out infinite;
        }
        .hfs-orb-b {
          width: 45vw; height: 45vw;
          bottom: -15%; left: -5%;
          background: radial-gradient(circle, #1a3a7a, transparent 70%);
          opacity: .45;
          animation: hfsDrift2 30s ease-in-out infinite;
        }
        @keyframes hfsDrift1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-4%,6%); } }
        @keyframes hfsDrift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(6%,-4%); } }
        @media (prefers-reduced-motion: reduce) { .hfs-orb { animation: none !important; } }

        /* ── Overlay ──────────────────────────────────── */
        .hfs-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(to right, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.25) 100%),
            linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,.75) 100%);
        }

        /* ── Inset frame (desktop) ────────────────────── */
        .hfs-frame {
          display: none;
          position: absolute;
          inset: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px;
          pointer-events: none;
          z-index: 2;
        }
        @media (min-width: 900px) { .hfs-frame { display: block; } }

        /* ── Body ─────────────────────────────────────── */
        .hfs-body {
          position: relative;
          z-index: 3;
          padding: 130px 7vw 50px;
          max-width: 920px;
        }

        /* ── Badge ────────────────────────────────────── */
        .hfs-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 100px;
          padding: 7px 18px;
          font-size: 0.68rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.68);
          margin-bottom: 38px;
        }
        .hfs-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
          flex-shrink: 0;
        }
        .hfs-badge-pipe {
          width: 1px; height: 12px;
          background: rgba(255,255,255,0.2);
        }

        /* ── Name ─────────────────────────────────────── */
        .hfs-name { margin: 0; line-height: 0.89; letter-spacing: -0.03em; color: #fff; }
        .hfs-name-first {
          display: block;
          font-size: clamp(2.2rem, 7vw, 7rem);
          font-weight: 200;
          opacity: 0.65;
        }
        .hfs-name-last {
          display: block;
          font-size: clamp(4rem, 13vw, 12rem);
          font-weight: 900;
          margin-top: -0.04em;
          text-shadow: 0 6px 50px rgba(0,0,0,0.6);
        }

        .hfs-pen {
          font-style: italic;
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(0.9rem, 1.6vw, 1.35rem);
          color: rgba(255,255,255,0.5);
          margin: 16px 0 0;
        }
        .hfs-tagline {
          margin: 22px 0 0;
          font-size: clamp(0.88rem, 1.25vw, 1.08rem);
          max-width: 48ch;
          line-height: 1.8;
          color: rgba(255,255,255,0.62);
        }

        /* ── CTAs ─────────────────────────────────────── */
        .hfs-btns { display: flex; gap: 14px; margin-top: 40px; flex-wrap: wrap; }
        .hfs-btn-primary {
          display: inline-flex; align-items: center;
          padding: 14px 32px; border-radius: 5px;
          background: var(--accent); color: #fff;
          font-weight: 700; font-size: 0.88rem; letter-spacing: 0.04em;
          text-decoration: none; white-space: nowrap;
          transition: opacity .24s, transform .22s;
        }
        .hfs-btn-primary:hover { opacity: 0.85; transform: translateY(-2px); }
        .hfs-btn-ghost {
          display: inline-flex; align-items: center;
          padding: 13px 32px; border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,0.28); color: rgba(255,255,255,0.88);
          font-weight: 600; font-size: 0.88rem; letter-spacing: 0.04em;
          text-decoration: none; white-space: nowrap;
          transition: border-color .24s, transform .22s;
        }
        .hfs-btn-ghost:hover { border-color: rgba(255,255,255,0.65); transform: translateY(-2px); }

        /* ── Stats strip ──────────────────────────────── */
        .hfs-stats-strip {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 3;
          display: flex;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 0 7vw;
        }
        .hfs-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 18px 28px 18px 0;
          border-right: 1px solid rgba(255,255,255,0.07);
          margin-right: 28px;
        }
        .hfs-stat:last-child { border-right: none; padding-right: 0; margin-right: 0; }
        .hfs-stat-n {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(1.25rem, 2vw, 1.75rem);
          font-weight: 600;
          color: #fff;
          line-height: 1;
        }
        .hfs-stat-label {
          font-size: 0.59rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.42);
          margin-top: 5px;
        }

        /* ── Scroll dot ───────────────────────────────── */
        .hfs-scroll {
          position: absolute;
          bottom: 88px;
          right: 6vw;
          z-index: 3;
        }
        .hfs-scroll-dot {
          display: block;
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,0.45);
        }

        /* ── Mobile ───────────────────────────────────── */
        @media (max-width: 600px) {
          .hfs-body   { padding: 110px 5vw 50px; }
          .hfs-btns   { flex-direction: column; gap: 12px; }
          .hfs-btn-primary, .hfs-btn-ghost { justify-content: center; }
          .hfs-stats-strip, .hfs-scroll { display: none; }
        }
      `}</style>
    </header>
  );
}
