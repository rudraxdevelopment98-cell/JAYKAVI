import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getAllSongs, getFacets, getActiveTheme } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';
import ExploreTabs from './ExploreTabs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore — Songs, Collections & Singers',
  description: 'Browse every song, collection and singer in the JAYKAVI catalogue — all in one place.',
  alternates: { canonical: absoluteUrl('/explore') },
};

export default async function ExplorePage() {
  const [songs, facets, activeTheme, collectionsRaw, singersRaw] = await Promise.all([
    getAllSongs(),
    getFacets(),
    getActiveTheme(),
    prisma.collection
      .findMany({
        orderBy: [{ year: 'desc' }, { title: 'asc' }],
        include: { _count: { select: { songs: true } } },
      })
      .catch(() => []),
    prisma.singer
      .findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { songs: true } } },
      })
      .catch(() => []),
  ]);

  const collections = collectionsRaw.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description ?? '',
    coverUrl: c.coverUrl ?? '',
    year: c.year ?? null,
    songCount: c._count.songs,
  }));

  const singers = singersRaw
    .filter((s) => s._count.songs > 0)
    .map((s) => ({
      id: s.id,
      param: s.legacyId ?? s.id,
      name: s.name,
      photoUrl: s.photoUrl ?? '',
      songCount: s._count.songs,
    }));

  return (
    <ExploreTabs
      songs={songs}
      facets={facets}
      collections={collections}
      singers={singers}
      traditional={activeTheme === 'traditional'}
    />
  );
}
