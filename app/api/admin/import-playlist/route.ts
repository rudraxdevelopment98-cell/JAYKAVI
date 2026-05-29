import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { videoIdsFromPlaylist, hydrateVideos } from '@/lib/youtube';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PLAYLIST_CAP = 200;

function cleanTitle(raw: string): string {
  return raw
    .replace(/#\S+/g, '')
    .split('|')[0]
    .replace(/\s+/g, ' ')
    .trim();
}

function extractYear(publishedAt: string): number | null {
  const m = String(publishedAt ?? '').match(/^(\d{4})/);
  return m ? parseInt(m[1]) : null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(session as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const playlistId = typeof body.playlistId === 'string' ? body.playlistId.trim() : '';
  if (!playlistId) {
    return NextResponse.json({ error: 'playlistId is required' }, { status: 400 });
  }

  // Fetch video IDs from playlist
  let videoIds: string[];
  try {
    videoIds = await videoIdsFromPlaylist(playlistId, PLAYLIST_CAP);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to fetch playlist: ${msg}` }, { status: 502 });
  }

  if (videoIds.length === 0) {
    return NextResponse.json({ error: 'No videos found in playlist' }, { status: 400 });
  }

  // Hydrate with full video metadata
  let videoMap: Awaited<ReturnType<typeof hydrateVideos>>;
  try {
    videoMap = await hydrateVideos(videoIds);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to hydrate videos: ${msg}` }, { status: 502 });
  }

  // Create a HarvestRun record
  let run;
  try {
    run = await prisma.harvestRun.create({
      data: {
        status: 'done',
        scanned: videoIds.length,
        newFound: videoMap.size,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database not connected. Set up DATABASE_URL first.' }, { status: 503 });
  }

  let created = 0;
  let skipped = 0;

  for (const [youtubeId, video] of videoMap.entries()) {
    const title = cleanTitle(video.title);
    const year = extractYear(video.publishedAt);

    try {
      await prisma.harvestCandidate.upsert({
        where: { youtubeId },
        create: {
          runId: run.id,
          youtubeId,
          cleanTitle: title,
          rawTitle: video.title,
          channelTitle: video.channelTitle || null,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl || null,
          viewCount: video.viewCount ?? null,
          releaseYear: year,
          status: 'pending',
        },
        update: {},
      });
      created++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ created, skipped, runId: run.id });
}
