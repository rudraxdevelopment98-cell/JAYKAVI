import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SongForm from '../SongForm';
import DeleteButton from '../../_components/DeleteButton';
import { updateSong, deleteSong } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditSongPage({ params }: { params: { id: string } }) {
  const [song, singers, collections] = await Promise.all([
    prisma.song.findUnique({
      where: { id: params.id },
      include: {
        singers: true,
        platformLinks: true,
        lyricsTranslations: true,
      },
    }),
    prisma.singer.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true } }),
  ]);

  if (!song) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/songs" className="text-sm text-neutral-400 hover:text-white">
          ← Songs
        </Link>
        <h1 className="text-3xl font-semibold truncate">{song.title}</h1>
        <Link
          href={`/songs/${song.slug}`}
          target="_blank"
          className="text-xs text-neutral-500 hover:text-amber-400 ml-auto"
        >
          View on site ↗
        </Link>
      </div>

      <SongForm
        initial={{
          title: song.title,
          slug: song.slug,
          altTitles: song.altTitles,
          lyricistCredit: song.lyricistCredit,
          composer: song.composer,
          collectionId: song.collectionId,
          language: song.language,
          genre: song.genre,
          mood: song.mood,
          releaseYear: song.releaseYear,
          artworkUrl: song.artworkUrl,
          lyrics: song.lyrics,
          viewCount: song.viewCount,
          isTrending: song.isTrending,
          youtubeId: song.youtubeId,
          spotifyTrackId: song.spotifyTrackId,
          singerIds: song.singers.map((s) => s.singerId),
          platformLinks: song.platformLinks.map((l) => ({
            platform: l.platform,
            url: l.url,
            isPrimary: l.isPrimary,
          })),
          lyricsTranslations: song.lyricsTranslations.map((t) => ({
            language: t.language,
            text: t.text,
          })),
        }}
        action={updateSong.bind(null, song.id)}
        singers={singers}
        collections={collections}
        submitLabel="Save changes"
      />

      <div className="mt-8 pt-6 border-t border-neutral-800">
        <DeleteButton
          onConfirm={async () => {
            'use server';
            await deleteSong(song.id);
          }}
          label="Delete song"
          confirmText={`Delete "${song.title}" and all its links / translations?`}
        />
      </div>
    </div>
  );
}
