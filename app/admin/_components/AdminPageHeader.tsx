import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Standard sticky header for every admin page.
 *
 * IMPORTANT: render this as a DIRECT child of <main> (i.e. the outermost
 * element of the page, before any `max-w-*` content wrapper) so the
 * `admin-sticky-header` full-bleed negative margins line up with main's
 * padding. Wrap the page in a fragment:
 *
 *   return (
 *     <>
 *       <AdminPageHeader title="Songs" subtitle="42 total" actions={<Link…/>} />
 *       <div className="max-w-4xl"> …content… </div>
 *     </>
 *   );
 *
 * For detail / edit / new pages, pass backHref + backLabel to get a small
 * breadcrumb-style back link above the title.
 */
export default function AdminPageHeader({
  title,
  subtitle,
  actions,
  backHref,
  backLabel,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="admin-sticky-header">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-100 transition mb-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {backLabel ?? 'Back'}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle != null && (
            <div className="text-neutral-400 mt-1 text-sm">{subtitle}</div>
          )}
        </div>
        {actions != null && (
          <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
