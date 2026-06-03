import { NextResponse } from 'next/server';
import { createBackup, pruneOldLogs, pruneDailyViews } from '@/lib/backup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Weekly backup + log cleanup. Triggered by Vercel Cron (see vercel.json).
// Protected by CRON_SECRET: Vercel automatically sends it as a Bearer token
// when the env var is set. If no secret is configured, the route still runs
// (useful in local/dev), but setting CRON_SECRET in production is recommended.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail-closed: if no secret is configured in production, deny the request.
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
    return NextResponse.json({ ok: true, itemCount, createdAt, prunedLogs: pruned, prunedViews });
  } catch (err) {
    console.error('[cron/backup]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
