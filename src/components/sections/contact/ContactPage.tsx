'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils/cn';
import { staggerContainer, fadeUp } from '@/lib/animations/variants';
import { useInView } from '@/hooks/useInView';

const INQUIRY_TYPES = [
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'press', label: 'Press & Media' },
  { value: 'booking', label: 'Booking' },
  { value: 'general', label: 'General' },
] as const;

const schema = z.object({
  inquiryType: z.enum(['collaboration', 'press', 'booking', 'general']),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  organization: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { ref, inView } = useInView(0.1);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { inquiryType: 'general' } });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
  };

  const selectedType = watch('inquiryType');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 lg:py-36 border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Let's talk.
          </motion.h1>
        </div>
      </section>

      {/* Form + info */}
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="py-16 max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16"
      >
        {/* Form */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16"
            >
              <p
                className="text-4xl font-light text-[var(--color-accent-gold)] mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Message received.
              </p>
              <p className="text-[var(--color-text-muted)]">
                We typically respond within 48 hours. Thank you for reaching out.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Inquiry type */}
              <motion.div variants={fadeUp}>
                <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-4">
                  What's this about?
                </p>
                <div className="flex flex-wrap gap-3">
                  {INQUIRY_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('inquiryType', value)}
                      className={cn(
                        'px-5 py-2 rounded-full text-sm border transition-all duration-200',
                        selectedType === value
                          ? 'bg-[var(--color-accent-gold)] text-[var(--color-text-inverse)] border-transparent'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-gold)]'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Name + Email */}
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register('name')}
                    placeholder="Your name"
                    className="w-full bg-transparent border-b border-[var(--color-border)] pb-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-gold)] transition-colors"
                  />
                  {errors.name && (
                    <p className="text-xs text-[var(--color-accent-crimson)] mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Email address"
                    className="w-full bg-transparent border-b border-[var(--color-border)] pb-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-gold)] transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-[var(--color-accent-crimson)] mt-1">{errors.email.message}</p>
                  )}
                </div>
              </motion.div>

              {/* Organization */}
              <motion.div variants={fadeUp}>
                <input
                  {...register('organization')}
                  placeholder="Organization (optional)"
                  className="w-full bg-transparent border-b border-[var(--color-border)] pb-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-gold)] transition-colors"
                />
              </motion.div>

              {/* Message */}
              <motion.div variants={fadeUp}>
                <textarea
                  {...register('message')}
                  placeholder="Tell us about your project or inquiry..."
                  rows={5}
                  className="w-full bg-transparent border-b border-[var(--color-border)] pb-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent-gold)] transition-colors resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-[var(--color-accent-crimson)] mt-1">{errors.message.message}</p>
                )}
              </motion.div>

              <motion.div variants={fadeUp}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  magnetic
                >
                  Send Message
                </Button>
              </motion.div>
            </form>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-12 lg:pl-12"
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)] mb-4">
              Direct Contact
            </p>
            <a
              href="mailto:hello@jaykavi.com"
              className="text-2xl font-light text-[var(--color-text-primary)] hover:text-[var(--color-accent-gold)] transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              hello@jaykavi.com
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-text-muted)]">
              Social
            </p>
            {['Instagram', 'Vimeo', 'Twitter / X'].map((platform) => (
              <a
                key={platform}
                href="#"
                className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {platform} →
              </a>
            ))}
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-xs text-[var(--color-text-muted)] italic">
              We typically respond within 48 hours.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
