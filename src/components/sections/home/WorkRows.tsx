import { ContentRow } from '@/components/organisms/Carousel';
import { WorkCard } from '@/components/molecules/WorkCard/WorkCard';
import type { Work } from '@/types/content';

interface WorkRowsProps {
  films: Work[];
  series: Work[];
  shorts: Work[];
}

export function WorkRows({ films, series, shorts }: WorkRowsProps) {
  if (!films.length && !series.length && !shorts.length) return null;

  return (
    <section className="py-8 space-y-2">
      {films.length > 0 && (
        <ContentRow
          title="Films"
          subtitle="Feature-length cinematic works"
          items={films}
          renderCard={(work) => <WorkCard work={work} />}
          viewAllHref="/explore?category=film"
          cardWidth={220}
        />
      )}
      {series.length > 0 && (
        <ContentRow
          title="Series"
          subtitle="Long-form narrative journeys"
          items={series}
          renderCard={(work) => <WorkCard work={work} />}
          viewAllHref="/explore?category=series"
          cardWidth={220}
        />
      )}
      {shorts.length > 0 && (
        <ContentRow
          title="Shorts"
          subtitle="Compact cinematic experiences"
          items={shorts}
          renderCard={(work) => <WorkCard work={work} />}
          viewAllHref="/explore?category=short"
          cardWidth={180}
        />
      )}
    </section>
  );
}
