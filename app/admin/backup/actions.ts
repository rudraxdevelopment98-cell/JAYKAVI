'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { syncToSheets, isSheetsConfigured } from '@/lib/sheetsSync';
import { logActivity } from '@/lib/activity';

export async function syncSheetsNow(): Promise<{ ok: boolean; msg: string }> {
  const session: any = await auth();
  if (!session?.isAdmin) return { ok: false, msg: 'Unauthorized' };

  if (!isSheetsConfigured()) {
    return {
      ok: false,
      msg: 'Not configured. Add GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY, and GOOGLE_SHEETS_BACKUP_ID to your .env.',
    };
  }

  try {
    const [songs, singers, collections, journey] = await Promise.all([
      prisma.song.findMany({
        include: {
          singers: true,
          platformLinks: true,
          lyricsTranslations: true,
          collection: { select: { title: true } },
        },
      }),
      prisma.singer.findMany({ select: { id: true, name: true, bio: true, photoUrl: true, sortOrder: true } }),
      prisma.collection.findMany({ select: { id: true, slug: true, title: true, description: true, year: true } }),
      prisma.journeyMilestone.findMany({ orderBy: { year: 'asc' }, select: { year: true, title: true, description: true } }),
    ]);

    const result = await syncToSheets({ songs, singers, collections, journey });

    await logActivity({
      actorEmail: session.user?.email,
      action: 'update',
      entity: 'Backup',
      label: `Synced ${result.songs} songs to Google Sheets`,
      detail: 'manual sheets sync',
    });

    return {
      ok: true,
      msg: `Synced ${result.songs} songs, ${result.singers} singers to Google Sheets ✓`,
    };
  } catch (err: any) {
    return { ok: false, msg: `Sync failed: ${err?.message ?? 'unknown error'}` };
  }
}
