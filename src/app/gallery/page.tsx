import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { GalleryPage } from '@/components/sections/gallery/GalleryPage';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A digital art museum — curated visual works and artistic installations.',
};

export default function Gallery() {
  return (
    <PageLayout>
      <GalleryPage />
    </PageLayout>
  );
}
