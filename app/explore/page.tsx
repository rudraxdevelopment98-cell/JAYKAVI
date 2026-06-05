import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getActiveTheme } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';
import ExploreTabs from './ExploreTabs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collections & Singers — JAYKAVI',
  description: 'Browse every collection and singer in the JAYKAVI catalogue.',
  alternates: { canonical: absoluteUrl('/explore') },
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const rawTab = searchParams.tab;
  const initialTab = rawTab === 'singers' ? 'singers' : 'collections';

  const [activeTheme, collectionsRaw, singersRaw] = await Promise.all([
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
      collections={collections}
      singers={singers}
      traditional={activeTheme === 'traditional'}
      initialTab={initialTab}
    />
  );
}
