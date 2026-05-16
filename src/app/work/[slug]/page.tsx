import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { WorkDetailPage } from '@/components/sections/work/WorkDetailPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

export default async function WorkDetail({ params }: Props) {
  const { slug } = await params;
  return (
    <PageLayout>
      <WorkDetailPage slug={slug} />
    </PageLayout>
  );
}
