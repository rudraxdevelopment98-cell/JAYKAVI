import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SingerForm from '../SingerForm';
import DeleteButton from '../../_components/DeleteButton';
import SongMultiSelect from '../../_components/SongMultiSelect';
import { updateSinger, deleteSinger, setSingerSongs } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditSingerPage({ params }: { params: { id: string } }) {
  const [singer, allSongs] = await Promise.all([
    prisma.singer.findUnique({
      where: { id: params.id },
      include: { songs: { include: { song: true } } },
    }),
    prisma.song.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, releaseYear: true },
    }),
  ]);
  if (!singer) notFound();

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/singers" className="text-sm text-neutral-400 hover:text-white flex-shrink-0">
          ← Singers
        </Link>
        <h1 className="text-3xl font-semibold truncate min-w-0 flex-1">{singer.name}</h1>
      </div>

      <SingerForm
        initial={{
          name: singer.name,
          photoUrl: singer.photoUrl,
          bio: singer.bio,
        }}
        action={updateSinger.bind(null, singer.id)}
        submitLabel="Save changes"
      />

      <SongMultiSelect
        allSongs={allSongs.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.releaseYear ? String(s.releaseYear) : undefined,
        }))}
        selectedIds={singer.songs.map((s) => s.songId)}
        action={setSingerSongs.bind(null, singer.id)}
        label="Songs this singer performs"
        saveLabel="Save songs"
      />

      <div className="mt-8 pt-6 border-t border-neutral-800">
        <DeleteButton
          onConfirm={async () => {
            'use server';
            await deleteSinger(singer.id);
          }}
          label="Delete singer"
          confirmText={`Delete "${singer.name}" and remove from all songs?`}
        />
      </div>
    </div>
  );
}
