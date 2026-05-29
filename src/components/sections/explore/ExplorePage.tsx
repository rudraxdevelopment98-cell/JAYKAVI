'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, scaleIn } from '@/lib/animations/variants';
import { cn } from '@/lib/utils/cn';
import { urlForImage } from '@/lib/sanity/client';
import type { Work, ContentCategory } from '@/types/content';

type FilterCategory = 'all' | ContentCategory;

const FILTERS: { label: string; value: FilterCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Films', value: 'film' },
  { label: 'Series', value: 'series' },
  { label: 'Shorts', value: 'short' },
  { label: 'Installations', value: 'installation' },
  { label: 'Art', value: 'art' },
];

const ACCENTS = ['#7c3aed', '#c9a84c', '#8b1a1a', '#a8c5da', '#00e5ff', '#7c3aed'];

const PLACEHOLDER: Pick<Work, '_id' | 'title' | 'category' | 'releaseYear' | 'slug'>[] = Array.from(
  { length: 12 },
  (_, i) => ({
    _id: String(i + 1),
    title: ['Echoes of Time', 'The Last Frame', 'Silence & Shadow', 'Canvas of Dreams', 'Dusk Protocol', 'The Wandering Eye', 'Still Waters', 'Neon Requiem', 'Fading Light', 'The Archive', 'Nocturne', 'Threshold'][i],
    category: ['film', 'series', 'short', 'installation', 'film', 'series', 'short', 'film', 'art', 'installation', 'film', 'series'][i] as ContentCategory,
    releaseYear: 2022 + (i % 3),
    slug: { current: ['echoes-of-time', 'the-last-frame', 'silence-shadow', 'canvas-dreams', 'dusk-protocol', 'wandering-eye', 'still-waters', 'neon-requiem', 'fading-light', 'archive', 'nocturne', 'threshold'][i] },
  })
);

interface ExplorePageProps {
  works?: Work[];
}

export function ExplorePage({ works }: ExplorePageProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, inView } = useInView(0.05);

  const allItems = (works && works.length > 0 ? works : PLACEHOLDER) as Work[];

  const filtered = useMemo(() => {
    let result = activeFilter === 'all' ? allItems : allItems.filter((i) => i.category === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q));
    }
    return result;
  }, [allItems, activeFilter, searchQuery]);

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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm text-[var(--color-text-muted)]"
          >
            {allItems.length} works
          </motion.p>
        </div>
      </section>

      {/* Sticky filter + search bar */}
      <section className="sticky top-16 z-50 bg-[var(--glass-nav-bg)] backdrop-blur-2xl border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search works..."
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-gold)] transition-colors w-40 focus:w-56"
              style={{ transition: 'width 0.3s ease, border-color 0.2s' }}
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map(({ label, value }) => (
              <motion.button
                key={value}
                onClick={() => setActiveFilter(value)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-xs tracking-wide border transition-all duration-200',
                  activeFilter === value
                    ? 'bg-[var(--color-accent-gold)] text-[var(--color-text-inverse)] border-transparent'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-gold)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {label}
              </motion.button>
            ))}
          </div>

          <span className="ml-auto text-xs text-[var(--color-text-muted)] flex-shrink-0">
            {filtered.length} results
          </span>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 max-w-[1400px] mx-auto px-6 lg:px-12">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-[var(--color-text-muted)]">
            <p className="text-4xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>Nothing found.</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <motion.div
            ref={ref as React.RefObject<HTMLDivElement>}
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  variants={scaleIn}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/work/${item.slug.current}`}>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-bg-card)]">
                      {(item as Work).heroImage ? (
                        <Image
                          src={urlForImage((item as Work).heroImage, 400, 75)}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                          style={{ background: `radial-gradient(ellipse at 40% 30%, ${ACCENTS[i % ACCENTS.length]}60 0%, transparent 70%)` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">{item.releaseYear} · {item.category}</p>
                        <p className="text-sm font-medium text-white leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
