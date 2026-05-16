export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  resolvedTheme: Theme;
}

export interface VideoQuality {
  label: string;
  src: string;
}

export interface CaptionTrack {
  label: string;
  srcLang: string;
  src: string;
  default?: boolean;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  quality: string;
  buffered: number;
}

export type ReducedMotion = boolean;
