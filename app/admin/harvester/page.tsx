import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import RunButton from './RunButton';
import HarvesterQueue from './HarvesterQueue';
import ClearAllButton from './ClearAllButton';
import AutoRunToggle from './AutoRunToggle';
import ImportExcelButton from './ImportExcelButton';
import PlaylistImportButton from './PlaylistImportButton';
import SyncViewsButton from './SyncViewsButton';
import BackfillTitlesButton from './BackfillTitlesButton';
import ReQueueButton from './ReQueueButton';

export const dynamic = 'force-dynamic';

async function getData() {
  try {
    const [config, pending, recent, settings] = await Promise.all([
      prisma.harvestConfig.findFirst({ where: { id: 1 } }),
      prisma.harvestCandidate.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.harvestRun.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: { _count: { select: { candidates: true } } },
      }),
      prisma.siteSettings.findFirst({ where: { id: 1 }, select: { viewsSyncedAt: true } }),
    ]);

    const ytIds = pending.map((p) => p.youtubeId).filter(Boolean) as string[];
    const existingSongs = ytIds.length
      ? await prisma.song.findMany({
          where: { youtubeId: { in: ytIds } },
          select: { youtubeId: true, title: true, slug: true },
        })
      : [];
    const existing: Record<string, { title: string; slug: string }> = {};
    for (const s of existingSongs) {
      if (s.youtubeId) existing[s.youtubeId] = { title: s.title, slug: s.slug };
    }

    return { config, pending, recent, settings, existing, dbError: false };
  } catch {
    return {
      config: null,
      pending: [],
      recent: [],
      settings: null,
      existing: {} as Record<string, { title: string; slug: string }>,
      dbError: true,
    };
  }
}

export default async function HarvesterPage() {
  const { config, pending, recent, settings, existing, dbError } = await getData();
  const hasApiKey = !!process.env.YOUTUBE_API_KEY;

  if (dbError) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 bg-yellow-950/40 border border-yellow-800 rounded-xl text-center">
        <p className="text-yellow-300 font-medium mb-2">Database not connected</p>
        <p className="text-yellow-400/70 text-sm">
          Could not reach the database. Check that{' '}
          <code className="font-mono bg-yellow-900/30 px-1 rounded">DATABASE_URL</code> is set
          correctly in your environment variables, then refresh the page.
        </p>
      </div>
    );
  }

  const lastRun = recent[0];

  return (
    <>
      {/* Sticky page header */}
      <div className="admin-sticky-header">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Song Harvester</h1>
            <p className="text-neutral-400 mt-0.5 text-sm">
              Find new JAYKAVI songs on YouTube and approve them for the site.
            </p>
          </div>
          <Link
            href="/admin/harvester/config"
            className="shrink-0 flex items-center gap-1.5 text-sm px-3 py-1.5 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition text-neutral-300"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            Configure
          </Link>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">

        {/* API key warning */}
        {!hasApiKey && (
          <div className="px-4 py-3 bg-yellow-950/60 border border-yellow-800 rounded-xl text-sm text-yellow-300 flex items-start gap-3">
            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>
              <strong>YOUTUBE_API_KEY not set.</strong>{' '}
              Add it to your <code className="font-mono bg-yellow-900/40 px-1 rounded">.env</code> file
              to enable harvesting. Free quota: 10,000 units/day.
            </span>
          </div>
        )}

        {/* ── Primary action: Run harvest ── */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base mb-1">Run Harvest</div>
              <div className="text-sm text-neutral-400">
                Searches{' '}
                <span className="text-neutral-200">{config?.searchTerms.length ?? 4} terms</span>
                {' · '}
                <span className="text-neutral-200">{config?.ownChannels.length ?? 0} channels</span>
                {' · up to '}
                <span className="text-neutral-200">{config?.maxResultsPerTerm ?? 100}</span>
                {' results each'}
              </div>
              {lastRun && (
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block ${
                      lastRun.status === 'done'
                        ? 'bg-green-500'
                        : lastRun.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  Last run {new Date(lastRun.startedAt).toLocaleString()} · {lastRun.newFound} new found
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <AutoRunToggle initial={!!(config as any)?.autoRun} compact />
              <RunButton hasApiKey={hasApiKey} />
            </div>
          </div>
        </div>

        {/* ── Tools grid ── */}
        <div>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Import & Utilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Playlist import */}
            <ToolCard
              title="Import from Playlist"
              description="Paste a YouTube playlist URL or ID to import up to 200 videos as pending candidates."
            >
              <PlaylistImportButton />
            </ToolCard>

            {/* View count sync */}
            <ToolCard
              title="Sync View Counts"
              description="Refreshes view counts for every song with a YouTube ID. Auto-runs every 2 days."
            >
              <SyncViewsButton lastSynced={settings?.viewsSyncedAt ?? null} />
            </ToolCard>

            {/* Excel import */}
            <ToolCard
              title="Import from Excel"
              description={
                <>
                  Upload a spreadsheet with columns:{' '}
                  <code className="text-neutral-300 font-mono text-[11px]">
                    Title · Channel · Published · Views · Link · Source
                  </code>
                </>
              }
            >
              <div className="flex items-center gap-3 flex-wrap">
                <ImportExcelButton />
                <a
                  href="/api/admin/excel-template"
                  download
                  className="text-sm text-neutral-400 hover:text-neutral-200 underline underline-offset-2 transition"
                >
                  Download template
                </a>
              </div>
            </ToolCard>

            {/* Restore titles */}
            <ToolCard
              title="Restore YouTube Titles"
              description="Restores full YouTube titles for songs imported with shortened titles. Only touches songs with a matching harvest candidate."
            >
              <BackfillTitlesButton />
            </ToolCard>

            {/* Re-queue */}
            <ToolCard
              title="Re-queue Deleted Songs"
              description="Restore harvest candidates for songs you deleted, so you can re-approve them."
            >
              <ReQueueButton />
            </ToolCard>
          </div>
        </div>

        {/* ── Pending review queue ── */}
        <section>
          <div
            className="sticky top-[56px] md:top-0 z-10 bg-neutral-950 -mx-4 px-4 md:-mx-0 md:px-0
              py-2 mb-4 border-b border-neutral-800/50 flex items-center justify-between gap-3 flex-wrap"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Pending Review
              {pending.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full tabular-nums">
                  {pending.length}
                </span>
              )}
            </h2>
            <ClearAllButton count={pending.length} />
          </div>

          <HarvesterQueue candidates={pending} existing={existing} />
        </section>

        {/* ── Recent runs ── */}
        {recent.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Recent Runs
            </h2>
            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-neutral-900/80 text-neutral-500 text-left">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Scanned</th>
                    <th className="px-4 py-2.5 font-medium">New found</th>
                    <th className="px-4 py-2.5 font-medium">Candidates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {recent.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="px-4 py-2.5 text-neutral-300 text-xs">
                        {new Date(r.startedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === 'done'
                              ? 'bg-green-900/40 text-green-300'
                              : r.status === 'error'
                              ? 'bg-red-900/40 text-red-300'
                              : 'bg-yellow-900/40 text-yellow-300'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${
                            r.status === 'done' ? 'bg-green-400' : r.status === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                          }`} />
                          {r.status}
                        </span>
                        {r.errorMsg && (
                          <span className="ml-2 text-xs text-red-400">{r.errorMsg}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-300 tabular-nums">{r.scanned}</td>
                      <td className="px-4 py-2.5 tabular-nums">
                        <span className={r.newFound > 0 ? 'text-green-400 font-medium' : 'text-neutral-400'}>
                          {r.newFound > 0 ? `+${r.newFound}` : r.newFound}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-300 tabular-nums">{r._count.candidates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function ToolCard({
  title,
  description,
  children,
}: {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col gap-3">
      <div>
        <div className="font-medium text-sm mb-1">{title}</div>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>
      {children}
    </div>
  );
}
