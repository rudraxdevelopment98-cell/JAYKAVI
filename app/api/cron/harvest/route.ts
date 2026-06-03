import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runHarvest } from '@/lib/harvest';
import { pruneDailyViews } from '@/lib/backup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Weekly auto-harvest. Triggered by Vercel Cron (see vercel.json).
// Only runs if the admin has turned auto-run ON in the harvester settings.
// Protected by CRON_SECRET (sent by Vercel as a Bearer token).
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
    const cfg = await prisma.harvestConfig.findFirst({ where: { id: 1 } });
    if (!cfg?.autoRun) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'auto-run is off' });
    }

    await pruneDailyViews().catch(() => {});

    const result = await runHarvest();
    return NextResponse.json({ ok: !result.error, ...result });
  } catch (err) {
    console.error('[cron/harvest]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
