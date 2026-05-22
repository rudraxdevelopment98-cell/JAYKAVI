/**
 * Import songs from an Excel harvest file into HarvestCandidates table.
 *
 * Usage:
 *   npx tsx scripts/import-excel.ts path/to/file.xlsx
 *
 * Expected columns: Title | Channel | Published | Views | Link | Source
 *
 * Requires DATABASE_URL in .env / .env.local
 */

import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExcelRow {
  Title: string;
  Channel: string;
  Published: string;
  Views: number;
  Link: string;
  Source: string;
}

function extractYouTubeId(url: string): string | null {
  const m = url?.match(/v=([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function extractYear(published: string): number | null {
  const m = published?.match(/^(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/#\S+/g, '')
    .replace(/\s*\|.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-excel.ts <path-to-xlsx>');
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error('File not found:', absPath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(absPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`Read ${rows.length} rows from ${path.basename(absPath)}`);

  // Create a HarvestRun record
  const run = await prisma.harvestRun.create({
    data: {
      status: 'done',
      scanned: rows.length,
      newFound: rows.length,
    },
  });

  console.log(`Created HarvestRun id=${run.id}`);

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.Title || !row.Link) continue;

    const youtubeId = extractYouTubeId(String(row.Link));
    if (!youtubeId) {
      skipped++;
      continue;
    }

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

  console.log(`Done: ${created} candidates created, ${skipped} skipped (no YouTube ID or duplicate).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
