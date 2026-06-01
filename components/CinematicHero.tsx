'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lyricist } from '@/lib/types';
import { TextReveal } from './Reveal';

export default function CinematicHero({ l }: { l: Lyricist }) {
  const first = l.name;
  const pen = l.penName ? `"${l.penName}"` : '';

  return (
    <header className="hero-root">
      <motion.div aria-hidden className="hero-blob blob-purple"
        animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div aria-hidden className="hero-blob blob-blue"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="hero-content">
        <motion.p className="accent hero-eyebrow"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
          {l.title ?? 'Lyricist'}
        </motion.p>

        <h1 className="font-serif hero-title">
          <TextReveal delay={0.35}>{first}</TextReveal>
          {pen && <TextReveal delay={0.5}><span className="gradient-text">{pen}</span></TextReveal>}
        </h1>

        <motion.p className="text-muted hero-tagline"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9 }}>
          {l.tagline}
        </motion.p>

        {l.stats && (
          <motion.div className="hero-stats"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            {l.stats.songsWritten && <Stat n={l.stats.songsWritten} label="Songs Written" />}
            {l.stats.songsPublishedOnStreaming && <Stat n={l.stats.songsPublishedOnStreaming} label="On Streaming" />}
            {l.careerStartYear && <Stat n={String(l.careerStartYear)} label="Writing Since" />}
          </motion.div>
        )}

        <motion.div className="hero-btns"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
          <Link href="/journey" className="btn-primary">Explore the Journey →</Link>
          <Link href="/songs" className="btn-ghost">Browse Songs</Link>
        </motion.div>
      </div>

      <motion.div className="hero-scroll-cue"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        <span className="text-muted hero-scroll-label">Scroll</span>
        <motion.div className="hero-scroll-line"
          animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.div>

      <style>{`
        .hero-root {
          min-height: 100svh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 120px 6vw 70px;
          position: relative; background: var(--hero-grad); overflow: hidden;
        }
        .hero-blob { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; z-index: 0; }
        .blob-purple { width: 340px; height: 340px; background: #5B2A86; opacity: .5; top: 8%; right: 6%; }
        .blob-blue   { width: 260px; height: 260px; background: #2D6BFF; opacity: .5; bottom: 14%; left: 4%; }
        .hero-content { position: relative; z-index: 2; max-width: 900px; }
        .hero-eyebrow { text-transform: uppercase; letter-spacing: .42em; font-size: .72rem; font-weight: 600; margin-bottom: 24px; display: block; }
        .hero-title { font-weight: 600; line-height: .96; font-size: clamp(2.8rem, 10vw, 8.5rem); letter-spacing: -.02em; margin: 0; }
        .hero-tagline { margin-top: 28px; font-size: clamp(.95rem, 1.5vw, 1.2rem); max-width: 46ch; line-height: 1.7; }
        .hero-stats { display: flex; gap: 36px; margin-top: 36px; flex-wrap: wrap; }
        .hero-btns  { display: flex; gap: 14px; margin-top: 40px; flex-wrap: wrap; }
        .btn-primary {
          padding: 14px 30px; border-radius: 100px; font-weight: 600; font-size: .92rem;
          text-decoration: none; background: linear-gradient(100deg,#5B2A86,#2D6BFF); color: #fff;
          transition: opacity .3s, transform .3s; white-space: nowrap;
        }
        .btn-primary:hover { opacity: .88; transform: translateY(-2px); }
        .btn-ghost {
          padding: 14px 30px; border-radius: 100px; font-weight: 600; font-size: .92rem;
          text-decoration: none; background: var(--panel); border: 1px solid var(--line);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          transition: background .3s, transform .3s; white-space: nowrap;
        }
        .btn-ghost:hover { background: var(--panel-solid); transform: translateY(-2px); }
        .hero-scroll-cue {
          position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 2;
        }
        .hero-scroll-label { font-size: .7rem; letter-spacing: .3em; text-transform: uppercase; }
        .hero-scroll-line { width: 1px; height: 46px; background: linear-gradient(var(--accent), transparent); }

        @media (max-width: 600px) {
          .hero-root { padding: 100px 6vw 80px; }
          .blob-purple { width: 180px; height: 180px; }
          .blob-blue   { width: 140px; height: 140px; }
          .hero-stats  { gap: 22px; }
          .hero-btns   { flex-direction: column; }
          .btn-primary, .btn-ghost { text-align: center; }
        }
      `}</style>
    </header>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-serif" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 600 }}>{n}</div>
      <div className="text-muted" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.18em', marginTop: 2 }}>{label}</div>
    </div>
  );
}
