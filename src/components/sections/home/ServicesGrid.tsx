'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';

const CATEGORIES = [
  {
    title: 'Films',
    description: 'Feature-length cinematic works that push the boundaries of visual storytelling.',
    href: '/explore?category=film',
    accent: 'var(--color-accent-purple)',
    icon: '◈',
  },
  {
    title: 'Series',
    description: 'Long-form narrative journeys that unfold over episodes and seasons.',
    href: '/explore?category=series',
    accent: 'var(--color-accent-gold)',
    icon: '◉',
  },
  {
    title: 'Art Installations',
    description: 'Immersive experiences that blur the line between cinema and fine art.',
    href: '/explore?category=installation',
    accent: 'var(--color-accent-ice)',
    icon: '◎',
  },
  {
    title: 'Live Events',
    description: 'Premieres, screenings, and live cinematic performances around the world.',
    href: '/events',
    accent: 'var(--color-accent-crimson)',
    icon: '◇',
  },
];

export function ServicesGrid() {
  const { ref, inView } = useInView(0.15);

  return (
    <section className="py-24 lg:py-32 bg-[var(--color-bg-secondary)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4"
        >
          What We Create
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-[clamp(1.8rem,3.5vw,3rem)] font-light text-[var(--color-text-primary)] mb-16"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Worlds We Build
        </motion.h2>

        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-border)]"
        >
          {CATEGORIES.map(({ title, description, href, accent, icon }) => (
            <motion.div key={title} variants={fadeUp}>
              <Link href={href}>
                <div className="relative group p-10 bg-[var(--color-bg-secondary)] overflow-hidden cursor-pointer">
                  {/* Hover fill */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse 80% 60% at 30% 50%, ${accent}15 0%, transparent 70%)` }}
                  />

                  {/* Icon */}
                  <span
                    className="block text-4xl mb-6 transition-transform duration-500 group-hover:scale-110 origin-left"
                    style={{ color: accent }}
                  >
                    {icon}
                  </span>

                  <h3
                    className="text-2xl font-light text-[var(--color-text-primary)] mb-3 group-hover:text-[var(--color-text-primary)] transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-sm">
                    {description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-8 flex items-center gap-2 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
                    style={{ color: accent }}
                  >
                    <span>Explore</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
