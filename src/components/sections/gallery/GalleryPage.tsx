'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, scaleIn } from '@/lib/animations/variants';

const ARTWORKS = Array.from({ length: 16 }, (_, i) => ({
  id: String(i + 1),
  title: ['Luminance Study I', 'Nocturnal Forms', 'The Weight of Light', 'Echoing Planes', 'Threshold', 'Still Life with Shadows', 'Chromatic Dissolution', 'Form & Void', 'The Architecture of Silence', 'Temporal Drift', 'Spectral Residue', 'Untitled #7', 'Passage', 'Resonance', 'The Observer', 'Liminal Space'][i],
  medium: ['Digital Photography', 'Oil on Canvas', 'Video Installation', 'Mixed Media', 'Silver Gelatin', 'Digital Painting', 'Screen Print', 'Sculpture', 'Photography', 'Projection Art', 'Collage', 'Ink on Paper', 'Photography', 'Video', 'Digital', 'Mixed'][i],
  year: 2020 + (i % 5),
  aspect: [1, 1.5, 0.75, 1, 1.2, 0.8, 1, 1.5, 0.9, 1, 1.3, 0.7, 1, 1.1, 0.85, 1][i],
  accent: ['#7c3aed', '#c9a84c', '#a8c5da', '#8b1a1a', '#00e5ff', '#7c3aed', '#c9a84c', '#a8c5da'][i % 8],
}));

export function GalleryPage() {
  const [selected, setSelected] = useState<(typeof ARTWORKS)[0] | null>(null);
  const { ref, inView } = useInView(0.05);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 lg:py-36 border-b border-[var(--color-border)] relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'var(--gradient-hero)' }}
        />
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
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        >
          {ARTWORKS.map((art) => (
            <motion.div
              key={art.id}
              variants={scaleIn}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setSelected(art)}
            >
              <div
                className="relative rounded-xl overflow-hidden bg-[var(--color-bg-card)] w-full"
                style={{ paddingBottom: `${(1 / art.aspect) * 100}%` }}
              >
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse at 40% 30%, ${art.accent} 0%, transparent 70%)` }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 flex items-center justify-center">
                    <span className="text-white/80 text-xs tracking-widest uppercase">View</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 px-1">
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full z-10"
            >
              <div
                className="rounded-2xl overflow-hidden bg-[var(--color-bg-card)] w-full"
                style={{ paddingBottom: `${(1 / selected.aspect) * 100}%`, position: 'relative' }}
              >
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0"
                    style={{ background: `radial-gradient(ellipse at 40% 30%, ${selected.accent}40 0%, transparent 70%)` }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <h2
                  className="text-2xl font-light text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {selected.title}
                </h2>
                <p className="text-sm text-white/50 mt-1">{selected.medium} · {selected.year}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
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
