'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';

const QUOTES = [
  {
    quote: 'A breathtaking visual symphony. JAYKAVI has redefined what cinematic storytelling means in the digital age.',
    attribution: 'Elena Marchetti',
    publication: 'Film & Arts Quarterly',
  },
  {
    quote: 'An extraordinary fusion of traditional artistry and contemporary filmmaking. Every frame is a painting.',
    attribution: 'David Chen',
    publication: 'Sight & Sound',
  },
  {
    quote: 'The most immersive cinematic experience we have encountered this decade. Absolutely essential viewing.',
    attribution: 'Sophia Laurent',
    publication: 'The Cinema Review',
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const { ref, inView } = useInView(0.2);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-purple)]/5 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-16"
        >
          What Critics Say
        </motion.p>

        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10"
            >
              <p
                className="text-[clamp(1.3rem,2.5vw,2rem)] font-light text-[var(--color-text-primary)] leading-relaxed"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                "{QUOTES[active].quote}"
              </p>
            </motion.blockquote>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`attr-${active}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-px bg-[var(--color-accent-gold)]" />
              <div>
                <p className="text-sm text-[var(--color-text-primary)]">{QUOTES[active].attribution}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{QUOTES[active].publication}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div className="flex gap-3 mt-10">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Quote ${i + 1}`}
                className="relative w-8 h-px bg-[var(--color-border-strong)] overflow-hidden"
              >
                {i === active && (
                  <motion.span
                    layoutId="quote-indicator"
                    className="absolute inset-0 bg-[var(--color-accent-gold)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
