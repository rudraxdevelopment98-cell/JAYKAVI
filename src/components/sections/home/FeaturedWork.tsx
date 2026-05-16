'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';

// Placeholder cards until real data is wired
const PLACEHOLDER_WORKS = [
  { id: '1', title: 'Echoes of Time', category: 'Film', year: 2024, col: 'col-span-2 row-span-2' },
  { id: '2', title: 'The Last Frame', category: 'Series', year: 2024, col: 'col-span-1' },
  { id: '3', title: 'Silence & Shadow', category: 'Short', year: 2023, col: 'col-span-1' },
  { id: '4', title: 'Canvas of Dreams', category: 'Installation', year: 2024, col: 'col-span-2' },
];

const GRADIENTS = [
  'from-[#1a0a2e] to-[#0d0d1a]',
  'from-[#0a1628] to-[#0d1a0d]',
  'from-[#1a0a0a] to-[#1a0d0a]',
  'from-[#0a1a1a] to-[#0a0d1a]',
];

export function FeaturedWork() {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
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

        {/* Asymmetric grid */}
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-3 gap-4 auto-rows-[260px]"
        >
          {PLACEHOLDER_WORKS.map((work, i) => (
            <motion.div
              key={work.id}
              variants={fadeUp}
              className={`${work.col} relative rounded-2xl overflow-hidden cursor-pointer group`}
            >
              {/* Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i]}`} />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

              {/* Scale on hover */}
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 origin-center">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 30% 40%, var(--color-accent-gold) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                  <p className="text-xs tracking-widest uppercase text-[var(--color-text-muted)] mb-2">
                    {work.category} · {work.year}
                  </p>
                  <h3
                    className="text-xl font-light text-white leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {work.title}
                  </h3>
                </div>
                <div className="overflow-hidden h-0 group-hover:h-10 transition-all duration-400 mt-3">
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
