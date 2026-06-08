// Helpers for auto-fetching song lyrics from public sources.
// Used by the admin "Fetch lyrics" action.

import { hydrateVideos } from './youtube';

export interface LyricsSuggestion {
  source: 'youtube' | 'google';
  label: string;        // human-readable origin (e.g. "YouTube description", "lyricsbogie.com")
  url?: string;         // link to original page when applicable
  text: string;         // candidate lyrics text
  confidence: 'high' | 'medium' | 'low';
}

// ── YouTube description extraction ───────────────────────────────────────────
// Many Gujarati music videos paste full lyrics directly in the description.
// We strip away the credits/links block and keep the body if it looks like lyrics.

const CREDIT_HEAD_RE = /^(song|track|movie|album|singer|singers|music|composer|lyricist|lyrics?|written\s*by|words?\s*by|director|producer|label|starring|cast|featuring|presents?|presented\s*by|production|video|cinematography|edit(ed|or)|dop|mix(ing)?|master(ing)?|recorded|copyright|©|℗|subscribe|follow|stream|download|available|buy|tickets?|venue|date)[\s:\-–|]/i;
const URL_RE = /\bhttps?:\/\/\S+/i;
const HASHTAG_RE = /^#\S+/;
const EMAIL_RE = /\S+@\S+\.\S+/;

function looksLikeLyricsLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true; // blank lines OK (stanza breaks)
  if (URL_RE.test(trimmed)) return false;
  if (EMAIL_RE.test(trimmed)) return false;
  if (HASHTAG_RE.test(trimmed)) return false;
  if (CREDIT_HEAD_RE.test(trimmed)) return false;
  // Very short lines starting with bullets/dashes
  if (/^[•●▪►→\-=*]{1,3}\s*\w/.test(trimmed) && trimmed.length < 20) return false;
  return true;
}

function extractLyricsFromDescription(desc: string): string | null {
  if (!desc || desc.length < 80) return null;
  const lines = desc.split(/\r?\n/);

  // Strategy: find the longest contiguous run of lyrics-looking lines.
  let bestStart = -1;
  let bestEnd = -1;
  let bestLen = 0;
  let curStart = -1;
  let curNonBlank = 0;

  for (let i = 0; i <= lines.length; i++) {
    const line = lines[i] ?? '';
    const ok = i < lines.length && looksLikeLyricsLine(line);
    if (ok) {
      if (curStart === -1) curStart = i;
      if (line.trim()) curNonBlank++;
    } else {
      if (curStart !== -1 && curNonBlank > bestLen) {
        bestLen = curNonBlank;
        bestStart = curStart;
        bestEnd = i;
      }
      curStart = -1;
      curNonBlank = 0;
    }
  }

  // Need at least ~6 lines of plausible lyrics to consider it real.
  if (bestLen < 6 || bestStart === -1) return null;
  const slice = lines.slice(bestStart, bestEnd).join('\n').trim();
  // Sanity check: must contain at least 200 chars
  if (slice.length < 200) return null;
  return slice;
}

export async function fetchFromYouTube(youtubeId: string): Promise<LyricsSuggestion | null> {
  if (!process.env.YOUTUBE_API_KEY) return null;
  try {
    const map = await hydrateVideos([youtubeId]);
    const v = map.get(youtubeId);
    if (!v) return null;
    const text = extractLyricsFromDescription(v.description);
    if (!text) return null;
    return {
      source: 'youtube',
      label: `YouTube description (${v.channelTitle || 'video'})`,
      url: `https://www.youtube.com/watch?v=${youtubeId}`,
      text,
      confidence: text.length > 800 ? 'high' : 'medium',
    };
  } catch {
    return null;
  }
}

// ── Google Custom Search fallback ────────────────────────────────────────────
// Returns search-result links (not extracted lyrics) so the admin can open
// the page and copy lyrics manually. Extracting from arbitrary lyrics sites
// is fragile; surfacing the links is the honest middle ground.

export interface LyricsSearchHit {
  title: string;
  link: string;
  snippet: string;
}

export async function searchGoogle(title: string, singers: string): Promise<LyricsSearchHit[]> {
  const key = process.env.GOOGLE_SEARCH_API_KEY || process.env.YOUTUBE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return [];
  const q = `${title} ${singers} gujarati lyrics`.trim();
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', key);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', q);
  url.searchParams.set('num', '5');
  try {
    const r = await fetch(url.toString(), { cache: 'no-store' });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.items ?? []).map((it: any) => ({
      title: it.title ?? '',
      link: it.link ?? '',
      snippet: it.snippet ?? '',
    }));
  } catch {
    return [];
  }
}
