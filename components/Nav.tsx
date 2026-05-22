'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/journey', label: 'Journey' },
  { href: '/songs', label: 'Songs' },
  { href: '/lyrics', label: 'Lyrics' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '14px 6vw' : '22px 6vw',
        background: scrolled ? 'var(--panel)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'all .4s ease',
      }}
    >
      <Link href="/" className="font-serif" style={{ fontWeight: 600, fontSize: '1.3rem', letterSpacing: '.5px', textDecoration: 'none' }}>
        JAY<span className="accent">KAVI</span>
      </Link>

      <ul style={{ display: 'flex', gap: 34, listStyle: 'none', alignItems: 'center', margin: 0 }} className="nav-desktop">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  textDecoration: 'none', fontSize: '.92rem', fontWeight: 500,
                  opacity: active ? 1 : 0.8,
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingBottom: 4, transition: 'opacity .3s',
                }}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <li><ThemeToggle /></li>
      </ul>

      {/* mobile */}
      <div className="nav-mobile" style={{ display: 'none', gap: 12, alignItems: 'center' }}>
        <ThemeToggle />
        <button onClick={() => setOpen(!open)} aria-label="Menu" style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.6rem', cursor: 'pointer' }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, top: 64, background: 'var(--bg)', zIndex: 99,
          display: 'flex', flexDirection: 'column', padding: '6vw', gap: 8,
        }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className="font-serif" style={{ fontSize: '2rem', textDecoration: 'none', padding: '10px 0' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
