import type { Metadata } from 'next';
import { Fraunces, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { getLyricist, getActiveTheme } from '@/lib/data';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import HideOnAdmin from '@/components/HideOnAdmin';
import OrnateFrame from '@/components/traditional/OrnateFrame';
import { siteUrl } from '@/lib/seo';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLyricist();
  const name = l.displayName ?? l.name;
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${name} — ${l.tagline}`,
      template: `%s — ${name}`,
    },
    description: l.bio,
    keywords: [
      name, l.name, l.penName ?? '', 'Gujarati lyricist', 'Gujarati songs',
      'lyrics', 'ગીતકાર', ...(l.languages ?? []), ...(l.genres ?? []),
    ].filter(Boolean),
    alternates: { canonical: '/' },
    openGraph: {
      title: name,
      description: l.tagline,
      type: 'website',
      siteName: name,
      locale: 'gu_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: l.tagline,
    },
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
      <body className={`${fraunces.variable} ${hanken.variable}`}>
        {activeTheme === 'traditional' && (
          <HideOnAdmin>
            <OrnateFrame />
          </HideOnAdmin>
        )}
        <SmoothScroll>
          <Nav skin={activeTheme} />
          <main>{children}</main>
          <HideOnAdmin>
            <Footer />
          </HideOnAdmin>
        </SmoothScroll>
      </body>
    </html>
  );
}
