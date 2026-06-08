import Link from 'next/link';
import type { ReactNode } from 'react';

interface Crumb { href: string; label: string; }

/**
 * Standard admin page header. Use at the top of every admin page so the
 * spacing, typography, and action placement stay consistent.
 *
 * <PageHeader
 *   title="Songs"
 *   subtitle="42 in catalog"
 *   crumbs={[{ href: '/admin', label: 'Dashboard' }]}
 *   actions={<Link href="/admin/songs/new" className="btn-primary">+ New</Link>}
 * />
 */
export default function PageHeader({
  title,
  subtitle,
  crumbs,
  actions,
  sticky = false,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <header
      className={`mb-6 flex items-end justify-between gap-4 flex-wrap ${
        sticky ? 'sticky top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 py-4 bg-neutral-950/90 backdrop-blur border-b border-neutral-800' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5">
            {crumbs.map((c, i) => (
              <span key={c.href} className="inline-flex items-center gap-1.5">
                <Link href={c.href} className="hover:text-neutral-200 transition">{c.label}</Link>
                <span className="text-neutral-700">/</span>
              </span>
            ))}
            <span className="text-neutral-400">{title}</span>
          </nav>
        )}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-50 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
