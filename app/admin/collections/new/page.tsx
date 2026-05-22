import Link from 'next/link';
import CollectionForm from '../CollectionForm';
import { createCollection } from '../actions';

export default function NewCollectionPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/collections" className="text-sm text-neutral-400 hover:text-white">
          ← Collections
        </Link>
        <h1 className="text-3xl font-semibold">New Collection</h1>
      </div>
      <CollectionForm action={createCollection} submitLabel="Create collection" />
    </div>
  );
}
