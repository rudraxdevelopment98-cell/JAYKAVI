import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';
import { ADMIN_SECTIONS, permissionForPath, hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

async function getCounts() {
  const [singers, collections, songs, journey, notes] = await Promise.all([
    prisma.singer.count(),
    prisma.collection.count(),
    prisma.song.count(),
    prisma.journeyMilestone.count(),
    prisma.note.count().catch(() => 0),
  ]);
  return { singers, collections, songs, journey, notes };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: { denied?: string };
}) {
  const counts = await getCounts();
  const session: any = await auth();
  const perms: string[] = session?.permissions ?? [];
  const restricted = perms.length > 0;
  const allowed = (href: string) => {
    const req = permissionForPath(href);
    return req === null || !restricted || hasPermission(perms, req);
  };

  const deniedKey = searchParams?.denied;
  const deniedLabel = deniedKey
    ? ADMIN_SECTIONS.find((s) => s.key === deniedKey)?.label ?? deniedKey
    : null;

  const tiles = [
    { label: 'Songs', value: counts.songs, href: '/admin/songs' },
    { label: 'Singers', value: counts.singers, href: '/admin/singers' },
    { label: 'Collections', value: counts.collections, href: '/admin/collections' },
    { label: 'Journey events', value: counts.journey, href: '/admin/journey' },
    { label: 'Notebook', value: counts.notes, href: '/admin/notebook', emoji: '📓' },
  ].filter((t) => allowed(t.href));

  return (
    <div>
      {deniedLabel && (
        <div className="mb-6 p-4 rounded-xl border border-amber-900/60 bg-amber-950/30 text-amber-200 text-sm">
          You don't have permission to open <strong>{deniedLabel}</strong>. Ask an owner to grant
          you access on the Admins page.
        </div>
      )}
      <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
      <p className="text-neutral-400 mb-8">
        Manage all dynamic content for the JAYKAVI site.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition"
          >
            {(t as any).emoji && <div className="text-2xl mb-1">{(t as any).emoji}</div>}
            <div className="text-3xl font-semibold">{t.value}</div>
            <div className="text-sm text-neutral-400 mt-1">{t.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl">
        <h2 className="font-semibold mb-2">Quick actions</h2>
        <ul className="text-sm text-neutral-300 space-y-1">
          {allowed('/admin/profile') && (
            <li>· <Link href="/admin/profile" className="underline hover:text-white">Edit artist profile</Link></li>
          )}
          {allowed('/admin/contact') && (
            <li>· <Link href="/admin/contact" className="underline hover:text-white">Update contact & social links</Link></li>
          )}
          {allowed('/admin/songs') && (
            <li>· <Link href="/admin/songs" className="underline hover:text-white">Manage songs</Link></li>
          )}
          {allowed('/admin/notebook') && (
            <li>· <Link href="/admin/notebook" className="underline hover:text-white">Open notebook</Link></li>
          )}
          {allowed('/admin/harvester') && (
            <li>· <Link href="/admin/harvester" className="underline hover:text-white">Song harvester</Link></li>
          )}
        </ul>
      </div>
    </div>
  );
}
