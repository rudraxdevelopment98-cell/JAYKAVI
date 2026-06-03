// Shared admin-permission definitions.
// IMPORTANT: this file is imported by edge middleware — keep it free of any
// Node-only dependencies (no prisma, no fs, etc.).

export const ADMIN_SECTIONS = [
  { key: 'profile', label: 'Profile', path: '/admin/profile' },
  { key: 'contact', label: 'Contact & Social', path: '/admin/contact' },
  { key: 'messages', label: 'Contact Messages', path: '/admin/messages' },
  { key: 'singers', label: 'Singers', path: '/admin/singers' },
  { key: 'collections', label: 'Collections', path: '/admin/collections' },
  { key: 'songs', label: 'Songs', path: '/admin/songs' },
  { key: 'journey', label: 'Journey', path: '/admin/journey' },
  { key: 'blog', label: 'Blog', path: '/admin/blog' },
  { key: 'harvester', label: 'Song Harvester', path: '/admin/harvester' },
  { key: 'analytics', label: 'Analytics', path: '/admin/analytics' },
  { key: 'admins', label: 'Admins', path: '/admin/admins' },
  { key: 'logs', label: 'Activity Log', path: '/admin/logs' },
  { key: 'backup', label: 'Backup', path: '/admin/backup' },
  { key: 'theme', label: 'Site Theme', path: '/admin/theme' },
] as const;

export type PermissionKey = (typeof ADMIN_SECTIONS)[number]['key'];

export const ALL_PERMISSION = 'all';

// True if the permission set grants access to `key`.
// 'all' (owners) grants everything.
export function hasPermission(perms: string[] | undefined | null, key: string): boolean {
  if (!perms) return false;
  return perms.includes(ALL_PERMISSION) || perms.includes(key);
}

// Which permission a given /admin path requires.
// Returns null for paths any admin may see (e.g. the dashboard at /admin).
export function permissionForPath(pathname: string): string | null {
  const match = ADMIN_SECTIONS.find(
    (s) => pathname === s.path || pathname.startsWith(s.path + '/'),
  );
  return match ? match.key : null;
}
