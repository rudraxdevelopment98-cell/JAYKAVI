'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

const CHAPTERS = [
  {
    number: '01',
    title: 'Origins',
    year: '2018',
    description:
      'Born from a desire to merge traditional artistry with modern storytelling. A single camera, a single vision — the seed of something greater.',
    accent: 'var(--color-accent-gold)',
  },
  {
    number: '02',
    title: 'The Work',
    year: '2019–2021',
    description:
      'Three years of relentless creation. Films that challenged convention, series that redefined narrative, installations that transformed spaces.',
    accent: 'var(--color-accent-purple)',
  },
  {
    number: '03',
    title: 'Recognition',
    year: '2022',
    description:
      'Cannes. Sundance. Venice. The world began to take notice. Not as validation, but as invitation — to push further.',
    accent: 'var(--color-accent-ice)',
  },
  {
    number: '04',
    title: 'Expansion',
    year: '2023–2024',
    description:
      'New collaborators. New mediums. The canvas grew wider. The language of cinema evolved into something entirely our own.',
    accent: 'var(--color-accent-gold)',
  },
  {
    number: '05',
    title: 'The Future',
    year: '2025 →',
    description:
      'This is not an arrival. This is a departure point. The most cinematic chapters are still unwritten.',
    accent: 'var(--color-accent-neon)',
  },
];

export function JourneyPage() {
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <div className="min-h-screen">
      {/* Opening */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-bg-primary)]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-accent-gold) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative text-center px-6 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-8"
          >
            A Story in Five Chapters
          </motion.p>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            It began with a{' '}
            <span className="text-gradient-gold italic">single frame.</span>
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent"
          />
        </motion.div>
      </section>

      {/* Chapters */}
      <div className="relative">
        {/* Chapter nav — sticky side dots */}
        <nav className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-4">
          {CHAPTERS.map((ch, i) => (
            <button
              key={ch.number}
              onClick={() => {
                setActiveChapter(i);
                document.getElementById(`chapter-${i}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label={`Chapter ${ch.number}`}
              className="group flex items-center gap-3"
            >
              <span className="text-[10px] tracking-widest text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                {ch.number}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i === activeChapter ? ch.accent : 'var(--color-border-strong)',
                  transform: i === activeChapter ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            </button>
          ))}
        </nav>

        {/* Chapter sections */}
        {CHAPTERS.map((chapter, i) => (
          <ChapterSection
            key={chapter.number}
            chapter={chapter}
            index={i}
            isLast={i === CHAPTERS.length - 1}
            onVisible={() => setActiveChapter(i)}
          />
        ))}
      </div>
    </div>
  );
}

function ChapterSection({
  chapter,
  index,
  isLast,
  onVisible,
}: {
  chapter: (typeof CHAPTERS)[0];
  index: number;
  isLast: boolean;
  onVisible: () => void;
}) {
  const { ref, inView } = useInView(0.4);

  if (inView) onVisible();

  return (
    <section
      id={`chapter-${index}`}
      ref={ref as React.RefObject<HTMLElement>}
      className="min-h-screen flex items-center py-24 lg:py-0"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className={index % 2 === 1 ? 'lg:order-2' : ''}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: chapter.accent }}
          >
            Chapter {chapter.number} · {chapter.year}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-[clamp(2.5rem,5vw,5rem)] font-light text-[var(--color-text-primary)] mb-8 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {chapter.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl"
          >
            {chapter.description}
          </motion.p>
        </motion.div>

        {/* Visual placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className={`aspect-square rounded-2xl overflow-hidden relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
        >
          <div className="absolute inset-0 bg-[var(--color-bg-card)]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 40% 40%, ${chapter.accent}80 0%, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[8rem] font-light opacity-10"
              style={{ fontFamily: 'var(--font-display)', color: chapter.accent }}
            >
              {chapter.number}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
