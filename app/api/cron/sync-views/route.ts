import { NextResponse } from 'next/server';
import { syncViews } from '@/lib/sync-views';

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
