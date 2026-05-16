import { cn } from '@/lib/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block border-2 rounded-full animate-spin',
        'border-[var(--color-border-strong)] border-t-[var(--color-accent-gold)]',
        sizes[size],
        className
      )}
    />
  );
}
