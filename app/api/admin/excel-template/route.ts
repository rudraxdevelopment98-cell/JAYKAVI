import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { auth } from '@/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const wb = XLSX.utils.book_new();

  const rows = [
    ['Title', 'Channel', 'Published', 'Views', 'Link', 'Source'],
    [
      'Taro Virasat | JAYKAVI | Geeta Rabari',
      'Geeta Rabari Official',
      '2023-04-15',
      1250000,
      'https://www.youtube.com/watch?v=EXAMPLE001',
      'YouTube',
    ],
    [
      'Maru Gam | New Gujarati Song 2023',
      'JAYKAVI Music',
      '2023-07-22',
      875000,
      'https://www.youtube.com/watch?v=EXAMPLE002',
      'YouTube',
    ],
    [
      'Dhol Ni Thaap | Folk Fusion | Official Video',
      'T-Series Gujarati',
      '2022-12-01',
      2300000,
      'https://www.youtube.com/watch?v=EXAMPLE003',
      'YouTube',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 45 },
    { wch: 28 },
    { wch: 14 },
    { wch: 12 },
    { wch: 48 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'JAYKAVI Songs');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="jaykavi-songs-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
