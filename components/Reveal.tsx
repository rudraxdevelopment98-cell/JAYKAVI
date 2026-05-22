'use client';
import { motion } from 'framer-motion';

export function TextReveal({ children, delay = 0, className = '', as = 'span' }: {
  children: React.ReactNode; delay?: number; className?: string; as?: 'span' | 'div';
}) {
  const Comp = motion[as];
  return (
    <span style={{ display: 'block', overflow: 'hidden' }}>
      <Comp
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
        style={{ display: 'block' }}
      >
        {children}
      </Comp>
    </span>
  );
}

export function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
