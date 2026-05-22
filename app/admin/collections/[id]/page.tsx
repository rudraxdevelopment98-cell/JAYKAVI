import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CollectionForm from '../CollectionForm';
import DeleteButton from '../../_components/DeleteButton';
import { updateCollection, deleteCollection } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
  const c = await prisma.collection.findUnique({
    where: { id: params.id },
    include: { songs: true },
  });
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

      {c.songs.length > 0 && (
        <div className="mt-8 p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
          <div className="text-sm font-medium mb-2">
            Contains {c.songs.length} {c.songs.length === 1 ? 'song' : 'songs'}
          </div>
          <ul className="text-xs text-neutral-400 space-y-1">
            {c.songs.slice(0, 8).map((s) => (
              <li key={s.id}>· {s.title}</li>
            ))}
          </ul>
        </div>
      )}

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
