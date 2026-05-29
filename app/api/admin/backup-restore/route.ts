import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { restoreFromBackup } from '@/lib/backup';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  const session: any = await auth();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await restoreFromBackup();
    await logActivity({
      actorEmail: session.user?.email,
      action: 'update',
      entity: 'Backup',
      label: `restore`,
      detail: `${result.songs} songs, ${result.singers} singers, ${result.collections} collections, ${result.journey} journey, ${result.posts} posts`,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
