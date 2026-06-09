import { prisma } from '@/lib/prisma';
import { markAllRequestsRead } from './actions';
import RequestCard from './RequestCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    return await prisma.songRequest.findMany({ orderBy: { createdAt: 'desc' } });
  } catch {
    return [];
  }
}

export default async function SongRequestsPage() {
  const requests = await getData();
  const unread = requests.filter((r) => !r.read).length;
  const pending = requests.filter((r) => r.status === 'pending').length;
  const added = requests.filter((r) => r.status === 'added').length;

  return (
    <>
      <div className="admin-sticky-header">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Song Requests</h1>
            <p className="text-neutral-400 mt-0.5 text-sm">
              Suggestions from visitors at{' '}
              <Link href="/request" target="_blank" className="text-amber-400 hover:text-amber-300 transition">
                /request ↗
              </Link>
            </p>
          </div>
          {unread > 0 && (
            <form action={markAllRequestsRead}>
              <button
                type="submit"
                className="shrink-0 text-sm px-3 py-1.5 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition"
              >
                Mark all read
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Stats */}
        {requests.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="text-xl font-bold text-neutral-100 tabular-nums">{requests.length}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Total</div>
            </div>
            <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="text-xl font-bold text-amber-400 tabular-nums">{pending}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Pending</div>
            </div>
            <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="text-xl font-bold text-green-400 tabular-nums">{added}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Added</div>
            </div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="px-5 py-12 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
            <p className="text-lg mb-2">No requests yet</p>
            <p className="text-sm">
              Share the{' '}
              <Link href="/request" target="_blank" className="text-amber-400 hover:text-amber-300 transition underline">
                request page
              </Link>{' '}
              with your audience.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard key={req.id} req={req} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
