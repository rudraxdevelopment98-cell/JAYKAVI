import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SingersAdminPage() {
  const singers = await prisma.singer.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { songs: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Singers</h1>
          <p className="text-neutral-400 mt-1 text-sm">{singers.length} performers</p>
        </div>
        <Link
          href="/admin/singers/new"
          className="shrink-0 px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition text-sm"
        >
          + New Singer
        </Link>
      </div>

      {singers.length === 0 ? (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No singers yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {singers.map((s) => (
            <Link
              key={s.id}
              href={`/admin/singers/${s.id}`}
              className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex-shrink-0 overflow-hidden">
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                    {s.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-neutral-500">
                  {s._count.songs} {s._count.songs === 1 ? 'song' : 'songs'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
