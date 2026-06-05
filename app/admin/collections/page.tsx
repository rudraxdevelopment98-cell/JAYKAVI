import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CollectionsAdminPage() {
  const collections = await prisma.collection.findMany({
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
    include: { _count: { select: { songs: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Collections</h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {collections.length} collections (albums / song groups)
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="shrink-0 px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition text-sm"
        >
          + New Collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No collections yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/admin/collections/${c.id}`}
              className="flex gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
            >
              <div className="w-16 h-16 rounded-md bg-neutral-800 flex-shrink-0 overflow-hidden">
                {c.coverUrl ? (
                  <img src={c.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{c.title}</div>
                <div className="text-xs text-neutral-500">
                  {c.year ?? '—'} · {c._count.songs}{' '}
                  {c._count.songs === 1 ? 'song' : 'songs'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
