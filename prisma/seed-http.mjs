import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const data = JSON.parse(readFileSync(join(__dirname, '../data/songwriter_data.json'), 'utf8'));

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL required'); process.exit(1); }

const sql = neon(url);
const now = new Date().toISOString();
const newId = () => 'c' + Math.random().toString(36).slice(2, 14) + Date.now().toString(36);

console.log('Seeding Neon database from songwriter_data.json...');

// --- Lyricist (singleton) ---
const ly = data.lyricist;
await sql(`DELETE FROM "Lyricist" WHERE id = 1`);
await sql(
  `INSERT INTO "Lyricist" (id, name, "penName", "displayName", "creditVariants", title, tagline, "bornPlace", "basedIn", "birthDate", languages, genres, "careerStartYear", "songsWritten", "songsPublishedOnStreaming", bio, philosophy, awards, press, "updatedAt")
   VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
  [
    ly.name,
    ly.penName ?? null,
    ly.displayName ?? null,
    ly.creditVariants ?? [],
    ly.title ?? null,
    ly.tagline ?? '',
    ly.bornPlace ?? null,
    ly.basedIn ?? null,
    ly.birthDate ?? null,
    ly.languages ?? [],
    ly.genres ?? [],
    ly.careerStartYear ?? null,
    ly.stats?.songsWritten ?? null,
    ly.stats?.songsPublishedOnStreaming ?? null,
    ly.bio ?? '',
    ly.philosophy ?? null,
    ly.awards ?? [],
    ly.press ?? [],
    now,
  ]
);
console.log('  ✓ Lyricist');

// --- Contact (singleton) ---
const c = data.contact;
await sql(`DELETE FROM "Contact" WHERE id = 1`);
await sql(
  `INSERT INTO "Contact" (id, "useContactForm", "showEmailPublicly", instagram, "instagramSecondary", youtube, spotify, jiosaavn, "privateEmail", "privatePhone", "updatedAt")
   VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
  [
    c.public?.useContactForm ?? true,
    c.public?.showEmailPublicly ?? false,
    c.public?.social?.instagram ?? null,
    c.public?.social?.instagramSecondary ?? null,
    c.public?.social?.youtube ?? null,
    c.public?.social?.spotify ?? null,
    c.public?.social?.jiosaavn ?? null,
    c.private?.email ?? null,
    c.private?.phone ?? null,
    now,
  ]
);
console.log('  ✓ Contact');

// --- Singers ---
await sql(`DELETE FROM "Singer"`);
for (const s of data.singers ?? []) {
  await sql(
    `INSERT INTO "Singer" (id, "legacyId", name, "photoUrl", bio, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $6)`,
    [newId(), s.id, s.name, s.photoUrl ?? null, s.bio ?? null, now]
  );
}
console.log(`  ✓ Singers (${data.singers?.length ?? 0})`);

// --- Collections ---
await sql(`DELETE FROM "Collection"`);
for (const col of data.collections ?? []) {
  await sql(
    `INSERT INTO "Collection" (id, "legacyId", slug, title, description, "coverUrl", "releaseYear", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
    [newId(), col.id, col.slug, col.title, col.description ?? null, col.coverUrl ?? null, col.releaseYear ?? null, now]
  );
}
console.log(`  ✓ Collections (${data.collections?.length ?? 0})`);

// --- Songs + relations ---
await sql(`DELETE FROM "Song"`);
const singerIdMap = new Map();
const singerRows = await sql(`SELECT id, "legacyId" FROM "Singer"`);
for (const r of singerRows) singerIdMap.set(r.legacyId, r.id);

const collectionIdMap = new Map();
const colRows = await sql(`SELECT id, "legacyId" FROM "Collection"`);
for (const r of colRows) collectionIdMap.set(r.legacyId, r.id);

for (const song of data.songs ?? []) {
  const collId = song.collectionId ? collectionIdMap.get(song.collectionId) ?? null : null;
  const songId = newId();
  await sql(
    `INSERT INTO "Song" (id, "legacyId", slug, title, "altTitles", "lyricistCredit", composer, "collectionId", language, genre, mood, "releaseYear", "artworkUrl", lyrics, "viewCount", "isTrending", "youtubeId", "spotifyTrackId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $19)`,
    [
      songId, song.id, song.slug, song.title, song.altTitles ?? [],
      song.lyricist ?? '', song.composer ?? null, collId,
      song.language ?? 'Gujarati', song.genre ?? [], song.mood ?? [],
      song.releaseYear ?? null, song.artworkUrl ?? null,
      song.lyrics ?? null, song.viewCount ?? 0, song.isTrending ?? false,
      song.embed?.youtubeId ?? null, song.embed?.spotifyTrackId ?? null,
      now,
    ]
  );

  for (const sn of song.performingSingers ?? []) {
    const singerRow = await sql(`SELECT id FROM "Singer" WHERE name = $1 LIMIT 1`, [sn]);
    let singerId = singerRow[0]?.id;
    if (!singerId) {
      singerId = newId();
      await sql(
        `INSERT INTO "Singer" (id, "legacyId", name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $4)`,
        [singerId, `singer-auto-${sn.toLowerCase().replace(/\s+/g, '-')}`, sn, now]
      );
    }
    await sql(
      `INSERT INTO "SongSinger" ("songId", "singerId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [songId, singerId]
    );
  }

  for (const pl of song.platformLinks ?? []) {
    await sql(
      `INSERT INTO "PlatformLink" (id, "songId", platform, url, "isPrimary") VALUES ($1, $2, $3, $4, $5)`,
      [newId(), songId, pl.platform, pl.url, pl.isPrimary ?? false]
    );
  }

  for (const tr of song.lyricsTranslations ?? []) {
    await sql(
      `INSERT INTO "LyricsTranslation" (id, "songId", language, lyrics) VALUES ($1, $2, $3, $4)`,
      [newId(), songId, tr.language, tr.lyrics]
    );
  }
}
console.log(`  ✓ Songs (${data.songs?.length ?? 0})`);

// --- Journey ---
await sql(`DELETE FROM "JourneyMilestone"`);
let order = 0;
for (const m of data.journey ?? []) {
  await sql(
    `INSERT INTO "JourneyMilestone" (id, "legacyId", year, title, description, "imageUrl", "sortOrder", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
    [newId(), m.id, m.year ?? null, m.title, m.description ?? null, m.imageUrl ?? null, order++, now]
  );
}
console.log(`  ✓ Journey (${data.journey?.length ?? 0})`);

console.log('\nDone. Database is seeded.');
