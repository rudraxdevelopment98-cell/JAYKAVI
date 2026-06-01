import { prisma } from './prisma';
import {
  resolveChannelId,
  getUploadsPlaylist,
  videoIdsFromPlaylist,
  videoIdsFromSearch,
  hydrateVideos,
  passesFilter,
  guessSinger,
  cleanTitle,
} from './youtube';

export interface HarvestResult {
  runId: string;
  scanned: number;
  newFound: number;
  duplicates: number;
  error?: string;
}

export async function runHarvest(): Promise<HarvestResult> {
  // Load config (create defaults if not yet seeded).
  const cfg = await prisma.harvestConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ownChannels: [],
      searchTerms: ['JAYKAVI', 'Jayesh Prajapati lyrics', 'જયકવિ', 'જયેશ પ્રજાપતિ'],
      creditMustContain: ['jaykavi', 'jayesh prajapati', 'જયકવિ', 'જયેશ પ્રજાપતિ'],
      knownSingers: [
        'Geeta Rabari', 'Kinjal Dave', 'Birju Barot',
        'Yogita Patel', 'Alpa Patel', 'Jigrra', 'Aishwarya Majmudar',
      ],
      maxResultsPerTerm: 50,
    },
  });

  const run = await prisma.harvestRun.create({
    data: { status: 'running' },
  });

  try {
    // 1) Collect candidate video IDs
    const candidateIds: string[] = [];

    for (const ch of cfg.ownChannels) {
      const channelId = await resolveChannelId(ch);
      if (!channelId) continue;
      const playlist = await getUploadsPlaylist(channelId);
      if (!playlist) continue;
      const ids = await videoIdsFromPlaylist(playlist, cfg.maxResultsPerTerm);
      candidateIds.push(...ids);
    }

    // Search channels — third-party channels; videos are filtered by creditMustContain
    for (const ch of (cfg as any).searchChannels ?? []) {
      const channelId = await resolveChannelId(ch);
      if (!channelId) continue;
      const playlist = await getUploadsPlaylist(channelId);
      if (!playlist) continue;
      const ids = await videoIdsFromPlaylist(playlist, cfg.maxResultsPerTerm);
      candidateIds.push(...ids);
    }

    for (const term of cfg.searchTerms) {
      const ids = await videoIdsFromSearch(term, cfg.maxResultsPerTerm);
      candidateIds.push(...ids);
    }

    // Deduplicate
    const unique = [...new Set(candidateIds)];

    // 2) Check which IDs we've already processed (in any run, approved/rejected/duplicate)
    const existing = await prisma.harvestCandidate.findMany({
      where: { youtubeId: { in: unique } },
      select: { youtubeId: true },
    });
    const existingSet = new Set(existing.map((c) => c.youtubeId));
    const newIds = unique.filter((id) => !existingSet.has(id));

    // 3) Also check against songs already in DB
    const knownSongs = await prisma.song.findMany({
      where: { youtubeId: { in: newIds } },
      select: { youtubeId: true },
    });
    const knownSet = new Set(knownSongs.map((s) => s.youtubeId!));

    // 4) Hydrate video details
    const details = await hydrateVideos(newIds);

    // 5) Filter & store candidates
    let added = 0;
    let duplicates = 0;

    for (const id of newIds) {
      const video = details.get(id);
      if (!video) continue;

      if (knownSet.has(id)) {
        await prisma.harvestCandidate.create({
          data: {
            runId: run.id,
            youtubeId: id,
            rawTitle: video.title,
            cleanTitle: cleanTitle(video.title),
            channelTitle: video.channelTitle,
            description: video.description.slice(0, 2000),
            thumbnailUrl: video.thumbnailUrl,
            viewCount: video.viewCount,
            releaseYear: video.publishedAt ? parseInt(video.publishedAt.slice(0, 4), 10) : null,
            singerGuess: guessSinger(video.title, cfg.knownSingers),
            status: 'duplicate',
          },
        });
        duplicates++;
        continue;
      }

      if (!passesFilter(video, cfg.creditMustContain, cfg.knownSingers)) continue;

      await prisma.harvestCandidate.create({
        data: {
          runId: run.id,
          youtubeId: id,
          rawTitle: video.title,
          cleanTitle: cleanTitle(video.title),
          channelTitle: video.channelTitle,
          description: video.description.slice(0, 2000),
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
          releaseYear: video.publishedAt ? parseInt(video.publishedAt.slice(0, 4), 10) : null,
          singerGuess: guessSinger(video.title, cfg.knownSingers),
          status: 'pending',
        },
      });
      added++;
    }

    await prisma.harvestRun.update({
      where: { id: run.id },
      data: {
        status: 'done',
        finishedAt: new Date(),
        scanned: unique.length,
        newFound: added,
      },
    });

    return { runId: run.id, scanned: unique.length, newFound: added, duplicates };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.harvestRun.update({
      where: { id: run.id },
      data: { status: 'error', finishedAt: new Date(), errorMsg: msg },
    });
    return { runId: run.id, scanned: 0, newFound: 0, duplicates: 0, error: msg };
  }
}
