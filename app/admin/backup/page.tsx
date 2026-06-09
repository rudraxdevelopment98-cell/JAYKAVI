import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createBackup, pruneOldLogs, LOG_RETENTION_DAYS } from '@/lib/backup';
import { logActivity } from '@/lib/activity';
import { revalidatePath } from 'next/cache';
import { isSheetsConfigured } from '@/lib/sheetsSync';
import RestoreButton from './RestoreButton';
import SyncSheetsButton from './SyncSheetsButton';
import AdminPageHeader from '@/app/admin/_components/AdminPageHeader';

export const dynamic = 'force-dynamic';

async function getBackup() {
  try {
    return await prisma.backup.findFirst({ where: { id: 1 } });
  } catch {
    return null;
  }
}

async function runBackupNow() {
  'use server';
  const session: any = await auth();
  if (!session || !session.isAdmin) throw new Error('Unauthorized');
  const { itemCount } = await createBackup();
  await pruneOldLogs();
  await logActivity({
    actorEmail: session.user?.email,
    action: 'update',
    entity: 'Backup',
    label: `${itemCount} items`,
    detail: 'manual backup',
  });
  revalidatePath('/admin/backup');
}

export default async function BackupPage() {
  const backup = await getBackup();
  const sheetsReady = isSheetsConfigured();

  return (
    <>
      <AdminPageHeader
        title={<>Backup</>}
        subtitle={
          <>
            A full snapshot of all site content (songs, singers, collections, journey, profile,
            contact, harvester config and admins). It runs automatically once a week and overwrites
            the previous one, so it never uses extra storage. You can also run it now and download a
            copy to keep safe.
          </>
        }
      />
      <div className="max-w-2xl">
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 mb-6">
        {backup ? (
          <>
            <div className="text-sm text-neutral-300">
              Last backup:{' '}
              <strong className="text-neutral-100">
                {new Date(backup.createdAt).toLocaleString()}
              </strong>
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {backup.itemCount} content item{backup.itemCount !== 1 ? 's' : ''} ·{' '}
              {(backup.data.length / 1024).toFixed(1)} KB
            </div>
          </>
        ) : (
          <div className="text-sm text-neutral-400">
            No backup has been created yet. Run one now to get started.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <form action={runBackupNow}>
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
          >
            Run backup now
          </button>
        </form>

        {backup && (
          <a
            href="/api/admin/backup-download"
            className="px-5 py-2.5 border border-neutral-700 rounded-md font-medium hover:bg-neutral-800 transition"
          >
            ⬇ Download backup (.json)
          </a>
        )}
      </div>

      {/* ── Google Sheets sync ─────────────────────────────── */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 mb-6">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div>
            <p className="text-sm font-medium text-neutral-200">Google Sheets sync</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Writes Songs, Singers, Collections and Journey to a Google Sheet you own — so your
              lyrics are safe even if the database is wiped. Runs automatically with the weekly
              backup (Sunday 3am) or trigger it manually anytime.
            </p>
          </div>
          {sheetsReady && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">Configured ✓</span>}
        </div>
        <SyncSheetsButton />
        {!sheetsReady && (
          <details className="mt-4 text-xs text-neutral-400">
            <summary className="cursor-pointer text-neutral-300 hover:text-white">Setup instructions ↓</summary>
            <ol className="mt-3 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Go to <strong>console.cloud.google.com</strong> → IAM &amp; Admin → Service Accounts → Create service account.</li>
              <li>Download the JSON key. Copy the <code className="text-neutral-300">client_email</code> and <code className="text-neutral-300">private_key</code> values.</li>
              <li>Create a new Google Sheet in your account. Copy its ID from the URL (the long string between <code className="text-neutral-300">/d/</code> and <code className="text-neutral-300">/edit</code>).</li>
              <li>Share that Sheet with the service account email (Editor access).</li>
              <li>Add to your <code className="text-neutral-300">.env</code>:
                <pre className="mt-1 p-2 bg-neutral-950 rounded text-neutral-300 overflow-x-auto">{`GOOGLE_SERVICE_ACCOUNT_EMAIL="xxx@xxx.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_BACKUP_ID="your-sheet-id-here"`}</pre>
              </li>
              <li>Redeploy the site. The "Sync to Google Sheets" button will activate.</li>
            </ol>
          </details>
        )}
      </div>

      {backup && (
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-neutral-300">Restore</p>
          <p className="text-sm text-neutral-400">
            Replace all current content with the snapshot above. Admin accounts are never touched.
            A confirmation step is required before anything is changed.
          </p>
          <RestoreButton />
        </div>
      )}

      <p className="text-xs text-neutral-600 mt-8">
        Activity-log entries older than {LOG_RETENTION_DAYS} days are cleared during each backup to
        keep storage low. The backup is stored as a single record that is overwritten every time.
      </p>
      </div>
    </>
  );
}
