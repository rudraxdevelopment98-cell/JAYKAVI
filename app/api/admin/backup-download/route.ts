import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Download the latest stored backup as a JSON file. Admin session required.
export async function GET() {
  const session: any = await auth();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backup = await prisma.backup.findFirst({ where: { id: 1 } });
  if (!backup) {
    return NextResponse.json({ error: 'No backup yet' }, { status: 404 });
  }

  const date = new Date(backup.createdAt).toISOString().slice(0, 10);
  return new NextResponse(backup.data, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="jaykavi-backup-${date}.json"`,
    },
  });
}
