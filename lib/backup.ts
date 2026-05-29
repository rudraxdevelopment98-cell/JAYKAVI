import { prisma } from './prisma';

export const LOG_RETENTION_DAYS = 7;

// Delete activity-log entries older than the retention window so the table
// never grows without bound. Safe to call often; errors are swallowed.
export async function pruneOldLogs(): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const res = await prisma.activityLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return res.count;
  } catch {
    return 0;
  }
}

// Gather all content into a single JSON object and overwrite the Backup row.
// Returns the item count and timestamp.
export async function createBackup(): Promise<{ itemCount: number; createdAt: Date }> {
  const [
    lyricist,
    contact,
    singers,
    collections,
    songs,
    journey,
    harvestConfig,
    adminUsers,
  ] = await Promise.all([
    prisma.lyricist.findFirst(),
    prisma.contact.findFirst(),
    prisma.singer.findMany(),
    prisma.collection.findMany(),
    prisma.song.findMany({
      include: { singers: true, platformLinks: true, lyricsTranslations: true },
    }),
    prisma.journeyMilestone.findMany(),
    prisma.harvestConfig.findFirst(),
    prisma.adminUser.findMany(),
  ]);

  const snapshot = {
    version: 1,
    takenAt: new Date().toISOString(),
    lyricist,
    contact,
    singers,
    collections,
    songs,
    journey,
    harvestConfig,
    adminUsers,
  };

  const itemCount =
    singers.length + collections.length + songs.length + journey.length;

  const data = JSON.stringify(snapshot);
  const now = new Date();

  await prisma.backup.upsert({
    where: { id: 1 },
    update: { data, itemCount, createdAt: now },
    create: { id: 1, data, itemCount, createdAt: now },
  });

  return { itemCount, createdAt: now };
}
