import { createClient } from '@sanity/client';
import { createImageUrlBuilder as imageUrlBuilder } from '@sanity/image-url';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export function urlForImage(source: SanityImageSource, width = 800, quality = 80) {
  return builder
    .image(source)
    .width(width)
    .quality(quality)
    .auto('format')
    .url();
}
