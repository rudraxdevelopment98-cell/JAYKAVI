'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/songs', label: 'Songs' },
  { href: '/explore', label: 'Collections' },
  { href: '/lyrics', label: 'Lyrics' },
  { href: '/journey', label: 'Journey' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav({ skin = 'default' }: { skin?: string }) {
  const traditional = skin === 'traditional';
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // The fully-transparent "floating over the hero" look is only wanted on the
  // home page (which has a full-bleed hero). On every other page the nav floats
  // over normal content, so we give it its solid theme background immediately
  // — that keeps the links readable (var(--text) on the nav panel) in every
  // theme and light/dark mode, instead of depending on whatever sits behind it.
  const isHome = pathname === '/';
  const solid = scrolled || !isHome;

  return (
    <>
      <nav className={`site-nav${solid ? ' scrolled' : ''}`}>
        {/* Logo */}
        <Link href="/" className="nav-logo font-serif" onClick={() => setOpen(false)}>
          JAY<span className="accent">KAVI</span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link${pathname === link.href ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {traditional && (
            <li><Link href="/contact" className="nav-book">📩 Booking</Link></li>
          )}
          <li>
            <button
              type="button"
              className="nav-search"
              onClick={() => window.dispatchEvent(new Event('open-search'))}
              aria-label="Search (Ctrl+K)"
              title="Search  ⌘K"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="nav-search-k">⌘K</span>
            </button>
          </li>
          <li><ThemeToggle /></li>
        </ul>

        {/* Mobile right side */}
        <div className="nav-mobile-right">
          <button
            type="button"
            className="nav-search nav-search--mobile"
            onClick={() => window.dispatchEvent(new Event('open-search'))}
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <ThemeToggle />
          <button
            className="nav-burger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className={`burger-line${open ? ' open' : ''}`} />
            <span className={`burger-line${open ? ' open' : ''}`} />
            <span className={`burger-line${open ? ' open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <nav className="mobile-nav">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-link font-serif${pathname === link.href ? ' active' : ''}`}
              style={{ transitionDelay: open ? `${i * 0.05}s` : '0s' }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <style>{`
        /* ── Nav bar ── */
        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 6vw;
          transition: padding .35s ease, background .35s ease, border-color .35s ease;
          border-bottom: 1px solid transparent;
        }
        .site-nav.scrolled {
          padding: 14px 6vw;
          background: var(--panel);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-color: var(--line);
        }

        /* ── Logo ── */
        .nav-logo {
          font-family: var(--font-fraunces), Georgia, serif;
          font-weight: 400; font-size: 1.45rem; letter-spacing: -.01em;
          text-decoration: none; z-index: 2;
        }

        /* ── Desktop links ── */
        .nav-links {
          display: flex; gap: 30px; list-style: none; align-items: center; margin: 0; padding: 0;
        }
        .nav-link {
          position: relative;
          font-family: var(--font-hanken), system-ui, sans-serif;
          text-decoration: none; font-size: .78rem; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase;
          opacity: .72; padding-bottom: 4px;
          transition: opacity .25s ease, letter-spacing .3s ease, transform .25s ease;
        }
        /* Animated gradient underline that sweeps out from the centre */
        .nav-link::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          transform: scaleX(0); transform-origin: center;
          transition: transform .38s cubic-bezier(.65,0,.35,1);
        }
        /* Soft glow dot that fades in above the link on hover */
        .nav-link::before {
          content: ""; position: absolute; top: -7px; left: 50%; width: 4px; height: 4px;
          border-radius: 50%; background: var(--accent); opacity: 0;
          transform: translateX(-50%) scale(.4);
          box-shadow: 0 0 10px var(--accent);
          transition: opacity .3s ease, transform .3s ease;
        }
        .nav-link:hover {
          opacity: 1; letter-spacing: .11em; transform: translateY(-1px);
        }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link:hover::before { opacity: 1; transform: translateX(-50%) scale(1); }
        .nav-link.active { opacity: 1; }
        .nav-link.active::after { transform: scaleX(1); }

        /* ── Search trigger ── */
        .nav-search {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--panel); color: var(--text);
          border: 1px solid var(--line); border-radius: 100px;
          padding: 6px 12px; cursor: pointer; opacity: .82;
          transition: opacity .25s ease, border-color .25s ease, transform .2s ease;
        }
        .nav-search:hover { opacity: 1; border-color: var(--accent); transform: translateY(-1px); }
        .nav-search-k {
          font-size: .66rem; letter-spacing: .04em; opacity: .6;
          font-family: var(--font-hanken), system-ui, sans-serif;
        }
        .nav-search--mobile {
          padding: 8px; border-radius: 10px;
        }

        /* ── Mobile right ── */
        .nav-mobile-right {
          display: none; align-items: center; gap: 10px; z-index: 2;
        }

        /* ── Burger ── */
        .nav-burger {
          display: flex; flex-direction: column; justify-content: center; gap: 5px;
          width: 40px; height: 40px; background: none; border: none;
          cursor: pointer; padding: 8px; border-radius: 8px;
        }
        .burger-line {
          display: block; width: 22px; height: 2px;
          background: var(--text); border-radius: 2px;
          transition: transform .3s ease, opacity .3s ease;
          transform-origin: center;
        }
        .burger-line.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .burger-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .burger-line.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .mobile-drawer {
          position: fixed; inset: 0; z-index: 199;
          background: var(--bg);
          display: flex; flex-direction: column; justify-content: center;
          padding: 0 8vw;
          opacity: 0; pointer-events: none;
          transition: opacity .3s ease;
        }
        .mobile-drawer.open {
          opacity: 1; pointer-events: auto;
        }
        .mobile-nav {
          display: flex; flex-direction: column; gap: 4px;
        }
        .mobile-link {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(2.2rem, 9vw, 3.5rem); font-weight: 300; letter-spacing: -.02em;
          text-decoration: none; padding: 10px 0;
          border-bottom: 1px solid var(--line);
          opacity: 0; transform: translateY(16px);
          transition: opacity .3s ease, transform .3s ease, color .2s;
          color: var(--text);
        }
        .mobile-drawer.open .mobile-link {
          opacity: 1; transform: translateY(0);
        }
        .mobile-link.active { color: var(--accent); }
        .mobile-link:last-child { border-bottom: none; }

        /* ── Breakpoint ── */
        @media (max-width: 820px) {
          .nav-links { display: none !important; }
          .nav-mobile-right { display: flex !important; }
        }
      `}</style>
    </>
  );
}
