import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { EventsPage } from '@/components/sections/events/EventsPage';
import { getUpcomingEvents, getPastEvents } from '@/lib/sanity/fetch';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Events',
  description: 'Premieres, screenings, festivals, and live cinematic experiences.',
};

export default async function Events() {
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents().catch(() => []),
    getPastEvents().catch(() => []),
  ]);
  return (
    <PageLayout>
      <EventsPage upcoming={upcoming} past={past} />
    </PageLayout>
  );
}
