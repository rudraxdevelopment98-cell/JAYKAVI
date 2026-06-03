// Canonical absolute base URL for the site, used by SEO (sitemap, robots,
// canonical links, Open Graph). Set NEXT_PUBLIC_SITE_URL in the environment
// to your real domain (e.g. https://jaykavi.com). Falls back to the Vercel
// deployment URL, then localhost for dev.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
