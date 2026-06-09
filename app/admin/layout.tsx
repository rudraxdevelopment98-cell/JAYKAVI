import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { permissionForPath, hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import AdminThemeToggle from './_components/AdminThemeToggle';
import AdminShell from './_components/AdminShell';

async function getSidebarBadges(): Promise<Record<string, number>> {
  try {
    const [pending, unread, songReqs] = await Promise.all([
      prisma.harvestCandidate.count({ where: { status: 'pending' } }),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.songRequest.count({ where: { read: false } }),
    ]);
    return {
      '/admin/harvester': pending,
      '/admin/messages': unread,
      '/admin/song-requests': songReqs,
    };
  } catch {
    return {};
  }
}

const NAV_GROUPS = [
  {
    group: null,
    items: [
      { href: '/admin', label: '🏠 Dashboard' },
    ],
  },
  {
    group: 'Content',
    items: [
      { href: '/admin/songs', label: '🎵 Songs' },
      { href: '/admin/collections', label: '📀 Collections' },
      { href: '/admin/singers', label: '🎤 Singers' },
      { href: '/admin/journey', label: '🛤️ Journey' },
      { href: '/admin/blog', label: '📝 Blog' },
      { href: '/admin/notebook', label: '📓 Notebook' },
    ],
  },
  {
    group: 'Discover',
    items: [
      { href: '/admin/harvester', label: '🎬 Song Harvester' },
      { href: '/admin/analytics', label: '📊 Analytics' },
    ],
  },
  {
    group: 'People',
    items: [
      { href: '/admin/account', label: '👤 My Profile' },
      { href: '/admin/profile', label: '🎨 Artist Profile' },
      { href: '/admin/admins', label: '🔑 Admins' },
      { href: '/admin/contact', label: '📡 Contact & Social' },
        { href: '/admin/messages', label: '✉️ Messages' },
      { href: '/admin/song-requests', label: '🎶 Song Requests' },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/admin/theme', label: '🖌️ Site Theme' },
      { href: '/admin/backup', label: '💾 Backup' },
      { href: '/admin/logs', label: '📜 Activity Log' },
      { href: '/admin/sitemap', label: '🗺️ Site Map' },
    ],
  },
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
  const badges = await getSidebarBadges();
  const navGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items
      .filter((item) => {
        const required = permissionForPath(item.href);
        return required === null || !restricted || hasPermission(perms, required);
      })
      .map((item) => ({ ...item, badge: badges[item.href] })),
  })).filter((g) => g.items.length > 0);

  return (
    <AdminShell
      navGroups={navGroups}
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
