import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { syncViews } from '@/app/api/cron/sync-views/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Admin-only manual trigger for the same sync logic used by the cron.
export async function POST(req: Request) {
  const session = await auth();
  if (!(session as any)?.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  return syncViews();
}
