'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Lyricist } from '@/lib/types';
import { TextReveal } from './Reveal';

export default function CinematicHero({ l }: { l: Lyricist }) {
  const first = l.name;
  const pen = l.penName ? `"${l.penName}"` : '';
  return (
    <header style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '0 6vw', position: 'relative', background: 'var(--hero-grad)', overflow: 'hidden',
    }}>
      <motion.div aria-hidden
        animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: '#5B2A86', filter: 'blur(60px)', opacity: .5, top: '8%', right: '6%', zIndex: 0 }} />
      <motion.div aria-hidden
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: '#2D6BFF', filter: 'blur(60px)', opacity: .5, bottom: '14%', left: '4%', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
          className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.42em', fontSize: '.72rem', fontWeight: 600, marginBottom: 24 }}>
          {l.title ?? 'Lyricist'}
        </motion.p>
        <h1 className="font-serif" style={{ fontWeight: 600, lineHeight: .96, fontSize: 'clamp(3rem,10vw,8.5rem)', letterSpacing: '-.02em', margin: 0 }}>
          <TextReveal delay={0.35}>{first}</TextReveal>
          <TextReveal delay={0.5}><span className="gradient-text">{pen}</span></TextReveal>
        </h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9 }}
          className="text-muted" style={{ marginTop: 30, fontSize: 'clamp(1rem,1.5vw,1.25rem)', maxWidth: '48ch' }}>
          {l.tagline}
        </motion.p>

        {l.stats && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            style={{ display: 'flex', gap: 42, marginTop: 40, flexWrap: 'wrap' }}>
            {l.stats.songsWritten && <Stat n={l.stats.songsWritten} label="Songs Written" />}
            {l.stats.songsPublishedOnStreaming && <Stat n={l.stats.songsPublishedOnStreaming} label="On Streaming" />}
            {l.careerStartYear && <Stat n={String(l.careerStartYear)} label="Writing Since" />}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
          style={{ display: 'flex', gap: 16, marginTop: 46, flexWrap: 'wrap' }}>
          <Link href="/journey" style={btnPrimary}>Explore the Journey →</Link>
          <Link href="/songs" style={btnGhost}>Browse Songs</Link>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 2 }}>
        <span className="text-muted" style={{ fontSize: '.72rem', letterSpacing: '.3em', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ opacity: [.3, 1, .3] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 1, height: 46, background: 'linear-gradient(var(--accent), transparent)' }} />
      </motion.div>
    </header>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-serif" style={{ fontSize: '2.4rem', fontWeight: 600 }}>{n}</div>
      <div className="text-muted" style={{ fontSize: '.76rem', textTransform: 'uppercase', letterSpacing: '.2em' }}>{label}</div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '15px 32px', borderRadius: 100, fontWeight: 600, fontSize: '.95rem',
  textDecoration: 'none', background: 'linear-gradient(100deg,#5B2A86,#2D6BFF)', color: '#fff',
};
const btnGhost: React.CSSProperties = {
  padding: '15px 32px', borderRadius: 100, fontWeight: 600, fontSize: '.95rem',
  textDecoration: 'none', background: 'var(--panel)', border: '1px solid var(--line)', backdropFilter: 'blur(10px)',
};
