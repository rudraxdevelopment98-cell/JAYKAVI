'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/atoms/Badge';
import { urlForImage } from '@/lib/sanity/client';
import type { Work } from '@/types/content';
import { formatDuration } from '@/lib/utils/format';

interface WorkCardProps {
  work: Work;
  priority?: boolean;
}

export function WorkCard({ work, priority = false }: WorkCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/work/${work.slug.current}`}>
      <motion.article
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-xl cursor-pointer group"
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-bg-card)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-purple)]/20 to-[var(--color-bg-card)]" />

          {work.heroImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={urlForImage(work.heroImage, 400, 80)}
                alt={work.title}
                fill
                className="object-cover"
                sizes="220px"
                priority={priority}
              />
            </motion.div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {work.isNew && (
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="new">New</Badge>
            </div>
          )}

          {/* Hover info panel */}
          <motion.div
            className="absolute inset-x-0 bottom-0 p-3 space-y-1.5 z-10"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
          >
            {work.duration && (
              <p className="text-[10px] text-white/50">{formatDuration(work.duration)}</p>
            )}
            {work.genres?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {work.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 tracking-wide uppercase"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Card footer */}
        <div className="pt-2 pb-1 px-0.5 space-y-0.5">
          <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug line-clamp-1">
            {work.title}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {work.releaseYear} · {work.category}
          </p>
        </div>
      </motion.article>
    </Link>
  );
}
