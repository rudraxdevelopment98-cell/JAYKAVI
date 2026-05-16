import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { ModalProvider } from '@/providers/ModalProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'JAYKAVI — A Cinematic Journey',
    template: '%s | JAYKAVI',
  },
  description:
    'An immersive entertainment platform blending cinematic storytelling with artistic visual experiences.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jaykavi.com'
  ),
  openGraph: {
    type: 'website',
    siteName: 'JAYKAVI',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

/* Inline script that runs before React hydrates — prevents theme flash */
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', stored || system);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScrollProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
