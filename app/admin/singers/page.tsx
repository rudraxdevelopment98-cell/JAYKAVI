import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SingersAdminPage() {
  const singers = await prisma.singer.findMany({ orderBy: { sortOrder: 'asc' } });
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Singers</h1>
      <p className="text-neutral-400 mb-6">{singers.length} singers. Full CRUD coming next.</p>
      <ul className="space-y-2">
        {singers.map((s) => (
          <li key={s.id} className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-md">
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
