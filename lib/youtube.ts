const BASE = 'https://www.googleapis.com/youtube/v3';

function key() {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k) throw new Error('YOUTUBE_API_KEY is not set');
  return k;
}

async function ytGet(endpoint: string, params: Record<string, string | number>) {
  const url = new URL(`${BASE}/${endpoint}`);
  Object.entries({ ...params, key: key() }).forEach(([k, v]) =>
    url.searchParams.set(k, String(v))
  );
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (res.status === 403 || res.status === 429) {
    const body = await res.text();
    if (body.toLowerCase().includes('quota')) {
      throw new Error('YouTube API daily quota exceeded. Try again tomorrow.');
    }
    throw new Error(`YouTube API rate limited (${res.status})`);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

export interface YTVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number | null;
}

export async function resolveChannelId(urlOrId: string): Promise<string | null> {
  const s = urlOrId.trim();
  if (/^UC[\w-]{22}$/.test(s)) return s;
  const m = s.match(/\/channel\/(UC[\w-]{22})/);
  if (m) return m[1];
  const handle = s.replace(/\/$/, '').split('/').pop()!.replace(/^@/, '');
  const data = await ytGet('search', { part: 'snippet', q: handle, type: 'channel', maxResults: 1 });
  return data.items?.[0]?.snippet?.channelId ?? null;
}

export async function getUploadsPlaylist(channelId: string): Promise<string | null> {
  const data = await ytGet('channels', { part: 'contentDetails', id: channelId });
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

export async function videoIdsFromPlaylist(playlistId: string, cap: number): Promise<string[]> {
  const out: string[] = [];
  let token: string | undefined;
  while (out.length < cap) {
    const params: Record<string, string | number> = {
      part: 'contentDetails',
      playlistId,
      maxResults: 50,
    };
    if (token) params.pageToken = token;
    const data = await ytGet('playlistItems', params);
    for (const item of data.items ?? []) {
      out.push(item.contentDetails.videoId);
      if (out.length >= cap) break;
    }
    token = data.nextPageToken;
    if (!token) break;
  }
  return out;
}

export async function videoIdsFromSearch(term: string, cap: number): Promise<string[]> {
  const out: string[] = [];
  let token: string | undefined;
  while (out.length < cap) {
    const params: Record<string, string | number> = {
      part: 'snippet',
      q: term,
      type: 'video',
      videoCategoryId: '10', // Music only
      maxResults: Math.min(50, cap - out.length),
    };
    if (token) params.pageToken = token;
    const data = await ytGet('search', params);
    for (const item of data.items ?? []) {
      out.push(item.id.videoId);
    }
    token = data.nextPageToken;
    if (!token) break;
  }
  return out;
}

export async function hydrateVideos(ids: string[]): Promise<Map<string, YTVideo>> {
  const map = new Map<string, YTVideo>();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const data = await ytGet('videos', {
      part: 'snippet,statistics',
      id: chunk.join(','),
    });
    for (const item of data.items ?? []) {
      const sn = item.snippet;
      map.set(item.id, {
        id: item.id,
        title: sn.title ?? '',
        description: sn.description ?? '',
        channelTitle: sn.channelTitle ?? '',
        publishedAt: sn.publishedAt ?? '',
        thumbnailUrl:
          sn.thumbnails?.maxres?.url ??
          sn.thumbnails?.high?.url ??
          sn.thumbnails?.standard?.url ??
          sn.thumbnails?.medium?.url ??
          sn.thumbnails?.default?.url ?? '',
        viewCount:
          item.statistics?.viewCount != null
            ? parseInt(item.statistics.viewCount, 10)
            : null,
      });
    }
  }
  return map;
}

// ─── Compilation / jukebox reject patterns ───────────────────────────────────
const COMPILATION_RE = /\b(jukebox|non[- ]?stop|nonstop|top\s*\d+|mashup|mash[- ]?up|collection|full album|all songs|songs list|playlist|medley|mix\s*vol|bhajan\s*mala|garba\s*collection)\b/i;

// ─── Strong credit-line patterns ─────────────────────────────────────────────
// Matches "Lyrics : X", "Written By - X", "ગીત : X", "ગીતકાર : X", "Kavya : X" etc.
const CREDIT_LINE_RE = /(?:lyrics?|lyricist|written\s+by|words?\s+by|script\s+by|ગીત|ગીતકાર|ગીતો|શબ્દ|kavi(?:ta)?|kavya|rachna\s+karta|poet)\s*[:\-–|]\s*/i;

// Medium: line talks about lyrics/writing but without colon
const CREDIT_CONTEXT_RE = /(?:lyrics?|lyricist|written\s+by|words?\s+by|ગીત|ગીતકાર)/i;

function matchesNeedle(text: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use word boundaries for ASCII, plain includes for Unicode (Gujarati)
  if (/^[\x00-\x7F]+$/.test(needle)) {
    try {
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    } catch {
      return text.toLowerCase().includes(needle.toLowerCase());
    }
  }
  return text.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Score-based filter.
 * Score thresholds:
 *   >= 5 → accept (high confidence)
 *   <  5 → reject
 *
 * Scoring:
 *   +6  lyricist name in video title (word boundary for English)
 *   +5  "Lyrics : JAYKAVI" style credit line in description
 *   +3  lyricist name on a line that has a credit keyword (written by, ગીત etc.)
 *   +1  lyricist name found anywhere in description (not hashtag)
 *  -10  title looks like a compilation (jukebox, nonstop, mashup, …)
 */
export function passesFilter(video: YTVideo, needles: string[], _knownSingers?: string[]): boolean {
  const title = video.title;
  const titleL = title.toLowerCase();

  // Hard reject: compilation videos
  if (COMPILATION_RE.test(title)) return false;

  let score = 0;

  // +6: name in title
  for (const needle of needles) {
    if (matchesNeedle(titleL, needle.toLowerCase())) {
      score += 6;
      break;
    }
  }

  // Analyse description lines
  const lines = video.description.split('\n');
  const hashtagLineRe = /^(\s*#\w+\s*)+$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Skip lines that are purely hashtags (e.g. "#JAYKAVI #Gujarati")
    if (hashtagLineRe.test(line)) continue;

    const lineL = line.toLowerCase();
    for (const needle of needles) {
      if (matchesNeedle(lineL, needle.toLowerCase())) {
        if (CREDIT_LINE_RE.test(line)) {
          // "Lyrics : JAYKAVI" → strongest signal
          score += 5;
        } else if (CREDIT_CONTEXT_RE.test(line)) {
          // "Lyrics JAYKAVI" or "ગીત JAYKAVI" without colon
          score += 3;
        } else {
          // Name found somewhere in a non-hashtag line
          score += 1;
        }
        break; // only count each line once
      }
    }
    if (score >= 5) break; // no need to keep scanning
  }

  return score >= 5;
}

export function guessSinger(title: string, singers: string[]): string {
  const hits = singers.filter((s) => title.toLowerCase().includes(s.toLowerCase()));
  return hits.join(' | ');
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\(official\s*(video|audio|music\s*video|lyric\s*video|song)?\)/gi, '')
    .replace(/\[official\s*(video|audio|music\s*video|lyric\s*video|song)?\]/gi, '')
    .replace(/\|\s*official\s*(video|audio|song)/gi, '')
    .replace(/(?:full\s+)?(?:official\s+)?(?:hd|hq|4k|1080p|720p)/gi, '')
    .replace(/new\s+(?:gujarati\s+)?(?:song|video)\s*\d{4}/gi, '')
    .replace(/\d{4}\s+(?:new\s+)?(?:gujarati\s+)?(?:song|video)/gi, '')
    .replace(/#\S+/g, '')
    .replace(/\|[^|]{0,60}$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[-|\s]+|[-|\s]+$/g, '')
    .trim();
}
