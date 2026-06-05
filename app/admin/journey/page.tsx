import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function JourneyAdminPage() {
  const events = await prisma.journeyMilestone.findMany({
    orderBy: [{ sortOrder: 'asc' }, { year: 'asc' }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Journey</h1>
          <p className="text-neutral-400 mt-1 text-sm">
            {events.length} milestones on the timeline
          </p>
        </div>
        <Link
          href="/admin/journey/new"
          className="shrink-0 px-4 py-2 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition text-sm"
        >
          + New Milestone
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No journey milestones yet.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/admin/journey/${e.id}`}
              className="flex items-start gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
            >
              <div className="w-20 flex-shrink-0">
                <div className="text-xs text-neutral-500">{e.year ?? '—'}</div>
              </div>
              {e.imageUrl && (
                <img
                  src={e.imageUrl}
                  alt=""
                  className="w-20 h-12 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-neutral-400 truncate">
                  {e.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
