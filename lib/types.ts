export type Platform =
  | 'youtube' | 'spotify' | 'amazon_music' | 'apple_music'
  | 'jiosaavn' | 'gaana' | 'wynk' | 'soundcloud' | 'other';

export interface PlatformLink {
  platform: Platform;
  url: string;
  isPrimary?: boolean;
}

export interface Singer {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  year: number | null;
}

export interface Song {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  altTitles: string[];
  lyricist: string;
  performingSingers: string[]; // singer names
  composer: string | null;
  collectionId: string | null;
  language: string;
  genre: string[];
  mood: string[];
  releaseYear: number | null;
  artworkUrl: string;
  lyrics: string;
  lyricsTranslations: { language: string; text: string }[];
  platformLinks: PlatformLink[];
  viewCount: number;
  isTrending: boolean;
  embed: { youtubeId?: string | null; spotifyTrackId?: string | null };
}

export interface JourneyMilestone {
  id: string;
  year: number | null;
  title: string;
  description: string;
  imageUrl: string | null;
  relatedSongIds: string[];
}

export interface Lyricist {
  name: string;
  penName?: string;
  displayName?: string;
  creditVariants?: string[];
  title?: string;
  tagline: string;
  bornPlace?: string;
  basedIn?: string;
  birthDate?: string;
  languages?: string[];
  genres?: string[];
  careerStartYear?: number;
  stats?: { songsWritten?: string; songsPublishedOnStreaming?: string };
  bio: string;
  philosophy?: string;
  awards?: string[];
  press?: string[];
}

export interface SiteData {
  lyricist: Lyricist;
  contact?: {
    public?: {
      useContactForm?: boolean;
      showEmailPublicly?: boolean;
      social?: Record<string, string>;
    };
  };
  singers: Singer[];
  collections: Collection[];
  songs: Song[];
  journey: JourneyMilestone[];
}
