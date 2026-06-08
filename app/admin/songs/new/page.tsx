import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SongForm from '../SongForm';
import { createSong } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NewSongPage() {
  const [singers, collections] = await Promise.all([
    prisma.singer.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="sticky top-0 z-10 flex items-center gap-3 mb-6 py-3 -mx-4 px-4 bg-neutral-950/95 backdrop-blur border-b border-neutral-800/60">
        <Link href="/admin/songs" className="text-sm text-neutral-400 hover:text-white">
          ← Songs
        </Link>
        <h1 className="text-xl font-semibold">New Song</h1>
      </div>
      <SongForm
        action={createSong}
        singers={singers}
        collections={collections}
        submitLabel="Create song"
      />
    </div>
  );
}
