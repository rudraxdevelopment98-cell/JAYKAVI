'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils/cn';
import type { Work } from '@/types/content';
import { formatDuration } from '@/lib/utils/format';

interface ContentCardProps {
  work: Work;
  variant?: 'row' | 'grid' | 'featured';
  priority?: boolean;
  className?: string;
}

export function ContentCard({
  work,
  variant = 'grid',
  priority = false,
  className,
}: ContentCardProps) {
  const [hovered, setHovered] = useState(false);

  const isFeatured = variant === 'featured';

  return (
    <Link href={`/work/${work.slug.current}`}>
      <motion.article
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative overflow-hidden rounded-2xl cursor-pointer group',
          variant === 'row' && 'w-[280px] flex-shrink-0',
          variant === 'grid' && 'w-full',
          variant === 'featured' && 'w-full',
          className
        )}
      >
        {/* Image container */}
        <div
          className={cn(
            'relative overflow-hidden bg-[var(--color-bg-card)]',
            variant === 'row' && 'aspect-[2/3]',
            variant === 'grid' && 'aspect-[2/3]',
            variant === 'featured' && 'aspect-[16/9]'
          )}
        >
          {/* Placeholder gradient when no image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-purple)]/20 to-[var(--color-bg-card)]" />

          {/* Scale on hover */}
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Real image would go here with Next.js Image */}
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* New badge */}
          {work.isNew && (
            <div className="absolute top-3 left-3">
              <Badge variant="new">New</Badge>
            </div>
          )}

          {/* Info on hover */}
          <motion.div
            className="absolute inset-x-0 bottom-0 p-4 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.25 }}
          >
            {work.duration && (
              <p className="text-xs text-white/60">{formatDuration(work.duration)}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {work.genres.slice(0, 2).map((g) => (
                <Badge key={g} variant="muted" className="text-[10px]">
                  {g}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Card footer */}
        <div
          className={cn(
            'p-3 space-y-1',
            isFeatured ? 'p-4' : 'p-3'
          )}
        >
          <p
            className={cn(
              'font-medium text-[var(--color-text-primary)] leading-snug line-clamp-1',
              isFeatured ? 'text-base' : 'text-sm'
            )}
          >
            {work.title}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {work.releaseYear} · {work.category}
          </p>
        </div>
      </motion.article>
    </Link>
  );
}
