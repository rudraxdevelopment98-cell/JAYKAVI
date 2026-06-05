'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem { href: string; label: string; }

export default function AdminShell({
  navItems,
  email,
  sidebarFooter,
  children,
}: {
  navItems: NavItem[];
  email: string;
  sidebarFooter: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when navigating
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="admin-shell min-h-screen bg-neutral-950 text-neutral-100">

      {/* ── Mobile admin bar (hidden on md+) — sticky so it stays on scroll ── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-center w-8 h-8 rounded text-neutral-400
            hover:text-neutral-100 hover:bg-neutral-800 transition"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
        <span className="text-sm font-medium text-neutral-300">Admin Menu</span>
        <Link href="/" className="ml-auto text-xs text-neutral-500 hover:text-neutral-300 transition">
          ← Site
        </Link>
      </div>

      {/* ── Overlay (mobile only) ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside
          className={[
            // Mobile: fixed overlay panel
            'fixed top-0 left-0 z-50 h-screen overflow-y-auto',
            // Desktop: sticky so the sidebar stays put while the page scrolls
            'md:sticky md:top-0 md:left-auto md:z-auto md:self-start md:h-screen',
            // Sizing & border
            'w-64 flex-shrink-0 border-r border-neutral-800',
            // Background (lighter on desktop, darker overlay on mobile)
            'bg-neutral-950 md:bg-neutral-900/50',
            'p-6',
            // Slide animation
            'transition-transform duration-200 ease-out',
            open ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          <div className="mb-8">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
              ← View site
            </Link>
            <h2 className="mt-2 text-xl font-semibold">JAYKAVI Admin</h2>
            <p className="text-xs text-neutral-500 mt-1">{email}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm hover:bg-neutral-800 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 space-y-1">{sidebarFooter}</div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
