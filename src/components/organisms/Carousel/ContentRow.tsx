'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ContentRowProps<T> {
  title: string;
  subtitle?: string;
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  cardWidth?: number;
  gap?: number;
  viewAllHref?: string;
  className?: string;
}

export function ContentRow<T>({
  title,
  subtitle,
  items,
  renderCard,
  cardWidth = 220,
  gap = 16,
  viewAllHref,
  className,
}: ContentRowProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 40 });

  const dragStartX = useRef(0);
  const dragStartMotion = useRef(0);

  const clampX = useCallback(
    (val: number) => {
      if (!trackRef.current) return val;
      const trackWidth = trackRef.current.scrollWidth;
      const containerWidth = trackRef.current.parentElement?.offsetWidth ?? 0;
      const min = -(trackWidth - containerWidth);
      return Math.max(min, Math.min(0, val));
    },
    []
  );

  const updateArrows = useCallback((currentX: number) => {
    setCanScrollLeft(currentX < -1);
    if (!trackRef.current) return;
    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = trackRef.current.parentElement?.offsetWidth ?? 0;
    setCanScrollRight(currentX > -(trackWidth - containerWidth) + 1);
  }, []);

  const scrollBy = useCallback(
    (direction: 'left' | 'right') => {
      const step = cardWidth * 3 + gap * 3;
      const next = clampX(x.get() + (direction === 'left' ? step : -step));
      animate(x, next, { type: 'spring', stiffness: 300, damping: 35 });
      updateArrows(next);
    },
    [cardWidth, gap, clampX, x, updateArrows]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      setIsDragging(false);
      dragStartX.current = e.clientX;
      dragStartMotion.current = x.get();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [x]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!e.buttons) return;
      const delta = e.clientX - dragStartX.current;
      if (Math.abs(delta) > 4) setIsDragging(true);
      const next = clampX(dragStartMotion.current + delta);
      x.set(next);
      updateArrows(next);
    },
    [clampX, x, updateArrows]
  );

  const onPointerUp = useCallback(() => {
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  return (
    <section className={cn('py-8', className)}>
      {/* Header */}
      <div className="px-6 lg:px-12 flex items-baseline justify-between mb-5">
        <div>
          <h2
            className="text-xl font-light text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors tracking-wide"
            >
              View all
            </a>
          )}
          {/* Arrow controls */}
          <div className="hidden md:flex gap-2">
            <NavArrow
              direction="left"
              disabled={!canScrollLeft}
              onClick={() => scrollBy('left')}
            />
            <NavArrow
              direction="right"
              disabled={!canScrollRight}
              onClick={() => scrollBy('right')}
            />
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="overflow-hidden pl-6 lg:pl-12">
        <motion.div
          ref={trackRef}
          style={{ x: springX }}
          className={cn(
            'flex',
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                width: cardWidth,
                marginRight: i < items.length - 1 ? gap : 0,
                pointerEvents: isDragging ? 'none' : 'auto',
              }}
            >
              {renderCard(item, i)}
            </div>
          ))}
          {/* Trailing fade spacer */}
          <div className="flex-shrink-0 w-12" />
        </motion.div>
      </div>
    </section>
  );
}

function NavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={cn(
        'w-8 h-8 rounded-full glass flex items-center justify-center transition-opacity duration-200',
        disabled ? 'opacity-25 pointer-events-none' : 'opacity-100 hover:border-[var(--color-accent-gold)]'
      )}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={direction === 'right' ? '' : 'rotate-180'}
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </motion.button>
  );
}
