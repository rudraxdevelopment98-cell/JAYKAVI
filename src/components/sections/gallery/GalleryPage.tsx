'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, scaleIn } from '@/lib/animations/variants';
import { urlForImage } from '@/lib/sanity/client';
import type { GalleryItem } from '@/types/content';

const ACCENTS = ['#7c3aed', '#c9a84c', '#a8c5da', '#8b1a1a', '#00e5ff', '#7c3aed', '#c9a84c', '#a8c5da'];

// Placeholder items when no Sanity data
const PLACEHOLDER: Partial<GalleryItem>[] = Array.from({ length: 16 }, (_, i) => ({
  _id: String(i + 1),
  title: ['Luminance Study I', 'Nocturnal Forms', 'The Weight of Light', 'Echoing Planes', 'Threshold', 'Still Life with Shadows', 'Chromatic Dissolution', 'Form & Void', 'The Architecture of Silence', 'Temporal Drift', 'Spectral Residue', 'Untitled #7', 'Passage', 'Resonance', 'The Observer', 'Liminal Space'][i],
  medium: ['Digital Photography', 'Oil on Canvas', 'Video Installation', 'Mixed Media', 'Silver Gelatin', 'Digital Painting', 'Screen Print', 'Sculpture', 'Photography', 'Projection Art', 'Collage', 'Ink on Paper', 'Photography', 'Video', 'Digital', 'Mixed'][i],
  year: 2020 + (i % 5),
  slug: { current: `artwork-${i + 1}` },
}));

interface GalleryPageProps {
  items?: GalleryItem[];
}

export function GalleryPage({ items }: GalleryPageProps) {
  const [selected, setSelected] = useState<Partial<GalleryItem> | null>(null);
  const { ref, inView } = useInView(0.05);

  const allItems = items && items.length > 0 ? items : (PLACEHOLDER as GalleryItem[]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 lg:py-36 border-b border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4"
          >
            Visual Archive
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-6 text-base text-[var(--color-text-muted)] max-w-md"
          >
            A curated collection of visual works — photographs, paintings, installations, and moving image.
          </motion.p>
        </div>
      </section>

      {/* Masonry grid */}
      <section className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-gap:1rem]"
        >
          {allItems.map((art, i) => (
            <motion.div
              key={art._id}
              variants={scaleIn}
              className="break-inside-avoid mb-4 cursor-pointer group"
              onClick={() => setSelected(art)}
            >
              <div className="relative rounded-xl overflow-hidden bg-[var(--color-bg-card)]">
                {art.image ? (
                  <Image
                    src={urlForImage(art.image, 600, 80)}
                    alt={art.title ?? ''}
                    width={600}
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full"
                    style={{ paddingBottom: `${60 + (i % 4) * 15}%`, position: 'relative' }}
                  >
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                        style={{ background: `radial-gradient(ellipse at 40% 30%, ${ACCENTS[i % ACCENTS.length]} 0%, transparent 70%)` }}
                      />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 flex items-center justify-center">
                  <span className="text-white/80 text-xs tracking-widest uppercase">View</span>
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-sm text-[var(--color-text-primary)] leading-snug">{art.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{art.medium} · {art.year}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-8"
            onClick={() => setSelected(null)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full z-10"
            >
              <div className="rounded-2xl overflow-hidden bg-[var(--color-bg-card)] relative aspect-square">
                {selected.image ? (
                  <Image
                    src={urlForImage(selected.image, 800, 90)}
                    alt={selected.title ?? ''}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-purple)]/30 to-[var(--color-bg-card)]" />
                )}
              </div>
              <div className="mt-4">
                <h2
                  className="text-2xl font-light text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {selected.title}
                </h2>
                <p className="text-sm text-white/50 mt-1">{selected.medium} · {selected.year}</p>
                {selected.artistStatement && (
                  <p className="text-sm text-white/60 mt-3 leading-relaxed italic">
                    "{selected.artistStatement}"
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
