import { PageLayout } from '@/components/templates/PageLayout';
import { HeroCanvas } from '@/components/sections/home/HeroCanvas';
import { LogoReel } from '@/components/sections/home/LogoReel';
import { FeaturedWork } from '@/components/sections/home/FeaturedWork';
import { PhilosophyStatement } from '@/components/sections/home/PhilosophyStatement';
import { ServicesGrid } from '@/components/sections/home/ServicesGrid';
import { Testimonials } from '@/components/sections/home/Testimonials';
import { NewsletterCTA } from '@/components/sections/home/NewsletterCTA';
import { WorkRows } from '@/components/sections/home/WorkRows';
import { getFeaturedWorks, getAllWorks } from '@/lib/sanity/fetch';

export const revalidate = 3600;

export default async function HomePage() {
  // Fetch in parallel — silently falls back to empty arrays if Sanity not configured
  const [featured, all] = await Promise.allSettled([
    getFeaturedWorks(),
    getAllWorks(),
  ]);

  const featuredWorks = featured.status === 'fulfilled' ? featured.value : [];
  const allWorks = all.status === 'fulfilled' ? all.value : [];

  const films = allWorks.filter((w) => w.category === 'film');
  const series = allWorks.filter((w) => w.category === 'series');
  const shorts = allWorks.filter((w) => w.category === 'short');

  return (
    <PageLayout>
      <HeroCanvas />
      <LogoReel />
      <FeaturedWork works={featuredWorks} />
      <WorkRows films={films} series={series} shorts={shorts} />
      <PhilosophyStatement />
      <ServicesGrid />
      <Testimonials />
      <NewsletterCTA />
    </PageLayout>
  );
}
