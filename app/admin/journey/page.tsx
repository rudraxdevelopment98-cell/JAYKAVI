import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function JourneyAdminPage() {
  const events = await prisma.journeyMilestone.findMany({
    orderBy: [{ year: 'asc' }, { sortOrder: 'asc' }],
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Journey</h1>
      <p className="text-neutral-400 mb-6">{events.length} milestones. Full CRUD coming next.</p>
      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-md"
          >
            <div className="text-xs text-neutral-500">{e.year ?? '—'}</div>
            <div className="font-medium">{e.title}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
