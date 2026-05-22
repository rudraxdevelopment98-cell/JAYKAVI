import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // dark palette
        matte: '#0A0A0B',
        graphite: '#1C1C22',
        purple: '#5B2A86',
        electric: '#2D6BFF',
        crimson: '#D7263D',
        cyan: '#22E1E1',
        // light palette
        warm: '#FAF7F2',
        sand: '#EDE3D4',
        gold: '#C9A961',
        cream: '#F5EFE6',
        charcoal: '#2B2B2B',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
