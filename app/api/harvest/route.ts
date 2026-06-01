import { auth } from '@/auth';
import { runHarvest } from '@/lib/harvest';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY is not configured. Add it to your .env file.' },
      { status: 400 }
    );
  }
  try {
    await prisma.harvestCandidate.deleteMany({ where: { status: 'pending' } });
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.harvestRun.deleteMany({ where: { startedAt: { lt: sevenDaysAgo } } });
    const result = await runHarvest();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Harvest failed: ${msg}` },
      { status: 500 }
    );
  }
}
