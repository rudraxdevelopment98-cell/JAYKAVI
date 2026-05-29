import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { getSearchIndex } from '@/lib/sanity/fetch';

// Cache index for 10 minutes
let cachedIndex: Fuse<Record<string, unknown>> | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

async function getIndex() {
  if (cachedIndex && Date.now() - cacheTime < CACHE_TTL) return cachedIndex;

  const raw = await getSearchIndex();
  const items = [
    ...raw.works,
    ...raw.events,
    ...raw.gallery,
  ];

  cachedIndex = new Fuse(items, {
    keys: ['title', 'description', 'category', 'genres'],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  });
  cacheTime = Date.now();
  return cachedIndex;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const index = await getIndex();
    const raw = index.search(q, { limit: 12 });
    const results = raw.map((r) => ({
      ...r.item,
      relevanceScore: 1 - (r.score ?? 0),
    }));
    return NextResponse.json({ results });
  } catch (err) {
    console.error('[search API]', err);
    return NextResponse.json({ results: [] });
  }
}
