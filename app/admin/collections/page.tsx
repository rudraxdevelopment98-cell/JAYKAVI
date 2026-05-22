import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CollectionsAdminPage() {
  const collections = await prisma.collection.findMany({ orderBy: { year: 'desc' } });
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Collections</h1>
      <p className="text-neutral-400 mb-6">{collections.length} collections. Full CRUD coming next.</p>
      <ul className="space-y-2">
        {collections.map((c) => (
          <li key={c.id} className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-md">
            <div className="font-medium">{c.title}</div>
            <div className="text-xs text-neutral-500">{c.year ?? '—'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
