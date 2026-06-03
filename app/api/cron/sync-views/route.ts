import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hydrateVideos } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Runs every 2 days (see vercel.json). Refreshes viewCount on every song
// that has a youtubeId by calling the YouTube Data API in batches of 50.
// Protected by CRON_SECRET, same pattern as /api/cron/harvest.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  return syncViews();
}

export async function syncViews(): Promise<NextResponse> {
  try {
    const songs = await prisma.song.findMany({
      where: { youtubeId: { not: null } },
      select: { id: true, youtubeId: true, viewCount: true },
    });

    if (songs.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, unchanged: 0, total: 0 });
    }

    const ids = songs.map((s) => s.youtubeId as string);
    const ytData = await hydrateVideos(ids);

    let updated = 0;
    let unchanged = 0;
    let errors = 0;

    await Promise.all(
      songs.map(async (song) => {
        const yt = ytData.get(song.youtubeId as string);
        if (!yt || yt.viewCount == null) {
          errors++;
          return;
        }
        if (yt.viewCount === song.viewCount) {
          unchanged++;
          return;
        }
        await prisma.song.update({
          where: { id: song.id },
          data: { viewCount: yt.viewCount },
        });
        updated++;
      }),
    );

    // Record last sync time
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { viewsSyncedAt: new Date() },
      create: { id: 1, viewsSyncedAt: new Date() },
    });

    return NextResponse.json({ ok: true, total: songs.length, updated, unchanged, errors });
  } catch (err: any) {
    console.error('[cron/sync-views]', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Internal server error' },
      { status: 500 },
    );
  }
}
