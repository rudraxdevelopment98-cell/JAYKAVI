import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface SearchHit {
  type: 'song' | 'singer' | 'collection' | 'post';
  title: string;
  subtitle?: string | null;
  href: string;
  image?: string | null;
}

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim();
  if (q.length < 1) return NextResponse.json({ hits: [] });

  const like = { contains: q, mode: 'insensitive' as const };

  try {
    const [songs, singers, collections, posts] = await Promise.all([
      prisma.song.findMany({
        where: { OR: [{ title: like }, { subtitle: like }, { altTitles: { has: q } }] },
        select: { title: true, subtitle: true, slug: true, artworkUrl: true },
        orderBy: [{ isTrending: 'desc' }, { releaseYear: 'desc' }],
        take: 6,
      }),
      prisma.singer.findMany({
        where: { name: like },
        select: { id: true, name: true, photoUrl: true },
        take: 4,
      }),
      prisma.collection.findMany({
        where: { OR: [{ title: like }, { description: like }] },
        select: { title: true, slug: true, coverUrl: true },
        take: 4,
      }),
      prisma.post.findMany({
        where: { published: true, OR: [{ title: like }, { excerpt: like }] },
        select: { title: true, slug: true, coverUrl: true },
        take: 4,
      }),
    ]);

    const hits: SearchHit[] = [
      ...songs.map((s) => ({
        type: 'song' as const,
        title: s.title,
        subtitle: s.subtitle,
        href: `/songs/${s.slug}`,
        image: s.artworkUrl,
      })),
      ...singers.map((s) => ({
        type: 'singer' as const,
        title: s.name,
        href: `/singers/${s.id}`,
        image: s.photoUrl,
      })),
      ...collections.map((c) => ({
        type: 'collection' as const,
        title: c.title,
        href: `/collections/${c.slug}`,
        image: c.coverUrl,
      })),
      ...posts.map((p) => ({
        type: 'post' as const,
        title: p.title,
        href: `/blog/${p.slug}`,
        image: p.coverUrl,
      })),
    ];

    return NextResponse.json({ hits });
  } catch {
    return NextResponse.json({ hits: [] });
  }
}
