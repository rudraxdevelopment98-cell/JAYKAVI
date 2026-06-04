import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { getAllSongs } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getPublishedPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/journey`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/songs`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/lyrics`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const [songs, posts] = await Promise.all([getAllSongs(), getPublishedPosts()]);

  const songPages: MetadataRoute.Sitemap = songs.map((s) => ({
    url: `${base}/songs/${s.slug}`,
    lastModified: (s as any).updatedAt ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...songPages, ...postPages];
}
