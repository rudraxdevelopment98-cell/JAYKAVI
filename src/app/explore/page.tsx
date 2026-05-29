import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { ExplorePage } from '@/components/sections/explore/ExplorePage';
import { getAllWorks } from '@/lib/sanity/fetch';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse all films, series, shorts, and installations.',
};

export default async function Explore() {
  const works = await getAllWorks().catch(() => []);
  return (
    <PageLayout>
      <ExplorePage works={works} />
    </PageLayout>
  );
}
