'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

const UPCOMING_EVENTS = [
  {
    id: '1',
    title: 'World Premiere: Echoes of Time',
    type: 'Premiere',
    date: '2025-07-15',
    location: 'Palais des Festivals, Cannes',
    country: 'France',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Gallery Exhibition: Canvas of Dreams',
    type: 'Installation',
    date: '2025-08-02',
    location: 'Saatchi Gallery, London',
    country: 'UK',
    isFeatured: false,
  },
  {
    id: '3',
    title: 'Special Screening: The Last Frame',
    type: 'Screening',
    date: '2025-08-20',
    location: 'IFC Center, New York',
    country: 'USA',
    isFeatured: false,
  },
  {
    id: '4',
    title: 'Live Event: A Night of Cinema',
    type: 'Live',
    date: '2025-09-10',
    location: 'Royal Opera House, Mumbai',
    country: 'India',
    isFeatured: false,
  },
];

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex gap-6">
      {Object.entries(timeLeft).map(([unit, val]) => (
        <div key={unit} className="text-center">
          <motion.p
            key={val}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[clamp(2rem,5vw,4rem)] font-light text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {String(val).padStart(2, '0')}
          </motion.p>
          <p className="text-[10px] tracking-widest uppercase text-[var(--color-text-muted)]">{unit}</p>
        </div>
      ))}
    </div>
  );
}

export function EventsPage() {
  const { ref, inView } = useInView(0.1);
  const featured = UPCOMING_EVENTS.find((e) => e.isFeatured)!;

  return (
    <div className="min-h-screen">
      {/* Hero with countdown */}
      <section className="relative py-24 lg:py-32 border-b border-[var(--color-border)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4"
          >
            Next Event
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[clamp(1.8rem,4vw,3.5rem)] font-light text-[var(--color-text-primary)] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {featured.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-[var(--color-text-muted)] mb-12"
          >
            {featured.location} · {featured.country}
          </motion.p>
          <CountdownTimer targetDate={featured.date} />
        </div>
      </section>

      {/* Events list */}
      <section className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-12">
          Upcoming Events
        </p>
        <motion.div
          ref={ref as React.RefObject<HTMLDivElement>}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-px bg-[var(--color-border)]"
        >
          {UPCOMING_EVENTS.map((event) => (
            <motion.div
              key={event.id}
              variants={fadeUp}
              className="group bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors duration-300 px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-6">
                <div className="text-center min-w-[60px]">
                  <p className="text-2xl font-light text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {new Date(event.date).getDate()}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                    {new Date(event.date).toLocaleString('en', { month: 'short' })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="muted">{event.type}</Badge>
                    {event.isFeatured && <Badge variant="gold">Featured</Badge>}
                  </div>
                  <h3 className="text-lg text-[var(--color-text-primary)]">{event.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {event.location} · {event.country}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                Learn More →
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
