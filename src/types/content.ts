export type ContentCategory =
  | 'film'
  | 'series'
  | 'short'
  | 'event'
  | 'installation'
  | 'art';

export type Genre =
  | 'drama'
  | 'documentary'
  | 'thriller'
  | 'romance'
  | 'sci-fi'
  | 'animation'
  | 'experimental'
  | 'biography';

export interface SanityImageAsset {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
  blurDataURL?: string;
}

export interface SanityVideoAsset {
  _type: 'cloudinary.asset' | 'file';
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface CastMember {
  _key: string;
  name: string;
  role: string;
  photo?: SanityImageAsset;
  biography?: string;
}

export interface CrewMember {
  _key: string;
  name: string;
  title: string;
  photo?: SanityImageAsset;
}

export interface WorkAward {
  _key: string;
  festivalName: string;
  category: string;
  year: number;
  status: 'winner' | 'nominee';
  logo?: SanityImageAsset;
}

export interface StreamingLink {
  _key: string;
  platform: string;
  url: string;
  logo?: SanityImageAsset;
  availableRegions?: string[];
}

export interface Work {
  _id: string;
  _type: 'work';
  slug: { current: string };
  title: string;
  subtitle?: string;
  tagline?: string;
  category: ContentCategory;
  genres: Genre[];
  releaseYear: number;
  duration?: number;
  rating?: number;
  synopsis: string;
  synopsisShort: string;
  heroImage: SanityImageAsset;
  heroVideo?: SanityVideoAsset;
  trailer?: SanityVideoAsset;
  galleryImages: SanityImageAsset[];
  cast: CastMember[];
  crew: CrewMember[];
  awards: WorkAward[];
  tags: string[];
  streamingPlatforms: StreamingLink[];
  isNew: boolean;
  isFeatured: boolean;
  publishedAt: string;
  seo: SEOMeta;
}

export interface EventLocation {
  venueName: string;
  address?: string;
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  isVirtual?: boolean;
  virtualUrl?: string;
}

export interface Event {
  _id: string;
  _type: 'event';
  slug: { current: string };
  title: string;
  subtitle?: string;
  type: 'premiere' | 'screening' | 'installation' | 'festival' | 'workshop' | 'live';
  startDate: string;
  endDate?: string;
  location: EventLocation;
  heroImage: SanityImageAsset;
  ambientVideo?: SanityVideoAsset;
  description: string;
  ticketUrl?: string;
  isFeatured: boolean;
  isPast: boolean;
  relatedWork?: { _ref: string };
  gallery: SanityImageAsset[];
  seo: SEOMeta;
}

export interface GalleryItem {
  _id: string;
  _type: 'galleryItem';
  slug: { current: string };
  title: string;
  artistStatement?: string;
  medium: string;
  year: number;
  dimensions?: string;
  image: SanityImageAsset;
  collection?: { _ref: string };
  tags: string[];
  isFeatured: boolean;
}

export interface Collection {
  _id: string;
  _type: 'collection';
  slug: { current: string };
  title: string;
  description: string;
  coverImage: SanityImageAsset;
  items: GalleryItem[];
  curatedBy?: string;
}

export interface Author {
  name: string;
  avatar?: SanityImageAsset;
  bio?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PortableTextBlock = any;

export interface BlogPost {
  _id: string;
  _type: 'blogPost';
  slug: { current: string };
  title: string;
  subtitle?: string;
  excerpt: string;
  body: PortableTextBlock[];
  author: Author;
  heroImage: SanityImageAsset;
  publishedAt: string;
  updatedAt?: string;
  categories: string[];
  readTimeMinutes: number;
  seo: SEOMeta;
}

export interface SocialLink {
  _key: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'vimeo' | 'imdb' | 'website';
  url: string;
}

export interface TeamMember {
  _id: string;
  _type: 'teamMember';
  name: string;
  title: string;
  bio: string;
  photo: SanityImageAsset;
  quote?: string;
  socialLinks?: SocialLink[];
  order: number;
}

export interface Testimonial {
  _id: string;
  quote: string;
  attribution: string;
  publication: string;
  publicationLogo?: SanityImageAsset;
  relatedWork?: { _ref: string };
}

export interface SEOMeta {
  title: string;
  description: string;
  ogImage?: SanityImageAsset;
  keywords?: string[];
  noIndex?: boolean;
}

export interface SiteConfig {
  _id: 'siteConfig';
  siteName: string;
  tagline: string;
  logo: SanityImageAsset;
  logoDark?: SanityImageAsset;
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone?: string;
  defaultSEO: SEOMeta;
  announcementBanner?: { text: string; link?: string; isActive: boolean };
}
