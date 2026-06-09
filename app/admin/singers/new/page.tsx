import SingerForm from '../SingerForm';
import { createSinger } from '../actions';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export default function NewSingerPage() {
  return (
    <>
      <AdminPageHeader title="New Singer" backHref="/admin/singers" backLabel="Singers" />
      <div className="max-w-xl">
        <SingerForm action={createSinger} submitLabel="Create singer" />
      </div>
    </>
  );
}
