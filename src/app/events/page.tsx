import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { EventsPage } from '@/components/sections/events/EventsPage';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Premieres, screenings, festivals, and live cinematic experiences.',
};

export default function Events() {
  return (
    <PageLayout>
      <EventsPage />
    </PageLayout>
  );
}
