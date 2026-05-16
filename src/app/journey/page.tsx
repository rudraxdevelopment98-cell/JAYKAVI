import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { JourneyPage } from '@/components/sections/journey/JourneyPage';

export const metadata: Metadata = {
  title: 'Our Journey',
  description: 'The story behind JAYKAVI — from origins to the future of cinematic storytelling.',
};

export default function Journey() {
  return (
    <PageLayout>
      <JourneyPage />
    </PageLayout>
  );
}
