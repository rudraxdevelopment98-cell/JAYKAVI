import { PrismaClient } from '@prisma/client';
import data from '../data/songwriter_data.json';

const prisma = new PrismaClient();

type RawJson = typeof data;

async function main() {
  console.log('Seeding database from data/songwriter_data.json…');

  // --- LYRICIST (singleton) ---
  const ly = (data as RawJson).lyricist;
  await prisma.lyricist.upsert({
    where: { id: 1 },
    update: {
      name: ly.name,
      penName: ly.penName ?? null,
      displayName: ly.displayName ?? null,
      creditVariants: ly.creditVariants ?? [],
      title: ly.title ?? null,
      tagline: ly.tagline,
      bornPlace: ly.bornPlace ?? null,
      basedIn: ly.basedIn ?? null,
      birthDate: ly.birthDate ?? null,
      languages: ly.languages ?? [],
      genres: ly.genres ?? [],
      careerStartYear: ly.careerStartYear ?? null,
      songsWritten: ly.stats?.songsWritten ?? null,
      songsPublishedOnStreaming: ly.stats?.songsPublishedOnStreaming ?? null,
      bio: ly.bio,
      philosophy: ly.philosophy ?? null,
      awards: ly.awards ?? [],
      press: (ly.press ?? []) as string[],
    },
    create: {
      id: 1,
      name: ly.name,
      penName: ly.penName ?? null,
      displayName: ly.displayName ?? null,
      creditVariants: ly.creditVariants ?? [],
      title: ly.title ?? null,
      tagline: ly.tagline,
      bornPlace: ly.bornPlace ?? null,
      basedIn: ly.basedIn ?? null,
      birthDate: ly.birthDate ?? null,
      languages: ly.languages ?? [],
      genres: ly.genres ?? [],
      careerStartYear: ly.careerStartYear ?? null,
      songsWritten: ly.stats?.songsWritten ?? null,
      songsPublishedOnStreaming: ly.stats?.songsPublishedOnStreaming ?? null,
      bio: ly.bio,
      philosophy: ly.philosophy ?? null,
      awards: ly.awards ?? [],
      press: (ly.press ?? []) as string[],
    },
  });
  console.log('✓ Lyricist profile');

  // --- CONTACT (singleton) ---
  const c = (data as RawJson).contact;
  await prisma.contact.upsert({
    where: { id: 1 },
    update: {
      useContactForm: c?.public?.useContactForm ?? true,
      showEmailPublicly: c?.public?.showEmailPublicly ?? false,
      instagram: c?.public?.social?.instagram ?? null,
      instagramSecondary: c?.public?.social?.instagramSecondary ?? null,
      youtube: c?.public?.social?.youtube ?? null,
      spotify: c?.public?.social?.spotify ?? null,
      jiosaavn: c?.public?.social?.jiosaavn ?? null,
      privateEmail: c?.private?.email ?? null,
      privatePhone: c?.private?.phone ?? null,
      privateNote: c?.private?._note ?? null,
    },
    create: {
      id: 1,
      useContactForm: c?.public?.useContactForm ?? true,
      showEmailPublicly: c?.public?.showEmailPublicly ?? false,
      instagram: c?.public?.social?.instagram ?? null,
      instagramSecondary: c?.public?.social?.instagramSecondary ?? null,
      youtube: c?.public?.social?.youtube ?? null,
      spotify: c?.public?.social?.spotify ?? null,
      jiosaavn: c?.public?.social?.jiosaavn ?? null,
      privateEmail: c?.private?.email ?? null,
      privatePhone: c?.private?.phone ?? null,
      privateNote: c?.private?._note ?? null,
    },
  });
  console.log('✓ Contact');

  // --- SINGERS ---
  const singerMap = new Map<string, string>(); // legacyId -> id
  for (const [i, s] of (data.singers ?? []).entries()) {
    const row = await prisma.singer.upsert({
      where: { legacyId: s.id },
      update: { name: s.name, photoUrl: s.photoUrl, bio: s.bio, sortOrder: i },
      create: {
        legacyId: s.id,
        name: s.name,
        photoUrl: s.photoUrl,
        bio: s.bio,
        sortOrder: i,
      },
    });
    singerMap.set(s.id, row.id);
    singerMap.set(s.name, row.id);
  }
  console.log(`✓ ${singerMap.size > 0 ? data.singers.length : 0} singers`);

  // --- COLLECTIONS ---
  const collectionMap = new Map<string, string>();
  for (const c of (data.collections ?? []) as any[]) {
    const row = await prisma.collection.upsert({
      where: { legacyId: c.id },
      update: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        coverUrl: c.coverUrl ?? null,
        year: c.year ?? null,
      },
      create: {
        legacyId: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        coverUrl: c.coverUrl ?? null,
        year: c.year ?? null,
      },
    });
    collectionMap.set(c.id, row.id);
  }
  console.log(`✓ ${data.collections?.length ?? 0} collections`);

  // --- SONGS ---
  for (const s of data.songs ?? []) {
    const song = await prisma.song.upsert({
      where: { legacyId: s.id },
      update: {
        slug: s.slug,
        title: s.title,
        altTitles: s.altTitles ?? [],
        lyricistCredit: s.lyricist,
        composer: s.composer ?? null,
        collectionId: s.collectionId ? collectionMap.get(s.collectionId) ?? null : null,
        language: s.language,
        genre: s.genre ?? [],
        mood: s.mood ?? [],
        releaseYear: s.releaseYear ?? null,
        artworkUrl: s.artworkUrl || null,
        lyrics: s.lyrics ?? '',
        viewCount: s.viewCount ?? 0,
        isTrending: s.isTrending ?? false,
        youtubeId: s.embed?.youtubeId ?? null,
        spotifyTrackId: s.embed?.spotifyTrackId ?? null,
      },
      create: {
        legacyId: s.id,
        slug: s.slug,
        title: s.title,
        altTitles: s.altTitles ?? [],
        lyricistCredit: s.lyricist,
        composer: s.composer ?? null,
        collectionId: s.collectionId ? collectionMap.get(s.collectionId) ?? null : null,
        language: s.language,
        genre: s.genre ?? [],
        mood: s.mood ?? [],
        releaseYear: s.releaseYear ?? null,
        artworkUrl: s.artworkUrl || null,
        lyrics: s.lyrics ?? '',
        viewCount: s.viewCount ?? 0,
        isTrending: s.isTrending ?? false,
        youtubeId: s.embed?.youtubeId ?? null,
        spotifyTrackId: s.embed?.spotifyTrackId ?? null,
      },
    });

    // Replace song's singer associations
    await prisma.songSinger.deleteMany({ where: { songId: song.id } });
    for (const name of s.performingSingers ?? []) {
      const sid = singerMap.get(name);
      if (sid) {
        await prisma.songSinger.create({ data: { songId: song.id, singerId: sid } });
      }
    }

    // Replace platform links
    await prisma.platformLink.deleteMany({ where: { songId: song.id } });
    const links = (s.platformLinks ?? []) as Array<{
      platform: string;
      url: string;
      isPrimary?: boolean;
    }>;
    for (const link of links) {
      await prisma.platformLink.create({
        data: {
          songId: song.id,
          platform: link.platform,
          url: link.url,
          isPrimary: link.isPrimary ?? false,
        },
      });
    }

    // Replace lyrics translations
    await prisma.lyricsTranslation.deleteMany({ where: { songId: song.id } });
    const translations = (s.lyricsTranslations ?? []) as Array<{
      language: string;
      text: string;
    }>;
    for (const t of translations) {
      await prisma.lyricsTranslation.create({
        data: { songId: song.id, language: t.language, text: t.text },
      });
    }
  }
  console.log(`✓ ${data.songs?.length ?? 0} songs`);

  // --- JOURNEY ---
  for (const [i, m] of (data.journey ?? []).entries()) {
    await prisma.journeyMilestone.upsert({
      where: { legacyId: m.id },
      update: {
        year: m.year ?? null,
        title: m.title,
        description: m.description,
        imageUrl: m.imageUrl ?? null,
        relatedSongIds: m.relatedSongIds ?? [],
        sortOrder: i,
      },
      create: {
        legacyId: m.id,
        year: m.year ?? null,
        title: m.title,
        description: m.description,
        imageUrl: m.imageUrl ?? null,
        relatedSongIds: m.relatedSongIds ?? [],
        sortOrder: i,
      },
    });
  }
  console.log(`✓ ${data.journey?.length ?? 0} journey milestones`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
