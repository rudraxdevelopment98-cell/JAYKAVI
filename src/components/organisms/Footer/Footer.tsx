import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const NAV_COLS = [
  {
    heading: 'Explore',
    links: [
      { href: '/explore', label: 'All Works' },
      { href: '/gallery', label: 'Gallery' },
      { href: '/events', label: 'Events' },
      { href: '/journey', label: 'Our Journey' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/blog', label: 'Press' },
      { href: '#newsletter', label: 'Newsletter' },
    ],
  },
];

const SOCIAL = [
  { href: '#', label: 'Instagram', icon: InstagramIcon },
  { href: '#', label: 'Vimeo', icon: VimeoIcon },
  { href: '#', label: 'Twitter / X', icon: TwitterIcon },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <p
            className="text-2xl font-light tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Jay<span className="text-gradient-gold">Kavi</span>
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed">
            A cinematic journey through storytelling, art, and moving image.
          </p>
          <div className="flex gap-4 pt-2">
            {SOCIAL.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-gold)] transition-colors"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map(({ heading, links }) => (
          <div key={heading} className="space-y-4">
            <p className="text-xs font-medium tracking-widest uppercase text-[var(--color-text-muted)]">
              {heading}
            </p>
            <ul className="space-y-3">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)] px-6 lg:px-12 py-5 max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
        <span>© {new Date().getFullYear()} JAYKAVI. All rights reserved.</span>
        <div className={cn('flex gap-6')}>
          <Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function VimeoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.48 4.807z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
