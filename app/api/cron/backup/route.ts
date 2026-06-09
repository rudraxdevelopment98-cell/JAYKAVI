import { NextResponse } from 'next/server';
import { createBackup, pruneOldLogs, pruneDailyViews } from '@/lib/backup';
import { syncToSheets, isSheetsConfigured } from '@/lib/sheetsSync';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { itemCount, createdAt } = await createBackup();
    const pruned = await pruneOldLogs();
    const prunedViews = await pruneDailyViews();

    // Google Sheets sync — runs after DB backup so a failure here never
    // blocks the primary backup. Only runs if env vars are configured.
    let sheetsResult = null;
    if (isSheetsConfigured()) {
      const [songs, singers, collections, journey] = await Promise.all([
        prisma.song.findMany({
          include: { singers: true, platformLinks: true, lyricsTranslations: true, collection: { select: { title: true } } },
        }),
        prisma.singer.findMany({ select: { id: true, name: true, bio: true, photoUrl: true, sortOrder: true } }),
        prisma.collection.findMany({ select: { id: true, slug: true, title: true, description: true, year: true } }),
        prisma.journeyMilestone.findMany({ orderBy: { year: 'asc' }, select: { year: true, title: true, description: true } }),
      ]);
      sheetsResult = await syncToSheets({ songs, singers, collections, journey });
    }

    return NextResponse.json({ ok: true, itemCount, createdAt, prunedLogs: pruned, prunedViews, sheets: sheetsResult });
  } catch (err) {
    console.error('[cron/backup]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
