import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SingerForm from '../SingerForm';
import DeleteButton from '../../_components/DeleteButton';
import SongMultiSelect from '../../_components/SongMultiSelect';
import { updateSinger, deleteSinger, setSingerSongs } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

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
    <>
      <AdminPageHeader title={singer.name} backHref="/admin/singers" backLabel="Singers" />
      <div className="max-w-xl">
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
    </>
  );
}
