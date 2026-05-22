import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ExcelRow {
  Title?: string;
  Channel?: string;
  Published?: string;
  Views?: number | string;
  Link?: string;
  Source?: string;
}

function extractYouTubeId(url: string): string | null {
  const m = url?.match(/v=([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function extractYear(published: string): number | null {
  const m = String(published ?? '').match(/^(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/#\S+/g, '')
    .split('|')[0]
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows found in sheet' }, { status: 400 });
  }

  let run;
  try {
    run = await prisma.harvestRun.create({
      data: {
        status: 'done',
        scanned: rows.length,
        newFound: rows.length,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database not connected. Set up DATABASE_URL first.' }, { status: 503 });
  }

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.Title || !row.Link) { skipped++; continue; }

    const youtubeId = extractYouTubeId(String(row.Link));
    if (!youtubeId) { skipped++; continue; }

    const title = cleanTitle(String(row.Title));
    const year = row.Published ? extractYear(String(row.Published)) : null;

    try {
      await prisma.harvestCandidate.upsert({
        where: { youtubeId },
        create: {
          runId: run.id,
          youtubeId,
          cleanTitle: title,
          rawTitle: String(row.Title),
          channelTitle: row.Channel ? String(row.Channel) : null,
          viewCount: row.Views ? Number(row.Views) : null,
          releaseYear: year,
          status: 'pending',
        },
        update: {},
      });
      created++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ success: true, created, skipped, runId: run.id });
}
