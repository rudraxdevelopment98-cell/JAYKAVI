'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';

const WORDS = [
  'We', 'believe', 'every', 'frame', 'holds',
  'a', 'universe.', 'Every', 'cut,', 'a',
  'heartbeat.', 'Every', 'story,', 'a', 'world',
  'waiting', 'to', 'be', 'discovered.'
];

export function PhilosophyStatement() {
  const { ref, inView } = useInView(0.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-32 lg:py-48 overflow-hidden">
      {/* Shifting background */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent-purple)]/5 to-transparent pointer-events-none"
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-12"
        >
          Philosophy
        </motion.p>

        {/* Animated word-by-word text */}
        <motion.h2
          ref={ref as React.RefObject<HTMLHeadingElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-[clamp(2rem,5vw,4.5rem)] font-light leading-[1.15] tracking-tight max-w-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {WORDS.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0.15, color: 'var(--color-text-muted)' },
                visible: {
                  opacity: 1,
                  color: 'var(--color-text-primary)',
                  transition: { duration: 0.5, delay: i * 0.05 },
                },
              }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {/* Decorative line */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center gap-6"
        >
          <div className="w-12 h-px bg-[var(--color-accent-gold)]" />
          <p className="text-sm text-[var(--color-text-muted)] italic" style={{ fontFamily: 'var(--font-display)' }}>
            Since 2018 — Crafting journeys, not just content.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
