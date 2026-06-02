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

  // Clear previous pending candidates before each run so the list stays fresh
  await prisma.harvestCandidate.deleteMany({ where: { status: 'pending' } });

  const run = await prisma.harvestRun.create({
    data: { status: 'running' },
  });

  try {
    // Track source per video ID so own-channel videos bypass the filter
    const trustedIds = new Set<string>(); // from ownChannels — always trust
    const candidateIds: string[] = [];

    // Own channels — these are JAYKAVI's own channels; everything is trusted
    for (const ch of cfg.ownChannels) {
      const channelId = await resolveChannelId(ch);
      if (!channelId) continue;
      const playlist = await getUploadsPlaylist(channelId);
      if (!playlist) continue;
      const ids = await videoIdsFromPlaylist(playlist, cfg.maxResultsPerTerm);
      ids.forEach((id) => {
        trustedIds.add(id);
        candidateIds.push(id);
      });
    }

    // Search channels — third-party channels; videos must pass the filter
    for (const ch of (cfg as any).searchChannels ?? []) {
      const channelId = await resolveChannelId(ch);
      if (!channelId) continue;
      const playlist = await getUploadsPlaylist(channelId);
      if (!playlist) continue;
      const ids = await videoIdsFromPlaylist(playlist, cfg.maxResultsPerTerm);
      candidateIds.push(...ids);
    }

    // Search terms — must pass the filter
    for (const term of cfg.searchTerms) {
      const ids = await videoIdsFromSearch(term, cfg.maxResultsPerTerm);
      candidateIds.push(...ids);
    }

    // Deduplicate
    const unique = [...new Set(candidateIds)];

    // Skip IDs already processed in a previous run
    const existing = await prisma.harvestCandidate.findMany({
      where: { youtubeId: { in: unique } },
      select: { youtubeId: true },
    });
    const existingSet = new Set(existing.map((c) => c.youtubeId));
    const newIds = unique.filter((id) => !existingSet.has(id));

    // Skip IDs already in the songs DB
    const knownSongs = await prisma.song.findMany({
      where: { youtubeId: { in: newIds } },
      select: { youtubeId: true },
    });
    const knownSet = new Set(knownSongs.map((s) => s.youtubeId!));

    // Hydrate video details
    const details = await hydrateVideos(newIds);

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

      // Own-channel videos are always trusted; all others must pass the filter
      const isTrusted = trustedIds.has(id);
      if (!isTrusted && !passesFilter(video, cfg.creditMustContain, cfg.knownSingers)) continue;

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
