// Google Sheets sync for JAYKAVI site backup.
//
// Uses a Google Service Account and the Sheets REST API (no npm dependency).
// The JWT is signed with Web Crypto (available in Node 18 + Vercel Edge).
//
// Required env vars:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL   - service account email (xxx@xxx.iam.gserviceaccount.com)
//   GOOGLE_SERVICE_ACCOUNT_KEY     - private key from service account JSON (with literal \n)
//   GOOGLE_SHEETS_BACKUP_ID        - the Google Sheet ID (from its URL)

export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY &&
    process.env.GOOGLE_SHEETS_BACKUP_ID
  );
}

// ── JWT / Auth ────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sigInput = `${header}.${payload}`;

  // Parse PEM PKCS#8 private key
  const pemBody = rawKey
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const keyBytes = Buffer.from(pemBody, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(sigInput),
  );

  const sig = Buffer.from(new Uint8Array(sigBuffer)).toString('base64url');
  const jwt = `${sigInput}.${sig}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    cache: 'no-store',
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Google auth failed (${resp.status}): ${body.slice(0, 300)}`);
  }

  const json = await resp.json();
  return json.access_token as string;
}

// ── Sheets API helpers ────────────────────────────────────────────────────────

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function sheetsRequest(
  token: string,
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<any> {
  const resp = await fetch(`${SHEETS_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Sheets API ${resp.status}: ${text.slice(0, 300)}`);
  }
  return resp.json();
}

// Get or create a named sheet tab, returning its sheetId.
async function ensureSheet(
  token: string,
  spreadsheetId: string,
  title: string,
  existingSheets: { title: string; sheetId: number }[],
): Promise<number> {
  const found = existingSheets.find((s) => s.title === title);
  if (found) return found.sheetId;

  const res = await sheetsRequest(token, `/${spreadsheetId}:batchUpdate`, 'POST', {
    requests: [{ addSheet: { properties: { title } } }],
  });
  return res.replies[0].addSheet.properties.sheetId as number;
}

// Write rows to a sheet (clears first).
async function writeSheet(
  token: string,
  spreadsheetId: string,
  sheetTitle: string,
  rows: (string | number | null)[][],
): Promise<void> {
  const range = `${sheetTitle}!A1`;

  // Clear existing content
  await sheetsRequest(token, `/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}:clear`, 'POST');

  if (rows.length === 0) return;

  await sheetsRequest(token, `/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, 'PUT', {
    range,
    majorDimension: 'ROWS',
    values: rows,
  });
}

// ── Data formatters ───────────────────────────────────────────────────────────

type SongRow = {
  id: string; slug: string; title: string; subtitle: string | null;
  language: string; lyricistCredit: string; composer: string | null;
  releaseYear: number | null; viewCount: number; isTrending: boolean;
  youtubeId: string | null; spotifyTrackId: string | null;
  artworkUrl: string | null; lyrics: string;
  singers: { singerId: string }[];
  platformLinks: { platform: string; url: string }[];
  lyricsTranslations: { language: string; text: string }[];
  collection?: { title: string } | null;
  updatedAt?: Date | string;
};

type SingerRow = { id: string; name: string; bio: string | null; photoUrl: string | null; sortOrder: number };
type CollectionRow = { id: string; slug: string; title: string; description: string; year: number | null };
type JourneyRow = { year: number | null; title: string; description: string };

function songRows(songs: SongRow[], singerMap: Map<string, string>): (string | number | null)[][] {
  const header: string[] = [
    'ID', 'Slug', 'Title', 'Subtitle', 'Language', 'Singers',
    'Collection', 'Lyricist Credit', 'Composer', 'Release Year',
    'View Count', 'Trending', 'YouTube ID', 'Spotify ID',
    'Artwork URL', 'Platform Links', 'Lyrics', 'Translations', 'Updated At',
  ];
  const rows: (string | number | null)[][] = [header];
  for (const s of songs) {
    const singers = (s.singers ?? []).map((ss) => singerMap.get(ss.singerId) ?? ss.singerId).join(', ');
    const platforms = (s.platformLinks ?? []).map((p) => `${p.platform}: ${p.url}`).join(' | ');
    const translations = (s.lyricsTranslations ?? []).map((t) => `[${t.language}]: ${t.text.slice(0, 200)}`).join('\n---\n');
    rows.push([
      s.id, s.slug, s.title, s.subtitle ?? '',
      s.language, singers,
      s.collection?.title ?? '',
      s.lyricistCredit, s.composer ?? '',
      s.releaseYear ?? '', s.viewCount,
      s.isTrending ? 'Yes' : 'No',
      s.youtubeId ?? '', s.spotifyTrackId ?? '',
      s.artworkUrl ?? '', platforms,
      // Truncate lyrics to 49 000 chars — Sheets cell limit is 50 000
      s.lyrics.slice(0, 49_000),
      translations,
      s.updatedAt ? new Date(s.updatedAt).toISOString() : '',
    ]);
  }
  return rows;
}

function singerRows(singers: SingerRow[]): (string | number | null)[][] {
  const header = ['ID', 'Name', 'Bio', 'Photo URL', 'Sort Order'];
  return [header, ...singers.map((s) => [s.id, s.name, s.bio ?? '', s.photoUrl ?? '', s.sortOrder])];
}

function collectionRows(collections: CollectionRow[]): (string | number | null)[][] {
  const header = ['ID', 'Slug', 'Title', 'Description', 'Year'];
  return [header, ...collections.map((c) => [c.id, c.slug, c.title, c.description, c.year ?? ''])];
}

function journeyRows(journey: JourneyRow[]): (string | number | null)[][] {
  const header = ['Year', 'Title', 'Description'];
  return [header, ...journey.map((m) => [m.year ?? '', m.title, m.description])];
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface SheetsSyncResult {
  ok: boolean;
  songs: number;
  singers: number;
  collections: number;
  journey: number;
  syncedAt: string;
  error?: string;
}

export async function syncToSheets(data: {
  songs: SongRow[];
  singers: SingerRow[];
  collections: CollectionRow[];
  journey: JourneyRow[];
}): Promise<SheetsSyncResult> {
  if (!isSheetsConfigured()) {
    return {
      ok: false,
      songs: 0, singers: 0, collections: 0, journey: 0,
      syncedAt: new Date().toISOString(),
      error: 'Google Sheets not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY, and GOOGLE_SHEETS_BACKUP_ID in .env',
    };
  }

  const spreadsheetId = process.env.GOOGLE_SHEETS_BACKUP_ID!;
  const token = await getAccessToken();

  // Load existing sheets so we can create missing ones
  const meta = await sheetsRequest(token, `/${spreadsheetId}?fields=sheets.properties`);
  const existing: { title: string; sheetId: number }[] = (meta.sheets ?? []).map((s: any) => ({
    title: s.properties.title as string,
    sheetId: s.properties.sheetId as number,
  }));

  await ensureSheet(token, spreadsheetId, 'Songs', existing);
  await ensureSheet(token, spreadsheetId, 'Singers', existing);
  await ensureSheet(token, spreadsheetId, 'Collections', existing);
  await ensureSheet(token, spreadsheetId, 'Journey', existing);

  // Build singer id → name lookup for the Songs sheet
  const singerMap = new Map(data.singers.map((s) => [s.id, s.name]));

  const now = new Date().toISOString();
  const meta2Rows: (string | number | null)[][] = [
    ['Last synced', now],
    ['Songs', data.songs.length],
    ['Singers', data.singers.length],
    ['Collections', data.collections.length],
    ['Journey milestones', data.journey.length],
  ];

  await ensureSheet(token, spreadsheetId, 'Info', existing);
  await writeSheet(token, spreadsheetId, 'Info', meta2Rows);
  await writeSheet(token, spreadsheetId, 'Songs', songRows(data.songs, singerMap));
  await writeSheet(token, spreadsheetId, 'Singers', singerRows(data.singers));
  await writeSheet(token, spreadsheetId, 'Collections', collectionRows(data.collections));
  await writeSheet(token, spreadsheetId, 'Journey', journeyRows(data.journey));

  return {
    ok: true,
    songs: data.songs.length,
    singers: data.singers.length,
    collections: data.collections.length,
    journey: data.journey.length,
    syncedAt: now,
  };
}
