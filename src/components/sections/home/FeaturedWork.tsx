'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';
import { Button } from '@/components/atoms/Button';
import { urlForImage } from '@/lib/sanity/client';
import type { Work } from '@/types/content';

interface FeaturedWorkProps {
  works?: Work[];
}

const COLS = [
  'col-span-2 row-span-2',
  'col-span-1',
  'col-span-1',
  'col-span-2',
];

const GRADIENTS = [
  'from-[#1a0a2e] to-[#0d0d1a]',
  'from-[#0a1628] to-[#0d1a0d]',
  'from-[#1a0a0a] to-[#1a0d0a]',
  'from-[#0a1a1a] to-[#0a0d1a]',
];

// Placeholder items shown when Sanity has no data yet
const PLACEHOLDER: Pick<Work, '_id' | 'title' | 'category' | 'releaseYear' | 'slug'>[] = [
  { _id: '1', title: 'Echoes of Time', category: 'film', releaseYear: 2024, slug: { current: 'echoes-of-time' } },
  { _id: '2', title: 'The Last Frame', category: 'series', releaseYear: 2024, slug: { current: 'the-last-frame' } },
  { _id: '3', title: 'Silence & Shadow', category: 'short', releaseYear: 2023, slug: { current: 'silence-and-shadow' } },
  { _id: '4', title: 'Canvas of Dreams', category: 'installation', releaseYear: 2024, slug: { current: 'canvas-of-dreams' } },
];

export function FeaturedWork({ works }: FeaturedWorkProps) {
  const { ref, inView } = useInView(0.1);
  const items = (works && works.length > 0 ? works.slice(0, 4) : PLACEHOLDER) as Work[];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-3">
              Selected Works
            </p>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] font-light text-[var(--color-text-primary)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Featured Stories
            </h2>
          </div>
          <Link href="/explore">
            <Button variant="ghost" size="sm">View all →</Button>
          </Link>
        </div>

        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-3 gap-4 auto-rows-[260px]"
        >
          {items.map((work, i) => (
            <motion.div
              key={work._id}
              variants={fadeUp}
              className={`${COLS[i] ?? 'col-span-1'} relative rounded-2xl overflow-hidden cursor-pointer group`}
            >
              <Link href={`/work/${work.slug.current}`} className="absolute inset-0 z-10" />

              {/* Background image or gradient */}
              {work.heroImage ? (
                <Image
                  src={urlForImage(work.heroImage, 800, 75)}
                  alt={work.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                  <div className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 30% 40%, var(--color-accent-gold) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs tracking-widest uppercase text-white/50 mb-2">
                    {work.category} · {work.releaseYear}
                  </p>
                  <h3
                    className="text-xl font-light text-white leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {work.title}
                  </h3>
                </div>
                <div className="overflow-hidden h-0 group-hover:h-8 transition-all duration-300 mt-2">
                  <span className="text-xs text-[var(--color-accent-gold)] tracking-wider">
                    Explore →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
