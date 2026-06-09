// env loaded via --env-file flag
import { isSheetsConfigured, syncToSheets } from '../lib/sheetsSync';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Configured:', isSheetsConfigured());
  console.log('Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('Sheet ID:', process.env.GOOGLE_SHEETS_BACKUP_ID);

  if (!isSheetsConfigured()) {
    console.error('Not configured — check .env');
    process.exit(1);
  }

  console.log('\nFetching data from DB...');
  const [songs, singers, collections, journey] = await Promise.all([
    prisma.song.findMany({
      include: { singers: true, platformLinks: true, lyricsTranslations: true, collection: { select: { title: true } } },
    }),
    prisma.singer.findMany({ select: { id: true, name: true, bio: true, photoUrl: true, sortOrder: true } }),
    prisma.collection.findMany({ select: { id: true, slug: true, title: true, description: true, year: true } }),
    prisma.journeyMilestone.findMany({ orderBy: { year: 'asc' }, select: { year: true, title: true, description: true } }),
  ]);

  console.log(`Songs: ${songs.length}, Singers: ${singers.length}, Collections: ${collections.length}, Journey: ${journey.length}`);
  console.log('\nSyncing to Google Sheets...');

  const result = await syncToSheets({ songs, singers, collections, journey });
  console.log('Result:', JSON.stringify(result, null, 2));

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
