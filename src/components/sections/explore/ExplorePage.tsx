'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp, scaleIn } from '@/lib/animations/variants';
import { cn } from '@/lib/utils/cn';

type Category = 'all' | 'film' | 'series' | 'short' | 'installation' | 'art';

const FILTERS: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Films', value: 'film' },
  { label: 'Series', value: 'series' },
  { label: 'Shorts', value: 'short' },
  { label: 'Installations', value: 'installation' },
  { label: 'Art', value: 'art' },
];

const PLACEHOLDER_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  title: ['Echoes of Time', 'The Last Frame', 'Silence & Shadow', 'Canvas of Dreams', 'Dusk Protocol', 'The Wandering Eye', 'Still Waters', 'Neon Requiem', 'Fading Light', 'The Archive', 'Nocturne', 'Threshold'][i],
  category: ['film', 'series', 'short', 'installation', 'film', 'series', 'short', 'film', 'art', 'installation', 'film', 'series'][i] as Category,
  year: 2022 + (i % 3),
  accent: ['#7c3aed', '#c9a84c', '#8b1a1a', '#a8c5da', '#00e5ff', '#7c3aed'][i % 6],
}));

export function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const { ref, inView } = useInView(0.1);

  const filtered = activeFilter === 'all'
    ? PLACEHOLDER_ITEMS
    : PLACEHOLDER_ITEMS.filter((i) => i.category === activeFilter);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 border-b border-[var(--color-border)]">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4"
          >
            Discover
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Explore
          </motion.h1>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-50 bg-[var(--glass-nav-bg)] backdrop-blur-2xl border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex gap-3 overflow-x-auto scrollbar-none">
          {FILTERS.map(({ label, value }) => (
            <motion.button
              key={value}
              onClick={() => setActiveFilter(value)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex-shrink-0 px-5 py-2 rounded-full text-sm tracking-wide border transition-all duration-200',
                activeFilter === value
                  ? 'bg-[var(--color-accent-gold)] text-[var(--color-text-inverse)] border-transparent'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-gold)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={scaleIn}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                className="group cursor-pointer"
              >
                {/* Card */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-bg-card)]">
                  <div
                    className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at 40% 30%, ${item.accent}60 0%, transparent 70%)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs text-white/50 mb-1">{item.year} · {item.category}</p>
                    <p className="text-sm font-medium text-white leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                      {item.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
