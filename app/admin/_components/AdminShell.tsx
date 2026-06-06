'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem  { href: string; label: string; }
interface NavGroup { group: string | null; items: NavItem[]; }

export default function AdminShell({
  navGroups,
  email,
  sidebarFooter,
  children,
}: {
  navGroups: NavGroup[];
  email: string;
  sidebarFooter: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* ── Sticky sidebar header ── */}
      <div className="sticky top-0 z-10 bg-neutral-950 md:bg-neutral-900/95 backdrop-blur-sm pt-6 pb-3 px-6 -mx-6 border-b border-neutral-800/60 mb-3">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition">
          ← View site
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold tracking-tight">JAYKAVI Admin</h2>
        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{email}</p>
      </div>

      {/* ── Grouped nav ── */}
      <nav className="flex-1 px-2 space-y-5 pb-4">
        {navGroups.map((g, gi) => (
          <div key={gi}>
            {g.group && (
              <p className="px-1 mb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
                {g.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                      isActive(item.href)
                        ? 'bg-amber-500/15 text-amber-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer (sign-out, theme toggle) ── */}
      <div className="sticky bottom-0 bg-neutral-950 md:bg-neutral-900/95 backdrop-blur-sm pt-3 pb-5 px-2 -mx-6 border-t border-neutral-800/60 mt-2 px-8 space-y-1">
        {sidebarFooter}
      </div>
    </>
  );

  return (
    <div className="admin-shell min-h-screen bg-neutral-950 text-neutral-100">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-center w-8 h-8 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
        <span className="text-sm font-medium text-neutral-300">Admin Menu</span>
        <Link href="/" className="ml-auto text-xs text-neutral-500 hover:text-neutral-300 transition">
          ← Site
        </Link>
      </div>

      {/* ── Mobile overlay ── */}
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
            'fixed top-0 left-0 z-50 h-screen flex flex-col overflow-y-auto',
            'md:sticky md:top-0 md:left-auto md:z-auto md:self-start md:h-screen md:flex-col',
            'w-60 flex-shrink-0 border-r border-neutral-800',
            'bg-neutral-950 md:bg-neutral-900/50',
            'transition-transform duration-200 ease-out',
            open ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          {sidebarContent}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
