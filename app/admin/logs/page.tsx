import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getRecentLogs() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    return await prisma.activityLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  } catch {
    return [];
  }
}

const ACTION_STYLE: Record<string, string> = {
  login: 'bg-blue-900/50 text-blue-300',
  create: 'bg-green-900/50 text-green-300',
  update: 'bg-amber-900/50 text-amber-300',
  delete: 'bg-red-900/50 text-red-300',
};

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default async function ActivityLogPage() {
  const logs = await getRecentLogs();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold">Activity Log</h1>
      <p className="text-neutral-400 mt-1 mb-6 text-sm">
        Sign-ins and content changes from the last 7 days
        {logs.length > 0 && <> · {logs.length} event{logs.length !== 1 ? 's' : ''}</>}.
        Older entries are removed automatically to save storage.
      </p>

      {logs.length === 0 ? (
        <div className="px-5 py-10 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
          No activity in the last 7 days.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 flex-wrap"
            >
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  ACTION_STYLE[log.action] ?? 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {log.action}
              </span>
              <span className="text-sm text-neutral-200">
                {log.action === 'login' ? (
                  <>Signed in</>
                ) : (
                  <>
                    <span className="text-neutral-400">{log.entity}</span>
                    {log.label && <> · <strong className="text-neutral-100">{log.label}</strong></>}
                  </>
                )}
              </span>
              <span className="text-sm text-neutral-500">— {log.actorEmail ?? 'unknown'}</span>
              {log.detail && (
                <span className="text-xs text-neutral-500 italic">({log.detail})</span>
              )}
              <span className="ml-auto text-xs text-neutral-500 flex-shrink-0">
                {timeAgo(log.createdAt)}
                <span className="text-neutral-700 ml-2">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-600 mt-6">
        Older events are not shown here. Each line records who did what and when.
      </p>
    </div>
  );
}
