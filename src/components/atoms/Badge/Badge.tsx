import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'new' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase',
        variant === 'default' && 'glass border-[var(--glass-border)] text-[var(--color-text-secondary)]',
        variant === 'gold' && 'bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/30 text-[var(--color-accent-gold)]',
        variant === 'new' && 'bg-[var(--color-accent-neon)]/10 border border-[var(--color-accent-neon)]/30 text-[var(--color-accent-neon)]',
        variant === 'muted' && 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]',
        className
      )}
    >
      {children}
    </span>
  );
}
