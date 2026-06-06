import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { videoIdsFromPlaylist, hydrateVideos, guessSinger, cleanTitle } from '@/lib/youtube';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
    videoIds = await videoIdsFromPlaylist(playlistId, 200);
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

  const allIds = [...videoMap.keys()];

  // Fetch what already exists so we can skip correctly
  let existingSongIds: Set<string>;
  let existingCandidateIds: Set<string>;
  let singerNames: string[];
  try {
    const [songs, candidates, singers] = await Promise.all([
      prisma.song.findMany({
        where: { youtubeId: { in: allIds } },
        select: { youtubeId: true },
      }),
      prisma.harvestCandidate.findMany({
        where: { youtubeId: { in: allIds } },
        select: { youtubeId: true },
      }),
      prisma.singer.findMany({ select: { name: true } }),
    ]);
    existingSongIds      = new Set(songs.map((s) => s.youtubeId).filter(Boolean) as string[]);
    existingCandidateIds = new Set(candidates.map((c) => c.youtubeId));
    singerNames          = singers.map((s) => s.name);
  } catch {
    return NextResponse.json({ error: 'Database not connected. Set up DATABASE_URL first.' }, { status: 503 });
  }

  // Only videos that are genuinely new (not already a song AND not already a candidate)
  const newEntries = [...videoMap.entries()].filter(
    ([id]) => !existingSongIds.has(id) && !existingCandidateIds.has(id),
  );

  const alreadySong      = existingSongIds.size;
  const alreadyCandidate = existingCandidateIds.size;

  if (newEntries.length === 0) {
    return NextResponse.json({
      created: 0,
      skipped: videoMap.size,
      alreadySong,
      alreadyCandidate,
      message: `All ${videoMap.size} videos already exist — ${alreadySong} in Songs, ${alreadyCandidate} in queue.`,
    });
  }

  // Create a HarvestRun record
  let run;
  try {
    run = await prisma.harvestRun.create({
      data: {
        status: 'done',
        scanned: videoIds.length,
        newFound: newEntries.length,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database error creating run.' }, { status: 503 });
  }

  // Bulk-insert new candidates
  let created = 0;
  try {
    const result = await prisma.harvestCandidate.createMany({
      data: newEntries.map(([youtubeId, video]) => ({
        runId:        run.id,
        youtubeId,
        rawTitle:     video.title,
        cleanTitle:   cleanTitle(video.title),
        channelTitle: video.channelTitle || null,
        description:  video.description  ?? '',
        thumbnailUrl: video.thumbnailUrl  || null,
        viewCount:    video.viewCount     ?? null,
        releaseYear:  extractYear(video.publishedAt),
        singerGuess:  guessSinger(video.title, singerNames) || null,
        status:       'pending',
      })),
      skipDuplicates: true,
    });
    created = result.count;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to save candidates: ${msg}` }, { status: 500 });
  }

  const skipped = videoMap.size - created;

  return NextResponse.json({
    created,
    skipped,
    alreadySong,
    alreadyCandidate,
    runId: run.id,
  });
}
