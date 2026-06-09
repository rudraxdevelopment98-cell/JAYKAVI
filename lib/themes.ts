// Central registry of all available site themes.
// To add a new theme: add an entry here + a CSS block in app/globals.css.

export interface ThemeDefinition {
  key: string;           // value stored in SiteSettings.activeTheme
  label: string;         // shown in admin UI
  description: string;
  darkPreview: string;   // CSS gradient string for dark-mode swatch
  lightPreview: string;  // CSS gradient string for light-mode swatch
}

export const SITE_THEMES: ThemeDefinition[] = [
  {
    key: 'default',
    label: 'Default',
    description: 'The original JAYKAVI cinematic theme. Deep black with teal/purple accents.',
    darkPreview: 'linear-gradient(135deg, #0A0A0B 50%, #22E1E1 100%)',
    lightPreview: 'linear-gradient(135deg, #FAF7F2 50%, #C9A961 100%)',
  },
  {
    key: 'traditional',
    label: 'Traditional',
    description: 'Royal Gujarati devotional aesthetic. Gold & saffron palette inspired by heritage.',
    darkPreview: 'linear-gradient(135deg, #08090B 40%, #D4AF37 80%, #FF9933 100%)',
    lightPreview: 'linear-gradient(135deg, #FDFBF6 40%, #A65D00 80%, #FF9933 100%)',
  },
  {
    key: 'heritage',
    label: 'Heritage Library',
    description: 'A digital heritage library — Gujarati literary archive aesthetic with deep gold, parchment textures and a grand artist banner.',
    darkPreview: 'linear-gradient(135deg, #0F0800 45%, #D4AF37 100%)',
    lightPreview: 'linear-gradient(135deg, #FAF3E7 45%, #B8860B 100%)',
  },
  {
    key: 'garba',
    label: 'Garba Night',
    description: 'Electric festival energy — inspired by Navratri nights. Deep midnight indigo sky with neon saffron, hot-pink & turquoise accents.',
    darkPreview: 'linear-gradient(135deg, #05041A 30%, #FF5F1F 60%, #E91E8C 80%, #A259FF 100%)',
    lightPreview: 'linear-gradient(135deg, #1A0A2E 30%, #FF5F1F 60%, #E91E8C 80%, #A259FF 100%)',
  },
];
