import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/templates/PageLayout';
import { WorkDetailPage } from '@/components/sections/work/WorkDetailPage';
import { getWorkBySlug, getWorkSlugs } from '@/lib/sanity/fetch';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getWorkSlugs().catch(() => []);
  return slugs.map(({ slug }) => ({ slug: slug.current }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug).catch(() => null);
  if (!work) return { title: 'Work Not Found' };
  return {
    title: work.seo?.title ?? work.title,
    description: work.seo?.description ?? work.synopsisShort,
  };
}

export default async function WorkDetail({ params }: Props) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug).catch(() => null);

  // If Sanity is configured and slug doesn't exist, 404
  if (work === null && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    notFound();
  }

  return (
    <PageLayout>
      <WorkDetailPage slug={slug} work={work ?? undefined} />
    </PageLayout>
  );
}
