import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SingerForm from '../SingerForm';
import DeleteButton from '../../_components/DeleteButton';
import { updateSinger, deleteSinger } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditSingerPage({ params }: { params: { id: string } }) {
  const singer = await prisma.singer.findUnique({
    where: { id: params.id },
    include: { songs: { include: { song: true } } },
  });
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

      {singer.songs.length > 0 && (
        <div className="mt-8 p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <div className="text-sm font-medium mb-2">
            Performs on {singer.songs.length}{' '}
            {singer.songs.length === 1 ? 'song' : 'songs'}
          </div>
          <ul className="text-xs text-neutral-400 space-y-1">
            {singer.songs.slice(0, 5).map((s) => (
              <li key={s.songId}>· {s.song.title}</li>
            ))}
            {singer.songs.length > 5 && (
              <li className="text-neutral-600">…and {singer.songs.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

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
