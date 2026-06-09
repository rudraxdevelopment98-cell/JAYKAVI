import CollectionForm from '../CollectionForm';
import { createCollection } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export default function NewCollectionPage() {
  return (
    <>
      <AdminPageHeader title="New Collection" backHref="/admin/collections" backLabel="Collections" />
      <div className="max-w-xl">
        <CollectionForm action={createCollection} submitLabel="Create collection" />
      </div>
    </>
  );
}
