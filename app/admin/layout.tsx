import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { permissionForPath, hasPermission } from '@/lib/permissions';
import AdminThemeToggle from './_components/AdminThemeToggle';

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
  { href: '/admin/harvester', label: '🎬 Song Harvester' },
  { href: '/admin/admins', label: '👤 Admins' },
  { href: '/admin/logs', label: '📜 Activity Log' },
  { href: '/admin/backup', label: '💾 Backup' },
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
  const perms: string[] = session.permissions ?? [];
  const navItems = NAV.filter((item) => {
    const required = permissionForPath(item.href);
    return required === null || hasPermission(perms, required);
  });

  return (
    <div className="admin-shell min-h-screen bg-neutral-950 text-neutral-100 pt-20">
      <div className="flex">
        <aside className="w-64 min-h-screen border-r border-neutral-800 bg-neutral-900/50 p-6">
          <div className="mb-8">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
              ← View site
            </Link>
            <h2 className="mt-2 text-xl font-semibold">JAYKAVI Admin</h2>
            <p className="text-xs text-neutral-500 mt-1">{session.user?.email}</p>
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

          <div className="mt-8 space-y-1">
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
          </div>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
