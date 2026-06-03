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
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const cfg = await prisma.harvestConfig.findFirst({ where: { id: 1 } });
    if (!cfg?.autoRun) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'auto-run is off' });
    }

    // Opportunistically prune old analytics rows while we're here.
    await pruneDailyViews().catch(() => {});

    const result = await runHarvest();
    return NextResponse.json({ ok: !result.error, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
