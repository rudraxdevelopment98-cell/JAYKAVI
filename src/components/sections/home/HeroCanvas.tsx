'use client';

import { useRef, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/atoms/Button';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import Link from 'next/link';

const ParticleField = lazy(() =>
  import('@/components/canvas/ParticleField').then((m) => ({ default: m.ParticleField }))
);

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const { x: mx, y: my } = useMouseParallax(0.015);

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Three.js particle field */}
      <Suspense fallback={null}>
        <ParticleField className="absolute inset-0 z-0 w-full h-full" />
      </Suspense>

      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-[var(--color-bg-primary)] opacity-60" />
        {/* Hero gradient glow */}
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        {/* Ambient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'radial-gradient(circle, var(--color-accent-purple) 0%, transparent 70%)',
            x: mx,
            y: my,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ background: 'radial-gradient(circle, var(--color-accent-gold) 0%, transparent 70%)' }}
        />
      </motion.div>

      {/* Floating particles */}
      <Particles />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-8"
        >
          A Cinematic Journey
        </motion.p>

        {/* Main title — staggered word reveal */}
        <div
          className="overflow-hidden mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {['Where', 'Stories', 'Come', 'Alive'].map((word, i) => (
            <motion.span
              key={word}
              className="inline-block mr-[0.2em] text-[clamp(3.5rem,9vw,9rem)] font-light leading-[0.9] tracking-tight text-[var(--color-text-primary)]"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                delay: 0.4 + i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word === 'Stories' ? (
                <span className="text-gradient-gold">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="text-base md:text-lg text-[var(--color-text-muted)] max-w-lg mx-auto leading-relaxed mb-12"
        >
          An immersive platform blending cinematic storytelling, traditional artistry, and modern visual experiences.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/explore">
            <Button variant="primary" size="lg" magnetic>Begin the Journey</Button>
          </Link>
          <Link href="/journey">
            <Button variant="glass" size="lg">Our Story</Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-text-muted)]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent"
        />
      </motion.div>
    </section>
  );
}

function Particles() {
  const count = 20;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-px rounded-full bg-[var(--color-accent-gold)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0, 0.6, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
