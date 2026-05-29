import { NextResponse } from 'next/server';
import { createBackup, pruneOldLogs } from '@/lib/backup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Weekly backup + log cleanup. Triggered by Vercel Cron (see vercel.json).
// Protected by CRON_SECRET: Vercel automatically sends it as a Bearer token
// when the env var is set. If no secret is configured, the route still runs
// (useful in local/dev), but setting CRON_SECRET in production is recommended.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const { itemCount, createdAt } = await createBackup();
    const pruned = await pruneOldLogs();
    return NextResponse.json({ ok: true, itemCount, createdAt, prunedLogs: pruned });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
