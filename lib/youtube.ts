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
  // raw channel ID
  if (/^UC[\w-]{22}$/.test(s)) return s;
  // /channel/UC... URL
  const m = s.match(/\/channel\/(UC[\w-]{22})/);
  if (m) return m[1];
  // @handle or custom URL — resolve via search
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
          sn.thumbnails?.medium?.url ?? sn.thumbnails?.default?.url ?? '',
        viewCount:
          item.statistics?.viewCount != null
            ? parseInt(item.statistics.viewCount, 10)
            : null,
      });
    }
  }
  return map;
}

export function passesFilter(video: YTVideo, needles: string[]): boolean {
  const blob = `${video.title} ${video.description}`.toLowerCase();
  return needles.some((n) => blob.includes(n.toLowerCase()));
}

export function guessSinger(title: string, singers: string[]): string {
  const hits = singers.filter((s) => title.toLowerCase().includes(s.toLowerCase()));
  return hits.join(' | ');
}

export function cleanTitle(title: string): string {
  return title
    .replace(/#\S+/g, '')
    .replace(/\|.*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[-|\s]+|[-|\s]+$/g, '')
    .trim();
}
