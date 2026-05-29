'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { urlForImage } from '@/lib/sanity/client';
import type { Work } from '@/types/content';

// Fallback content when Sanity not configured
const MOCK_WORK: Partial<Work> = {
  title: 'Echoes of Time',
  tagline: 'A journey through memory and silence',
  category: 'film',
  genres: ['drama', 'experimental'],
  releaseYear: 2024,
  duration: 118,
  rating: 9.1,
  synopsis:
    'A meditation on memory, loss, and the architecture of the human mind. Set across three timelines, Echoes of Time follows a composer whose music becomes the key to unlocking fragments of a forgotten past. Shot on location across five countries over three years.',
  awards: [
    { _key: '1', festivalName: 'Cannes Film Festival', category: "Palme d'Or Nominee", year: 2024, status: 'nominee' },
    { _key: '2', festivalName: 'Sundance Film Festival', category: 'World Cinema Grand Jury Prize', year: 2024, status: 'winner' },
    { _key: '3', festivalName: 'BAFTA', category: 'Best Cinematography', year: 2024, status: 'nominee' },
  ],
  cast: [
    { _key: '1', name: 'Aria Montserrat', role: 'Elena' },
    { _key: '2', name: 'James Whitfield', role: 'The Composer' },
    { _key: '3', name: 'Yuki Tanaka', role: 'Young Elena' },
  ] as Work['cast'],
};

interface WorkDetailPageProps {
  slug: string;
  work?: Work;
}

export function WorkDetailPage({ slug, work: sanityWork }: WorkDetailPageProps) {
  const work = sanityWork ?? (MOCK_WORK as Work);
  const { ref, inView } = useInView(0.1);

  const accent = '#7c3aed';

  return (
    <div className="min-h-screen">
      {/* Cinematic hero */}
      <section className="relative h-[75vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-bg-primary)]">
          {work.heroImage ? (
            <Image
              src={urlForImage(work.heroImage, 1400, 80)}
              alt={work.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(ellipse 80% 70% at 40% 30%, ${accent}60 0%, transparent 70%)` }}
            />
          )}
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
              {work.genres?.map((g) => (
                <Badge key={g} variant="default">{g}</Badge>
              ))}
              <Badge variant="gold">{work.releaseYear}</Badge>
              {work.isNew && <Badge variant="new">New</Badge>}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {work.title}
            </motion.h1>
            {work.tagline && (
              <motion.p
                variants={fadeUp}
                className="text-lg text-white/60 italic"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {work.tagline}
              </motion.p>
            )}
            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
              {work.duration && (
                <>
                  <span className="text-sm text-white/50">
                    {Math.floor(work.duration / 60)}h {work.duration % 60}m
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                </>
              )}
              {work.rating && (
                <span className="text-sm text-white/50">★ {work.rating.toFixed(1)}</span>
              )}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/20 to-transparent" />
      </section>

      {/* Main content */}
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-3 gap-16"
      >
        {/* Synopsis + trailer + awards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="lg:col-span-2 space-y-12"
        >
          {/* Synopsis */}
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Synopsis</p>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
              {work.synopsis}
            </p>
          </motion.div>

          {/* Trailer */}
          {work.trailer && (
            <motion.div variants={fadeUp}>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Trailer</p>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-bg-card)]">
                <video
                  src={work.trailer.url}
                  controls
                  poster={work.heroImage ? urlForImage(work.heroImage, 1200, 80) : undefined}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Trailer placeholder when no real video */}
          {!work.trailer && (
            <motion.div variants={fadeUp}>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Trailer</p>
              <div
                className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-bg-card)] flex items-center justify-center cursor-pointer group"
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${accent}30 0%, var(--color-bg-card) 70%)` }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full glass flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-white">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </motion.div>
                <p className="absolute bottom-4 text-xs text-white/30 tracking-widest uppercase">Coming Soon</p>
              </div>
            </motion.div>
          )}

          {/* Awards */}
          {work.awards && work.awards.length > 0 && (
            <motion.div variants={fadeUp}>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-6">Recognition</p>
              <div className="space-y-3">
                {work.awards.map((award) => (
                  <div
                    key={award._key}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                  >
                    <span className={award.status === 'winner' ? 'text-[var(--color-accent-gold)] text-lg' : 'text-[var(--color-text-muted)] text-lg'}>
                      {award.status === 'winner' ? '✦' : '◇'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-text-primary)]">{award.category}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{award.festivalName} · {award.year}</p>
                    </div>
                    <Badge variant={award.status === 'winner' ? 'gold' : 'muted'}>
                      {award.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gallery strip */}
          {work.galleryImages && work.galleryImages.length > 0 && (
            <motion.div variants={fadeUp}>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Gallery</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {work.galleryImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden relative">
                    <Image
                      src={urlForImage(img, 256, 80)}
                      alt={`Gallery ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
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
            {work.streamingPlatforms && work.streamingPlatforms.length > 0 ? (
              work.streamingPlatforms.map((platform) => (
                <a key={platform._key} href={platform.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="md" magnetic className="w-full">
                    Watch on {platform.platform}
                  </Button>
                </a>
              ))
            ) : (
              <Button variant="primary" size="md" magnetic className="w-full">
                Stream This Film
              </Button>
            )}
            <Button variant="secondary" size="md" className="w-full">
              + Add to Watchlist
            </Button>
          </motion.div>

          {/* Cast */}
          {work.cast && work.cast.length > 0 && (
            <motion.div variants={fadeUp}>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Cast</p>
              <div className="space-y-3">
                {work.cast.map(({ _key, name, role, photo }) => (
                  <div key={_key} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                      {photo ? (
                        <Image src={urlForImage(photo, 72, 80)} alt={name} width={36} height={36} className="object-cover" />
                      ) : (
                        name[0]
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-primary)]">{name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Crew */}
          {work.crew && work.crew.length > 0 && (
            <motion.div variants={fadeUp}>
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">Crew</p>
              <div className="space-y-2">
                {work.crew.slice(0, 6).map(({ _key, name, title }) => (
                  <div key={_key} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">{title}</span>
                    <span className="text-[var(--color-text-secondary)]">{name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
