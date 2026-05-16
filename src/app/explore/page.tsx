import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { ExplorePage } from '@/components/sections/explore/ExplorePage';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse all films, series, shorts, and installations.',
};

export default function Explore() {
  return (
    <PageLayout>
      <ExplorePage />
    </PageLayout>
  );
}
