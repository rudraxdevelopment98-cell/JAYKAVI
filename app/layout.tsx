import type { Metadata } from 'next';
import { Playfair_Display, Raleway } from 'next/font/google';
import './globals.css';
import { getLyricist, getActiveTheme } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import HideOnAdmin from '@/components/HideOnAdmin';
import Translator from '@/components/Translator';
import OrnateFrame from '@/components/traditional/OrnateFrame';
import { siteUrl } from '@/lib/seo';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-hanken',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLyricist();
  const name = l.displayName ?? l.name;
  const base = siteUrl();
  return {
    metadataBase: new URL(base),
    title: {
      default: `${name} — ${l.tagline}`,
      template: `%s — ${name}`,
    },
    description: l.bio,
    keywords: [
      name, l.name, l.penName ?? '',
      'JAYKAVI', 'Jayesh Prajapati', 'jaykavi', 'jayesh prajapati',
      'Gujarati lyricist', 'Gujarati songs', 'Gujarati geet', 'Gujarati kavya',
      'ગીતકાર', 'ગુજરાતી ગીત', 'જયકવિ', 'ગુજરાતી કવિ',
      'lyrics', 'song writer', 'bhajan', 'garba', 'lagna geet',
      ...(l.languages ?? []), ...(l.genres ?? []),
    ].filter(Boolean),
    authors: [{ name }],
    creator: name,
    alternates: { canonical: base },
    openGraph: {
      title: name,
      description: l.tagline,
      type: 'website',
      siteName: name,
      locale: 'gu_IN',
      url: base,
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: l.tagline,
    },
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

// Inline script: restores user's dark/light preference before paint
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) { document.documentElement.setAttribute('data-theme','dark'); }
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch the admin-selected site theme from the DB.
  // This sets data-theme-skin on <html> — zero flash because it's server-rendered.
  const activeTheme = await getActiveTheme();

  return (
    <html lang="en" data-theme-skin={activeTheme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${playfair.variable} ${raleway.variable}`}>
        {activeTheme === 'traditional' && (
          <HideOnAdmin>
            <OrnateFrame />
          </HideOnAdmin>
        )}
        <SmoothScroll>
          <HideOnAdmin>
            <Nav skin={activeTheme} />
          </HideOnAdmin>
          <main>{children}</main>
          <HideOnAdmin>
            <Footer />
            <Translator />
          </HideOnAdmin>
        </SmoothScroll>
      </body>
    </html>
  );
}
