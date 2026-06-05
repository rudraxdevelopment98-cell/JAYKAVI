'use client';

import { useEffect } from 'react';

/**
 * Tells the navbar how bright the hero behind it is, so the floating
 * (un-scrolled) nav links can flip between light and dark text on the home page.
 *
 *   mode="dark"  → hero is dark (e.g. cinematic / heavily-overlaid)  → light nav text
 *   mode="light" → hero is light                                     → dark nav text
 *   mode="theme" → follows the current light/dark mode (hero fades to page bg)
 *   mode="image" → samples the given image's top strip brightness (CORS permitting)
 *
 * Sets `data-hero-luma="dark|light"` on <html>; cleared on unmount.
 */
export default function HeroLuma({
  mode,
  image,
}: {
  mode: 'dark' | 'light' | 'theme' | 'image';
  image?: string | null;
}) {
  useEffect(() => {
    const root = document.documentElement;
    let cancelled = false;
    const set = (v: 'dark' | 'light') => { if (!cancelled) root.dataset.heroLuma = v; };
    const fromTheme = (): 'dark' | 'light' =>
      root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

    let observer: MutationObserver | null = null;
    const effMode = mode === 'image' && !image ? 'theme' : mode;

    if (effMode === 'image' && image) {
      // Sample the top of the image (where the nav sits).
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = 40, h = 40;
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return set(fromTheme());
          ctx.drawImage(img, 0, 0, w, h);
          const strip = Math.max(1, Math.round(h * 0.4));
          const { data } = ctx.getImageData(0, 0, w, strip);
          let sum = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            n++;
          }
          set(sum / n / 255 < 0.55 ? 'dark' : 'light');
        } catch {
          set(fromTheme()); // CORS-tainted canvas → fall back
        }
      };
      img.onerror = () => set(fromTheme());
      img.src = image;
    } else if (effMode === 'theme') {
      const apply = () => set(fromTheme());
      apply();
      observer = new MutationObserver(apply);
      observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    } else {
      set(effMode === 'light' ? 'light' : 'dark');
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      delete root.dataset.heroLuma;
    };
  }, [mode, image]);

  return null;
}
