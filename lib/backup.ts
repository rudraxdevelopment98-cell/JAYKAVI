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

export interface RestoreResult {
  singers: number;
  collections: number;
  songs: number;
  journey: number;
}

// Restore all content from the stored backup snapshot.
// AdminUser records are intentionally NOT restored — that would risk a lock-out.
// Relations are preserved by reusing the original IDs from the snapshot.
export async function restoreFromBackup(): Promise<RestoreResult> {
  const backup = await prisma.backup.findFirst({ where: { id: 1 } });
  if (!backup) throw new Error('No backup found');

  const snap = JSON.parse(backup.data);

  await prisma.$transaction(async (tx) => {
    // --- clear existing content (cascade handles relations) ---
    await tx.song.deleteMany();
    await tx.singer.deleteMany();
    await tx.collection.deleteMany();
    await tx.journeyMilestone.deleteMany();

    // --- singletons ---
    if (snap.lyricist) {
      const { updatedAt, ...rest } = snap.lyricist;
      await tx.lyricist.upsert({
        where: { id: 1 },
        update: rest,
        create: { ...rest, id: 1 },
      });
    }
    if (snap.contact) {
      const { updatedAt, ...rest } = snap.contact;
      await tx.contact.upsert({
        where: { id: 1 },
        update: rest,
        create: { ...rest, id: 1 },
      });
    }
    if (snap.harvestConfig) {
      const { updatedAt, ...rest } = snap.harvestConfig;
      await tx.harvestConfig.upsert({
        where: { id: 1 },
        update: rest,
        create: { ...rest, id: 1 },
      });
    }

    // --- singers ---
    for (const s of snap.singers ?? []) {
      const { updatedAt, createdAt, songs: _songs, ...rest } = s;
      await tx.singer.create({ data: rest });
    }

    // --- collections ---
    for (const c of snap.collections ?? []) {
      const { updatedAt, createdAt, songs: _songs, ...rest } = c;
      await tx.collection.create({ data: rest });
    }

    // --- songs (with nested relations) ---
    for (const s of snap.songs ?? []) {
      const { updatedAt, createdAt, collection, singers, platformLinks, lyricsTranslations, ...rest } = s;
      await tx.song.create({
        data: {
          ...rest,
          singers: {
            create: (singers ?? []).map((ss: any) => ({ singerId: ss.singerId })),
          },
          platformLinks: {
            create: (platformLinks ?? []).map(({ id: _id, songId: _sid, ...pl }: any) => pl),
          },
          lyricsTranslations: {
            create: (lyricsTranslations ?? []).map(({ id: _id, songId: _sid, ...lt }: any) => lt),
          },
        },
      });
    }

    // --- journey ---
    for (const m of snap.journey ?? []) {
      const { updatedAt, createdAt, ...rest } = m;
      await tx.journeyMilestone.create({ data: rest });
    }
  }, { timeout: 30000 });

  return {
    singers: (snap.singers ?? []).length,
    collections: (snap.collections ?? []).length,
    songs: (snap.songs ?? []).length,
    journey: (snap.journey ?? []).length,
  };
}
