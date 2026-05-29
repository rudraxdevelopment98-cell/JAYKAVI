import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { GalleryPage } from '@/components/sections/gallery/GalleryPage';
import { getGalleryItems } from '@/lib/sanity/fetch';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A digital art museum — curated visual works and artistic installations.',
};

export default async function Gallery() {
  const items = await getGalleryItems().catch(() => []);
  return (
    <PageLayout>
      <GalleryPage items={items} />
    </PageLayout>
  );
}
