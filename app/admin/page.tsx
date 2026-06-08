import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';
import { ADMIN_SECTIONS, permissionForPath, hasPermission } from '@/lib/permissions';
import PageHeader from './_components/PageHeader';
import { normalizeSingerKey } from '@/lib/singers';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [
    songs,
    singers,
    collections,
    journey,
    notes,
    pendingCandidates,
    unreadMessages,
    songsMissingArtwork,
    songsMissingLyrics,
    totalViews,
    recentActivity,
    topSongs,
    allSingerNames,
  ] = await Promise.all([
    prisma.song.count(),
    prisma.singer.count(),
    prisma.collection.count(),
    prisma.journeyMilestone.count(),
    prisma.note.count().catch(() => 0),
    prisma.harvestCandidate.count({ where: { status: 'pending' } }).catch(() => 0),
    prisma.contactMessage.count({ where: { read: false } }).catch(() => 0),
    prisma.song.count({ where: { OR: [{ artworkUrl: null }, { artworkUrl: '' }] } }),
    prisma.song.count({ where: { lyrics: '' } }),
    prisma.song.aggregate({ _sum: { viewCount: true } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, actorEmail: true, action: true, entity: true, label: true, createdAt: true },
    }).catch(() => []),
    prisma.song.findMany({
      where: { viewCount: { gt: 0 } },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true, slug: true, title: true, viewCount: true, artworkUrl: true },
    }),
    prisma.singer.findMany({ select: { name: true } }),
  ]);

  // Detect potential duplicate singers (same normalized key)
  const keyCounts = new Map<string, number>();
  for (const s of allSingerNames) {
    const k = normalizeSingerKey(s.name);
    if (!k) continue;
    keyCounts.set(k, (keyCounts.get(k) ?? 0) + 1);
  }
  const duplicateSingerGroups = [...keyCounts.values()].filter((c) => c > 1).length;

  return {
    songs, singers, collections, journey, notes,
    pendingCandidates, unreadMessages,
    songsMissingArtwork, songsMissingLyrics,
    totalViews: totalViews._sum.viewCount ?? 0,
    recentActivity,
    topSongs,
    duplicateSingerGroups,
  };
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

const ACTION_COLORS: Record<string, string> = {
  create: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40',
  update: 'text-blue-400 bg-blue-950/40 border-blue-900/40',
  delete: 'text-red-400 bg-red-950/40 border-red-900/40',
  login: 'text-violet-400 bg-violet-950/40 border-violet-900/40',
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: { denied?: string };
}) {
  const data = await getDashboardData();
  const session: any = await auth();
  const perms: string[] = session?.permissions ?? [];
  const restricted = perms.length > 0;
  const allowed = (href: string) => {
    const req = permissionForPath(href);
    return req === null || !restricted || hasPermission(perms, req);
  };

  const deniedKey = searchParams?.denied;
  const deniedLabel = deniedKey
    ? ADMIN_SECTIONS.find((s) => s.key === deniedKey)?.label ?? deniedKey
    : null;

  const firstName = (session?.user?.name || session?.user?.email?.split('@')[0] || 'there')
    .split(/[\s.@]/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Working late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Songs', value: data.songs, href: '/admin/songs', accentClass: 'bg-amber-500/60' },
    { label: 'Singers', value: data.singers, href: '/admin/singers', accentClass: 'bg-violet-500/60' },
    { label: 'Collections', value: data.collections, href: '/admin/collections', accentClass: 'bg-cyan-500/60' },
    { label: 'Total views', value: formatNum(data.totalViews), href: '/admin/analytics', accentClass: 'bg-emerald-500/60' },
  ].filter((s) => allowed(s.href));

  // "Needs attention" panel
  const alerts: { label: string; href: string; count: number; tone: 'amber' | 'red' | 'neutral' }[] = [];
  if (data.pendingCandidates > 0 && allowed('/admin/harvester')) {
    alerts.push({ label: `${data.pendingCandidates} harvest candidate${data.pendingCandidates !== 1 ? 's' : ''} waiting for review`, href: '/admin/harvester', count: data.pendingCandidates, tone: 'amber' });
  }
  if (data.unreadMessages > 0 && allowed('/admin/messages')) {
    alerts.push({ label: `${data.unreadMessages} unread message${data.unreadMessages !== 1 ? 's' : ''}`, href: '/admin/messages', count: data.unreadMessages, tone: 'amber' });
  }
  if (data.duplicateSingerGroups > 0 && allowed('/admin/singers')) {
    alerts.push({ label: `${data.duplicateSingerGroups} possible duplicate singer name${data.duplicateSingerGroups !== 1 ? 's' : ''}`, href: '/admin/singers', count: data.duplicateSingerGroups, tone: 'red' });
  }
  if (data.songsMissingArtwork > 0 && allowed('/admin/songs')) {
    alerts.push({ label: `${data.songsMissingArtwork} song${data.songsMissingArtwork !== 1 ? 's' : ''} missing artwork`, href: '/admin/songs?missing=artwork', count: data.songsMissingArtwork, tone: 'neutral' });
  }
  if (data.songsMissingLyrics > 0 && allowed('/admin/songs')) {
    alerts.push({ label: `${data.songsMissingLyrics} song${data.songsMissingLyrics !== 1 ? 's' : ''} missing lyrics`, href: '/admin/songs?missing=lyrics', count: data.songsMissingLyrics, tone: 'neutral' });
  }

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        subtitle="Here's what's happening across the JAYKAVI site today."
      />

      {deniedLabel && (
        <div className="mb-6 p-4 rounded-xl border border-amber-900/60 bg-amber-950/30 text-amber-200 text-sm">
          You don't have permission to open <strong>{deniedLabel}</strong>. Ask an owner to grant
          you access on the Admins page.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group relative block p-5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-neutral-900/80 transition overflow-hidden"
          >
            <div className={`absolute inset-x-0 top-0 h-0.5 ${s.accentClass} opacity-0 group-hover:opacity-100 transition`} />
            <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">{s.label}</div>
            <div className="text-3xl font-semibold mt-2 text-neutral-50">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Needs attention */}
        <section className="lg:col-span-2 p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-neutral-100">Needs attention</h2>
            {alerts.length === 0 && (
              <span className="text-xs text-emerald-400">All clear ✓</span>
            )}
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing pending — go enjoy a chai ☕</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.label}>
                  <Link
                    href={a.href}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-sm transition group ${
                      a.tone === 'red'
                        ? 'border-red-900/40 bg-red-950/20 text-red-200 hover:border-red-800 hover:bg-red-950/40'
                        : a.tone === 'amber'
                          ? 'border-amber-900/40 bg-amber-950/20 text-amber-200 hover:border-amber-800 hover:bg-amber-950/40'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-950/70'
                    }`}
                  >
                    <span className="flex-1 min-w-0">{a.label}</span>
                    <span className="text-xs opacity-60 group-hover:opacity-100 transition">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
          <h2 className="font-semibold text-neutral-100 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {allowed('/admin/songs/new') && (
              <Link href="/admin/songs/new" className="px-3 py-2 text-xs text-center bg-amber-500/15 text-amber-300 border border-amber-900/40 rounded-md hover:bg-amber-500/25 transition">
                + New song
              </Link>
            )}
            {allowed('/admin/singers/new') && (
              <Link href="/admin/singers/new" className="px-3 py-2 text-xs text-center bg-violet-500/15 text-violet-300 border border-violet-900/40 rounded-md hover:bg-violet-500/25 transition">
                + New singer
              </Link>
            )}
            {allowed('/admin/harvester') && (
              <Link href="/admin/harvester" className="px-3 py-2 text-xs text-center bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">
                🎬 Harvester
              </Link>
            )}
            {allowed('/admin/notebook') && (
              <Link href="/admin/notebook" className="px-3 py-2 text-xs text-center bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">
                📓 Notebook
              </Link>
            )}
            {allowed('/admin/profile') && (
              <Link href="/admin/profile" className="px-3 py-2 text-xs text-center bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">
                🎨 Profile
              </Link>
            )}
            {allowed('/admin/theme') && (
              <Link href="/admin/theme" className="px-3 py-2 text-xs text-center bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">
                🖌️ Theme
              </Link>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Top songs */}
        {data.topSongs.length > 0 && allowed('/admin/songs') && (
          <section className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-neutral-100">Top songs</h2>
              <Link href="/admin/songs" className="text-xs text-neutral-500 hover:text-neutral-200">View all →</Link>
            </div>
            <ol className="space-y-2">
              {data.topSongs.map((s, i) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/songs/${s.id}`}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-800/50 transition group"
                  >
                    <span className="text-xs text-neutral-600 font-mono w-4 text-right">{i + 1}</span>
                    <div className="w-10 h-10 rounded-md bg-neutral-800 flex-shrink-0 overflow-hidden">
                      {s.artworkUrl ? (
                        <img src={s.artworkUrl} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-neutral-200 truncate group-hover:text-white">{s.title}</div>
                      <div className="text-xs text-neutral-500">{formatNum(s.viewCount)} views</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Recent activity */}
        {data.recentActivity.length > 0 && allowed('/admin/logs') && (
          <section className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-neutral-100">Recent activity</h2>
              <Link href="/admin/logs" className="text-xs text-neutral-500 hover:text-neutral-200">View all →</Link>
            </div>
            <ul className="space-y-2">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-1 py-1.5 text-sm">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium border ${ACTION_COLORS[a.action] ?? 'text-neutral-400 bg-neutral-800 border-neutral-700'}`}>
                    {a.action}
                  </span>
                  <span className="text-neutral-300 flex-1 min-w-0 truncate">
                    <span className="text-neutral-500">{a.entity}</span>
                    {a.label && <span className="ml-1.5">· {a.label}</span>}
                  </span>
                  <span className="text-xs text-neutral-600 flex-shrink-0">{relativeTime(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
