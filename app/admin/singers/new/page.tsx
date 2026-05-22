import Link from 'next/link';
import SingerForm from '../SingerForm';
import { createSinger } from '../actions';

export default function NewSingerPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/singers" className="text-sm text-neutral-400 hover:text-white">
          ← Singers
        </Link>
        <h1 className="text-3xl font-semibold">New Singer</h1>
      </div>
      <SingerForm action={createSinger} submitLabel="Create singer" />
    </div>
  );
}
