import { PageLayout } from '@/components/templates/PageLayout';
import { HeroCanvas } from '@/components/sections/home/HeroCanvas';
import { LogoReel } from '@/components/sections/home/LogoReel';
import { FeaturedWork } from '@/components/sections/home/FeaturedWork';
import { PhilosophyStatement } from '@/components/sections/home/PhilosophyStatement';
import { ServicesGrid } from '@/components/sections/home/ServicesGrid';
import { Testimonials } from '@/components/sections/home/Testimonials';
import { NewsletterCTA } from '@/components/sections/home/NewsletterCTA';

export default function HomePage() {
  return (
    <PageLayout>
      <HeroCanvas />
      <LogoReel />
      <FeaturedWork />
      <PhilosophyStatement />
      <ServicesGrid />
      <Testimonials />
      <NewsletterCTA />
    </PageLayout>
  );
}
