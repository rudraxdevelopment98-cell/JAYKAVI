import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CollectionForm from '../CollectionForm';
import DeleteButton from '../../_components/DeleteButton';
import SongMultiSelect from '../../_components/SongMultiSelect';
import { updateCollection, deleteCollection, setCollectionSongs } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
  const [c, allSongs] = await Promise.all([
    prisma.collection.findUnique({
      where: { id: params.id },
      include: { songs: true },
    }),
    prisma.song.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true, releaseYear: true },
    }),
  ]);
  if (!c) notFound();

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/collections" className="text-sm text-neutral-400 hover:text-white">
          ← Collections
        </Link>
        <h1 className="text-3xl font-semibold truncate">{c.title}</h1>
      </div>

      <CollectionForm
        initial={{
          title: c.title,
          slug: c.slug,
          description: c.description,
          coverUrl: c.coverUrl,
          year: c.year,
        }}
        action={updateCollection.bind(null, c.id)}
        submitLabel="Save changes"
      />

      <SongMultiSelect
        allSongs={allSongs.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.releaseYear ? String(s.releaseYear) : undefined,
        }))}
        selectedIds={c.songs.map((s) => s.id)}
        action={setCollectionSongs.bind(null, c.id)}
        label="Songs in this collection"
        saveLabel="Save songs"
      />

      <div className="mt-8 pt-6 border-t border-neutral-800">
        <DeleteButton
          onConfirm={async () => {
            'use server';
            await deleteCollection(c.id);
          }}
          label="Delete collection"
          confirmText={`Delete "${c.title}"? Songs will be detached (not deleted).`}
        />
      </div>
    </div>
  );
}
