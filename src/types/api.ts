import type { ContentCategory, Genre } from './content';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasNextPage: boolean;
}

export interface APIError {
  message: string;
  code: string;
  status: number;
}

export interface SearchResult {
  id: string;
  type: 'work' | 'event' | 'gallery' | 'blog';
  title: string;
  description: string;
  slug: string;
  image?: string;
  relevanceScore: number;
}

export interface SearchFilters {
  query: string;
  types?: SearchResult['type'][];
  category?: ContentCategory;
  genre?: Genre;
  yearFrom?: number;
  yearTo?: number;
}

export interface ContactFormData {
  inquiryType: 'collaboration' | 'press' | 'booking' | 'general';
  name: string;
  email: string;
  organization?: string;
  message: string;
  projectBrief?: string;
}

export interface NewsletterFormData {
  email: string;
  firstName?: string;
  interests?: ContentCategory[];
}

export interface EventRegistrationData {
  eventId: string;
  name: string;
  email: string;
  attendeeCount: number;
  dietaryRequirements?: string;
}
