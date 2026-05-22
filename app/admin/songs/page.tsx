import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SongsAdminPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? '';

  const songs = await prisma.song.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: [{ isTrending: 'desc' }, { releaseYear: 'desc' }, { title: 'asc' }],
    include: {
      singers: { include: { singer: true } },
      _count: { select: { platformLinks: true } },
    },
    take: 100,
  });

  const total = await prisma.song.count();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Songs</h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {total} songs total{q && ` · showing ${songs.length} matching "${q}"`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/admin/songs" method="GET">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title or slug…"
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm w-64 focus:outline-none focus:border-neutral-600"
            />
          </form>
          <Link
            href="/admin/songs/new"
            className="px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition text-sm"
          >
            + New Song
          </Link>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          {q ? `No songs match "${q}".` : 'No songs yet.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400 text-left">
              <tr>
                <th className="px-4 py-2 font-medium w-12"></th>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Singers</th>
                <th className="px-4 py-2 font-medium">Year</th>
                <th className="px-4 py-2 font-medium">Views</th>
                <th className="px-4 py-2 font-medium">Links</th>
                <th className="px-4 py-2 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {songs.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-900/60">
                  <td className="px-4 py-2">
                    {s.artworkUrl ? (
                      <img
                        src={s.artworkUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-neutral-800" />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/songs/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.title}
                    </Link>
                    <div className="text-xs text-neutral-500">{s.slug}</div>
                  </td>
                  <td className="px-4 py-2 text-neutral-300 max-w-[200px] truncate">
                    {s.singers.map((sg) => sg.singer.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2 text-neutral-300">
                    {s.releaseYear ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-neutral-300">
                    {s.viewCount?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-neutral-300">
                    {s._count.platformLinks}
                  </td>
                  <td className="px-4 py-2">
                    {s.isTrending && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-900/60 text-amber-300">
                        trending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
