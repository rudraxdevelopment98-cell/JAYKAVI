import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SongsAdminPage() {
  const songs = await prisma.song.findMany({
    orderBy: { releaseYear: 'desc' },
    take: 50,
    include: { singers: { include: { singer: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Songs</h1>
      <p className="text-neutral-400 mb-6">
        Showing {songs.length} songs. Full CRUD (create / edit / delete / artwork upload) coming next.
      </p>
      <ul className="space-y-2">
        {songs.map((s) => (
          <li
            key={s.id}
            className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-md"
          >
            <div className="font-medium">{s.title}</div>
            <div className="text-xs text-neutral-500">
              {s.releaseYear ?? '—'} ·{' '}
              {s.singers.map((sg) => sg.singer.name).join(', ') || 'no singers'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
