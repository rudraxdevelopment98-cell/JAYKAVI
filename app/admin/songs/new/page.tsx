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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/songs" className="text-sm text-neutral-400 hover:text-white">
          ← Songs
        </Link>
        <h1 className="text-3xl font-semibold">New Song</h1>
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
