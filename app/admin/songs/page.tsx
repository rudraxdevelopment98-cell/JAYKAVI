import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SongsTable from './SongsTable';

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

      {songs.length === 0 && q ? (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No songs match &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <SongsTable songs={songs} />
      )}
    </div>
  );
}
