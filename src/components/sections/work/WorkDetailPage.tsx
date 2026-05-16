'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp, slideInLeft } from '@/lib/animations/variants';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

// Placeholder — will be replaced with real Sanity data
const MOCK_WORK = {
  title: 'Echoes of Time',
  tagline: 'A journey through memory and silence',
  category: 'film' as const,
  genres: ['Drama', 'Experimental'] as string[],
  releaseYear: 2024,
  duration: 118,
  rating: 9.1,
  synopsis:
    'A meditation on memory, loss, and the architecture of the human mind. Set across three timelines, Echoes of Time follows a composer whose music becomes the key to unlocking fragments of a forgotten past. Shot on location across five countries over three years, it is a cinematic experience unlike any other.',
  awards: [
    { festival: 'Cannes Film Festival', category: 'Palme d\'Or Nominee', year: 2024 },
    { festival: 'Sundance Film Festival', category: 'World Cinema Grand Jury Prize', year: 2024 },
    { festival: 'BAFTA', category: 'Best Cinematography', year: 2024 },
  ],
  cast: [
    { name: 'Aria Montserrat', role: 'Elena' },
    { name: 'James Whitfield', role: 'The Composer' },
    { name: 'Yuki Tanaka', role: 'Young Elena' },
  ],
  accent: '#7c3aed',
};

export function WorkDetailPage({ slug }: { slug: string }) {
  const { ref, inView } = useInView(0.1);

  return (
    <div className="min-h-screen">
      {/* Cinematic hero */}
      <section className="relative h-[75vh] min-h-[500px] flex items-end overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[var(--color-bg-primary)]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 40% 30%, ${MOCK_WORK.accent}60 0%, transparent 70%)`,
            }}
          />
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pb-16 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
              {MOCK_WORK.genres.map((g) => (
                <Badge key={g} variant="default">{g}</Badge>
              ))}
              <Badge variant="gold">{MOCK_WORK.releaseYear}</Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {MOCK_WORK.title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-white/60 italic"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {MOCK_WORK.tagline}
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
              <span className="text-sm text-white/50">{Math.floor(MOCK_WORK.duration / 60)}h {MOCK_WORK.duration % 60}m</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-sm text-white/50">★ {MOCK_WORK.rating}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/20 to-transparent" />
      </section>

      {/* Main content */}
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-3 gap-16"
      >
        {/* Synopsis */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="lg:col-span-2 space-y-10"
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Synopsis</p>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
              {MOCK_WORK.synopsis}
            </p>
          </motion.div>

          {/* Trailer placeholder */}
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Trailer</p>
            <div
              className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-bg-card)] flex items-center justify-center cursor-pointer group"
              style={{ background: `radial-gradient(ellipse at 50% 50%, ${MOCK_WORK.accent}30 0%, var(--color-bg-card) 70%)` }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full glass flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Awards */}
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-6">Recognition</p>
            <div className="space-y-4">
              {MOCK_WORK.awards.map((award) => (
                <div
                  key={award.festival}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                >
                  <span className="text-[var(--color-accent-gold)] text-lg">✦</span>
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)]">{award.category}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{award.festival} · {award.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-10"
        >
          {/* Watch CTA */}
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-4">
            <p className="text-xs tracking-widest uppercase text-[var(--color-text-muted)]">Watch Now</p>
            <Button variant="primary" size="md" magnetic className="w-full">
              Stream This Film
            </Button>
            <Button variant="secondary" size="md" className="w-full">
              + Add to Watchlist
            </Button>
          </motion.div>

          {/* Cast */}
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Cast</p>
            <div className="space-y-3">
              {MOCK_WORK.cast.map(({ name, role }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)]">{name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
