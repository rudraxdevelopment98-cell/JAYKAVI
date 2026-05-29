import { sanityClient } from './client';
import {
  getFeaturedWorksQuery,
  getAllWorksQuery,
  getWorkBySlugQuery,
  getWorkSlugsPaths,
  getUpcomingEventsQuery,
  getPastEventsQuery,
  getEventBySlugQuery,
  getGalleryItemsQuery,
  getFeaturedGalleryQuery,
  getSiteConfigQuery,
  getSearchIndexQuery,
} from './queries';
import type { Work, Event, GalleryItem, SiteConfig } from '@/types/content';

// ─── Works ───────────────────────────────────────────────────────────────────

export async function getFeaturedWorks(): Promise<Work[]> {
  return sanityClient.fetch(getFeaturedWorksQuery, {}, { next: { revalidate: 3600 } });
}

export async function getAllWorks(): Promise<Work[]> {
  return sanityClient.fetch(getAllWorksQuery, {}, { next: { revalidate: 3600 } });
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  return sanityClient.fetch(getWorkBySlugQuery, { slug }, { next: { revalidate: 3600 } });
}

export async function getWorkSlugs(): Promise<{ slug: { current: string } }[]> {
  return sanityClient.fetch(getWorkSlugsPaths, {}, { next: { revalidate: 86400 } });
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getUpcomingEvents(): Promise<Event[]> {
  return sanityClient.fetch(getUpcomingEventsQuery, {}, { next: { revalidate: 3600 } });
}

export async function getPastEvents(): Promise<Event[]> {
  return sanityClient.fetch(getPastEventsQuery, {}, { next: { revalidate: 86400 } });
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  return sanityClient.fetch(getEventBySlugQuery, { slug }, { next: { revalidate: 3600 } });
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return sanityClient.fetch(getGalleryItemsQuery, {}, { next: { revalidate: 3600 } });
}

export async function getFeaturedGallery(): Promise<GalleryItem[]> {
  return sanityClient.fetch(getFeaturedGalleryQuery, {}, { next: { revalidate: 3600 } });
}

// ─── Site config ─────────────────────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig | null> {
  return sanityClient.fetch(getSiteConfigQuery, {}, { next: { revalidate: 86400 } });
}

// ─── Search index ─────────────────────────────────────────────────────────────

export async function getSearchIndex() {
  return sanityClient.fetch(getSearchIndexQuery, {}, { next: { revalidate: 3600 } });
}
