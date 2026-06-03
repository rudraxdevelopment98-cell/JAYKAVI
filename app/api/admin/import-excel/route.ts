import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_ROWS = 5_000;
const ALLOWED_MIME = new Set(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']);
// xlsx magic bytes: PK\x03\x04 (ZIP/OOXML)
const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

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

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate magic bytes — must be a ZIP/OOXML file (.xlsx), not a crafted payload
  if (!buffer.subarray(0, 4).equals(XLSX_MAGIC)) {
    return NextResponse.json({ error: 'Invalid file format. Only .xlsx files are accepted.' }, { status: 400 });
  }

  // Parse with exceljs (no prototype pollution CVEs unlike xlsx@0.18)
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return NextResponse.json({ error: 'Could not parse the Excel file.' }, { status: 400 });
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return NextResponse.json({ error: 'No worksheet found in file' }, { status: 400 });

  // Extract header row to map columns by name
  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell) => { headers.push(String(cell.value ?? '').trim()); });

  const idx = (name: string) => headers.indexOf(name);
  const rows: Array<Record<string, string>> = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    if (rows.length >= MAX_ROWS) return;
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      const cell = row.getCell(i + 1);
      obj[h] = cell.value != null ? String(cell.value) : '';
    });
    rows.push(obj);
  });

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows found in sheet' }, { status: 400 });
  }
  if (rows.length >= MAX_ROWS) {
    return NextResponse.json({ error: `Spreadsheet too large (max ${MAX_ROWS} rows)` }, { status: 400 });
  }

  let run;
  try {
    run = await prisma.harvestRun.create({
      data: { status: 'done', scanned: rows.length, newFound: rows.length },
    });
  } catch {
    return NextResponse.json({ error: 'Database not connected. Set up DATABASE_URL first.' }, { status: 503 });
  }

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = row['Title']?.trim();
    const link  = row['Link']?.trim();
    if (!title || !link) { skipped++; continue; }

    const youtubeId = extractYouTubeId(link);
    if (!youtubeId) { skipped++; continue; }

    const cleanedTitle = cleanTitle(title);
    const year = row['Published'] ? extractYear(row['Published']) : null;

    try {
      await prisma.harvestCandidate.upsert({
        where: { youtubeId },
        create: {
          runId: run.id,
          youtubeId,
          cleanTitle: cleanedTitle,
          rawTitle: title,
          channelTitle: row['Channel'] || null,
          viewCount: row['Views'] ? Number(row['Views']) || null : null,
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
