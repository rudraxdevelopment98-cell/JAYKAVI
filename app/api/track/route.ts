import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Privacy-friendly view counter. Increments the song's all-time pageViews
// and the per-day total. No cookies, no IP storage, no personal data.
export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    await Promise.all([
      prisma.song.updateMany({
        where: { slug },
        data: { pageViews: { increment: 1 } },
      }),
      prisma.dailyView.upsert({
        where: { day },
        update: { count: { increment: 1 } },
        create: { day, count: 1 },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    // Never let analytics break the page.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
