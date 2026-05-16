'use client';

import { forwardRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const button = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-medium text-sm tracking-wide',
    'rounded-full border transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)]',
    'disabled:opacity-40 disabled:pointer-events-none',
    'overflow-hidden select-none cursor-pointer',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-accent-gold)] text-[var(--color-text-inverse)]',
          'border-transparent',
          'hover:bg-[var(--color-accent-gold-light)]',
        ],
        secondary: [
          'bg-transparent text-[var(--color-text-primary)]',
          'border-[var(--color-border-strong)]',
          'hover:border-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold)]',
        ],
        ghost: [
          'bg-transparent text-[var(--color-text-secondary)]',
          'border-transparent',
          'hover:text-[var(--color-text-primary)] hover:bg-[var(--glass-bg)]',
        ],
        glass: [
          'glass text-[var(--color-text-primary)]',
          'border-[var(--glass-border)]',
          'hover:border-[var(--color-accent-gold)]',
        ],
        danger: [
          'bg-[var(--color-accent-crimson)] text-white',
          'border-transparent',
          'hover:opacity-80',
        ],
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'w-10 h-10 p-0',
      },
      magnetic: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      magnetic: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean;
  magnetic?: boolean;
  asChild?: never; // use <Link><Button> instead of asChild
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, magnetic, loading, children, ...props }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 300, damping: 20 });
    const springY = useSpring(y, { stiffness: 300, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.button
        ref={ref}
        style={magnetic ? { x: springX, y: springY } : undefined}
        whileTap={{ scale: 0.97 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(button({ variant, size, magnetic }), className)}
        disabled={loading || props.disabled}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        )}
        <span className={loading ? 'opacity-0' : undefined}>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
