'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem  { href: string; label: string; }
interface NavGroup { group: string | null; items: NavItem[]; }

const DEFAULT_W = 220;
const MIN_W      = 180;
const MAX_W      = 320;

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [width, setWidth]           = useState(DEFAULT_W);
  const [collapsed, setCollapsed]   = useState<Set<string>>(new Set());
  const pathname = usePathname();

  const dragging  = useRef(false);
  const startX    = useRef(0);
  const startW    = useRef(0);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  }

  function toggleGroup(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  // ── Drag-to-resize ─────────────────────────────────────────────────────────
  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = width;
    document.body.style.userSelect = 'none';
    document.body.style.cursor     = 'col-resize';
  }, [width]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      const next = Math.min(MAX_W, Math.max(MIN_W, startW.current + e.clientX - startX.current));
      setWidth(next);
    }
    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // ── Sidebar contents ────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sticky header */}
      <div className="flex-shrink-0 sticky top-0 z-10
        bg-neutral-950 md:bg-neutral-900
        border-b border-neutral-800
        px-4 pt-5 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[11px] text-neutral-500
            hover:text-neutral-300 transition mb-2"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          View site
        </Link>
        <p className="text-base font-semibold tracking-tight text-neutral-100 leading-tight">
          JAYKAVI Admin
        </p>
        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{email}</p>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 min-h-0">
        {navGroups.map((g, gi) => {
          if (!g.group) {
            /* ungrouped items rendered directly */
            return g.items.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} />
            ));
          }

          const isOpen = !collapsed.has(g.group);
          return (
            <div key={gi}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(g.group!)}
                className="w-full flex items-center justify-between
                  px-2 py-1.5 mt-2 rounded-md
                  text-[10px] font-semibold uppercase tracking-widest
                  text-neutral-500 hover:text-neutral-300
                  hover:bg-neutral-800/50 transition select-none"
              >
                <span>{g.group}</span>
                <svg
                  width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  aria-hidden
                  style={{
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Collapsible items */}
              <div
                style={{
                  maxHeight: isOpen ? `${g.items.length * 38}px` : '0px',
                  overflow:  'hidden',
                  transition: 'max-height 0.25s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <ul className="mt-0.5 space-y-0.5 pb-1">
                  {g.items.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} active={isActive(item.href)} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sticky footer */}
      <div className="flex-shrink-0 sticky bottom-0
        bg-neutral-950 md:bg-neutral-900
        border-t border-neutral-800
        px-2 py-3 space-y-0.5">
        {sidebarFooter}
      </div>
    </div>
  );

  return (
    <div className="admin-shell min-h-screen bg-neutral-950 text-neutral-100">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3
        border-b border-neutral-800 bg-neutral-900">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="flex items-center justify-center w-8 h-8 rounded
            text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
        <span className="text-sm font-medium text-neutral-300">Admin</span>
        <Link href="/" className="ml-auto text-xs text-neutral-500 hover:text-neutral-300 transition">
          ← Site
        </Link>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex">

        {/* ── Sidebar ── */}
        <aside
          style={{ width }}
          className={[
            /* mobile: fixed overlay */
            'fixed top-0 left-0 z-50 h-screen',
            /* desktop: sticky column */
            'md:sticky md:top-0 md:left-auto md:z-auto md:self-start md:h-screen',
            'flex-shrink-0 border-r border-neutral-800',
            'bg-neutral-950 md:bg-neutral-900',
            'transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          {sidebar}

          {/* Drag handle — desktop only */}
          <div
            onMouseDown={onDragStart}
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize
              hidden md:flex items-center justify-center group"
            title="Drag to resize"
          >
            <div className="w-0.5 h-12 rounded-full bg-neutral-800
              group-hover:bg-amber-500/50 transition" />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

// ── Shared nav link ─────────────────────────────────────────────────────────
function NavLink({ item, active }: { item: { href: string; label: string }; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all ${
        active
          ? 'bg-amber-500/15 text-amber-300 font-medium'
          : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70'
      }`}
    >
      {item.label}
    </Link>
  );
}
