import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getCounts() {
  const [singers, collections, songs, journey] = await Promise.all([
    prisma.singer.count(),
    prisma.collection.count(),
    prisma.song.count(),
    prisma.journeyMilestone.count(),
  ]);
  return { singers, collections, songs, journey };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  const tiles = [
    { label: 'Songs', value: counts.songs, href: '/admin/songs' },
    { label: 'Singers', value: counts.singers, href: '/admin/singers' },
    { label: 'Collections', value: counts.collections, href: '/admin/collections' },
    { label: 'Journey events', value: counts.journey, href: '/admin/journey' },
  ];

  return (
    <div>
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
            <div className="text-3xl font-semibold">{t.value}</div>
            <div className="text-sm text-neutral-400 mt-1">{t.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-neutral-900/60 border border-neutral-800 rounded-xl">
        <h2 className="font-semibold mb-2">Quick actions</h2>
        <ul className="text-sm text-neutral-300 space-y-1">
          <li>· <Link href="/admin/profile" className="underline hover:text-white">Edit artist profile</Link></li>
          <li>· <Link href="/admin/contact" className="underline hover:text-white">Update contact & social links</Link></li>
          <li>· <Link href="/admin/songs" className="underline hover:text-white">Manage songs</Link></li>
        </ul>
      </div>
    </div>
  );
}
