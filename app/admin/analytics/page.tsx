import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  return days;
}

async function getData() {
  try {
    const [topSongs, totalAgg, dailyRows] = await Promise.all([
      prisma.song.findMany({
        where: { pageViews: { gt: 0 } },
        orderBy: { pageViews: 'desc' },
        take: 15,
        select: { slug: true, title: true, pageViews: true, viewCount: true },
      }),
      prisma.song.aggregate({ _sum: { pageViews: true } }),
      prisma.dailyView.findMany({ orderBy: { day: 'desc' }, take: 30 }),
    ]);
    return {
      topSongs,
      totalViews: totalAgg._sum.pageViews ?? 0,
      daily: dailyRows,
      ok: true,
    };
  } catch {
    return { topSongs: [], totalViews: 0, daily: [], ok: false };
  }
}

export default async function AnalyticsPage() {
  const { topSongs, totalViews, daily, ok } = await getData();

  // Build the 30-day series, filling missing days with 0.
  const dayMap = new Map(daily.map((d) => [d.day, d.count]));
  const series = lastNDays(30).map((day) => ({ day, count: dayMap.get(day) ?? 0 }));
  const maxCount = Math.max(1, ...series.map((s) => s.count));
  const last7 = series.slice(-7).reduce((a, s) => a + s.count, 0);
  const last30 = series.reduce((a, s) => a + s.count, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold mb-1">Analytics</h1>
      <p className="text-neutral-400 mb-6 text-sm">
        Privacy-friendly on-site reads. No cookies or personal data are collected —
        just how many times each song page has been opened.
      </p>

      {!ok && (
        <div className="mb-6 px-4 py-3 bg-yellow-950/60 border border-yellow-800 rounded-xl text-sm text-yellow-300">
          Analytics tables aren&apos;t ready yet. They&apos;ll appear after the next deploy
          finishes setting up the database.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="All-time song views" value={totalViews.toLocaleString()} />
        <StatCard label="Last 30 days" value={last30.toLocaleString()} />
        <StatCard label="Last 7 days" value={last7.toLocaleString()} />
      </div>

      {/* 30-day chart */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Daily views — last 30 days</h2>
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
          {last30 === 0 ? (
            <p className="text-neutral-500 text-sm">No views recorded yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {series.map((s) => (
                <div key={s.day} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div
                    className="w-full bg-amber-500/80 hover:bg-amber-400 rounded-t transition-colors"
                    style={{ height: `${(s.count / maxCount) * 100}%`, minHeight: s.count > 0 ? 2 : 0 }}
                  />
                  <div className="absolute -top-7 hidden group-hover:block whitespace-nowrap text-xs bg-neutral-800 text-neutral-100 px-2 py-1 rounded shadow z-10">
                    {s.day.slice(5)}: {s.count}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>{series[0]?.day.slice(5)}</span>
            <span>{series[series.length - 1]?.day.slice(5)}</span>
          </div>
        </div>
      </section>

      {/* Top songs */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Most-read songs</h2>
        {topSongs.length === 0 ? (
          <p className="text-neutral-400 text-sm">No song views recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-sm min-w-[420px]">
              <thead className="bg-neutral-900 text-neutral-400 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium w-10">#</th>
                  <th className="px-4 py-2 font-medium">Song</th>
                  <th className="px-4 py-2 font-medium text-right">Site reads</th>
                  <th className="px-4 py-2 font-medium text-right">YouTube views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {topSongs.map((s, i) => (
                  <tr key={s.slug} className="hover:bg-neutral-900/60">
                    <td className="px-4 py-2 text-neutral-500">{i + 1}</td>
                    <td className="px-4 py-2">
                      <Link href={`/songs/${s.slug}`} target="_blank" className="text-neutral-200 hover:text-amber-400">
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-200 font-medium">
                      {s.pageViews.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-400">
                      {s.viewCount ? s.viewCount.toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
