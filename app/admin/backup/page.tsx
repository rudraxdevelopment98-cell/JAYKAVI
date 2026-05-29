import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createBackup, pruneOldLogs, LOG_RETENTION_DAYS } from '@/lib/backup';
import { logActivity } from '@/lib/activity';
import { revalidatePath } from 'next/cache';

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

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">Backup</h1>
      <p className="text-neutral-400 mt-1 mb-6 text-sm">
        A full snapshot of all site content (songs, singers, collections, journey, profile,
        contact, harvester config and admins). It runs automatically once a week and overwrites
        the previous one, so it never uses extra storage. You can also run it now and download a
        copy to keep safe.
      </p>

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

      <div className="flex items-center gap-3 flex-wrap">
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

      <p className="text-xs text-neutral-600 mt-8">
        Activity-log entries older than {LOG_RETENTION_DAYS} days are cleared during each backup to
        keep storage low. The backup is stored as a single record that is overwritten every time.
      </p>
    </div>
  );
}
