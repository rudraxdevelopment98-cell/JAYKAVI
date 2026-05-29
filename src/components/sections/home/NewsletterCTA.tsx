'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/atoms/Button';
import { useInView } from '@/hooks/useInView';
import { fadeUp, staggerContainer } from '@/lib/animations/variants';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { ref, inView } = useInView(0.2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-[var(--color-bg-secondary)] relative overflow-hidden">
      {/* Decorative grain */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '180px',
        }}
      />

      <motion.div
        ref={ref as React.RefObject<HTMLDivElement>}
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center"
      >
        <motion.p variants={fadeUp} className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">
          Stay Connected
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="text-[clamp(2rem,4vw,3.5rem)] font-light text-[var(--color-text-primary)] mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Join the Journey
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-[var(--color-text-muted)] mb-12 max-w-md mx-auto"
        >
          Receive exclusive previews, event invitations, and behind-the-scenes stories directly from our world.
        </motion.p>

        {status === 'success' ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[var(--color-accent-gold)] text-lg"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Welcome to the journey. ✦
          </motion.p>
        ) : (
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full px-6 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-gold)] transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={status === 'loading'}
              magnetic
            >
              Subscribe
            </Button>
          </motion.form>
        )}

        <motion.p
          variants={fadeUp}
          className="text-xs text-[var(--color-text-muted)] mt-5"
        >
          No spam. Unsubscribe anytime.
        </motion.p>
      </motion.div>
    </section>
  );
}
