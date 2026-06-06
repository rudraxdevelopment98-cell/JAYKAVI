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

export const dynamic = 'force-dynamic';

async function getData() {
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
  return { config, pending, recent, settings };
}

export default async function HarvesterPage() {
  const { config, pending, recent, settings } = await getData();
  const hasApiKey = !!process.env.YOUTUBE_API_KEY;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Song Harvester</h1>
          <p className="text-neutral-400 mt-1">
            Searches YouTube for new JAYKAVI songs and queues them for your review.
          </p>
        </div>
        <Link
          href="/admin/harvester/config"
          className="shrink-0 text-sm px-3 py-1.5 border border-neutral-700 rounded-md hover:bg-neutral-800 transition"
        >
          Configure
        </Link>
      </div>

      {/* API key warning */}
      {!hasApiKey && (
        <div className="mb-6 px-4 py-3 bg-yellow-950/60 border border-yellow-800 rounded-xl text-sm text-yellow-300">
          <strong>YOUTUBE_API_KEY not set.</strong> Add it to your{' '}
          <code className="font-mono bg-yellow-900/40 px-1 rounded">.env</code> file to enable
          harvesting. Free quota: 10,000 units/day.
        </div>
      )}

      {/* Run button + config summary */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium mb-1">Start a new harvest</div>
            <div className="text-sm text-neutral-400">
              Searches {config?.searchTerms.length ?? 4} terms ·{' '}
              {config?.ownChannels.length ?? 0} own channels ·{' '}
              up to {config?.maxResultsPerTerm ?? 100} results per term
            </div>
          </div>
          <RunButton hasApiKey={hasApiKey} />
        </div>
      </div>

      {/* Auto-run toggle */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl mb-4">
        <AutoRunToggle initial={!!(config as any)?.autoRun} />
      </div>

      {/* Playlist import */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl mb-4">
        <div className="font-medium mb-1">Import from Playlist</div>
        <p className="text-sm text-neutral-400 mb-3">
          Paste a YouTube playlist URL or ID to import up to 200 videos as pending candidates.
        </p>
        <PlaylistImportButton />
      </div>

      {/* View count sync */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl mb-4">
        <div className="font-medium mb-1">Sync YouTube View Counts</div>
        <p className="text-sm text-neutral-400 mb-3">
          Refreshes the view count for every song that has a YouTube ID. Runs automatically every 2 days,
          or trigger it manually here.
        </p>
        <SyncViewsButton lastSynced={settings?.viewsSyncedAt ?? null} />
      </div>

      {/* Restore exact titles */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl mb-4">
        <div className="font-medium mb-1">Restore Exact YouTube Titles</div>
        <p className="text-sm text-neutral-400 mb-3">
          Songs imported earlier may have shortened titles. This restores each song&apos;s
          full, exact YouTube title and keeps the cleaned line as its subtitle. Only songs with a
          matching harvest candidate are touched.
        </p>
        <BackfillTitlesButton />
      </div>

      {/* Excel import */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl mb-6">
        <div className="font-medium mb-1">Import from Excel</div>
        <p className="text-sm text-neutral-400 mb-3">
          Upload a spreadsheet with columns: <code className="text-neutral-300">Title · Channel · Published · Views · Link · Source</code>.
          All rows are added as pending candidates for you to review.
        </p>
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
      </div>

      {/* Pending review queue */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">
            Pending Review{' '}
            <span className="text-neutral-400 font-normal text-base">
              ({pending.length})
            </span>
          </h2>
          <ClearAllButton count={pending.length} />
        </div>

        <HarvesterQueue candidates={pending} />
      </section>

      {/* Recent runs */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Runs</h2>
        {recent.length === 0 ? (
          <p className="text-neutral-400 text-sm">No runs yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-neutral-900 text-neutral-400 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Scanned</th>
                  <th className="px-4 py-2 font-medium">New found</th>
                  <th className="px-4 py-2 font-medium">Candidates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-900/60">
                    <td className="px-4 py-2 text-neutral-300">
                      {new Date(r.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'done'
                            ? 'bg-green-900/60 text-green-300'
                            : r.status === 'error'
                            ? 'bg-red-900/60 text-red-300'
                            : 'bg-yellow-900/60 text-yellow-300'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.errorMsg && (
                        <span className="ml-2 text-xs text-red-400">{r.errorMsg}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-neutral-300">{r.scanned}</td>
                    <td className="px-4 py-2 text-neutral-300">{r.newFound}</td>
                    <td className="px-4 py-2 text-neutral-300">{r._count.candidates}</td>
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
