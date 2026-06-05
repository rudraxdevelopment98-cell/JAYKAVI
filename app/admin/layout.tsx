import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { permissionForPath, hasPermission } from '@/lib/permissions';
import AdminThemeToggle from './_components/AdminThemeToggle';
import AdminShell from './_components/AdminShell';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/contact', label: 'Contact & Social' },
  { href: '/admin/messages', label: '✉️ Contact Messages' },
  { href: '/admin/singers', label: 'Singers' },
  { href: '/admin/collections', label: 'Collections' },
  { href: '/admin/songs', label: 'Songs' },
  { href: '/admin/journey', label: 'Journey' },
  { href: '/admin/blog', label: '📝 Blog' },
  { href: '/admin/notebook', label: '📓 Notebook' },
  { href: '/admin/harvester', label: '🎬 Song Harvester' },
  { href: '/admin/analytics', label: '📊 Analytics' },
  { href: '/admin/admins', label: '👤 Admins' },
  { href: '/admin/logs', label: '📜 Activity Log' },
  { href: '/admin/backup', label: '💾 Backup' },
  { href: '/admin/theme', label: '🎨 Site Theme' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: any = null;
  try { session = await auth(); } catch { /* AUTH_SECRET missing in dev */ }
  if (!session) return <>{children}</>;
  if (!session.isAdmin) redirect('/admin/login');

  // Only show sidebar items this admin is allowed to open.
  // Empty permissions = legacy full-access admin — show everything.
  const perms: string[] = session.permissions ?? [];
  const restricted = perms.length > 0;
  const navItems = NAV.filter((item) => {
    const required = permissionForPath(item.href);
    return required === null || !restricted || hasPermission(perms, required);
  });

  return (
    <AdminShell
      navItems={navItems}
      email={session.user?.email ?? ''}
      sidebarFooter={
        <>
          <AdminThemeToggle />
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/admin/login' });
            }}
          >
            <button
              type="submit"
              className="w-full px-3 py-2 text-left text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition"
            >
              Sign out
            </button>
          </form>
        </>
      }
    >
      {children}
    </AdminShell>
  );
}
