import Link from 'next/link';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { getLyricist, getTrendingSongs, getTopSongs, getJourney, getActiveTheme, getTraditionalSettings, getHeritageSettings, getSocial } from '@/lib/data';
import CinematicHero from '@/components/CinematicHero';
import HorizontalScrollRow from '@/components/HorizontalScrollRow';
import SectionHead from '@/components/SectionHead';
import { FadeUp } from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import TraditionalHome from '@/components/traditional/TraditionalHome';
import HeritageHome from '@/components/heritage/HeritageHome';
import HeroLuma from '@/components/HeroLuma';
import { siteUrl, absoluteUrl } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLyricist();
  const name = l.displayName ?? l.name;
  const base = siteUrl();
  const desc = `${name} — ${l.tagline}. Official website of Gujarati lyricist ${l.name}. Browse songs, lyrics, journey and more.`;
  return {
    title: `${name} — Official Website`,
    description: desc,
    alternates: { canonical: base },
    openGraph: { title: `${name} — Official Website`, description: desc, url: base, type: 'website' },
  };
}

export default async function Home() {
  // The Traditional theme renders a completely different devotional layout.
  const activeTheme = await getActiveTheme();
  if (activeTheme === 'traditional') {
    const tradSettings = await getTraditionalSettings();
    return (
      <>
        <HeroLuma mode="dark" />
        <TraditionalHome settings={tradSettings} />
      </>
    );
  }
  if (activeTheme === 'heritage') {
    const heritageSettings = await getHeritageSettings();
    return (
      <>
        <HeroLuma mode="image" image={heritageSettings.heroPhoto} />
        <HeritageHome settings={heritageSettings} />
      </>
    );
  }

  const [l, trendingAll, topAll, journeyAll, social] = await Promise.all([
    getLyricist(),
    getTrendingSongs(),
    getTopSongs(10),
    getJourney(),
    getSocial(),
  ]);
  const trending = trendingAll;
  const top = topAll.filter((s) => s.viewCount > 0);
  const journey = journeyAll.slice(0, 4);

  const name = l.displayName ?? l.name;
  const base = siteUrl();

  // Build sameAs links from stored social profiles
  const sameAs: string[] = [base];
  if (social.youtube) sameAs.push(social.youtube);
  if (social.instagram) sameAs.push(`https://www.instagram.com/${social.instagram.replace(/^@/, '')}`);
  if (social.spotify) sameAs.push(social.spotify);

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: [l.penName, 'JAYKAVI', 'Jayesh Prajapati', 'jaykavi'].filter(Boolean),
    jobTitle: l.title ?? 'Lyricist',
    description: l.bio,
    url: base,
    sameAs,
    nationality: { '@type': 'Country', name: 'India' },
    knowsLanguage: l.languages ?? ['Gujarati'],
    ...(l.bornPlace ? { birthPlace: { '@type': 'Place', name: l.bornPlace } } : {}),
    ...(l.basedIn ? { homeLocation: { '@type': 'Place', name: l.basedIn } } : {}),
    ...(l.awards?.length ? { award: l.awards } : {}),
    worksFor: { '@type': 'Organization', name: 'Gujarati Music Industry' },
  };
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: base,
    description: l.tagline,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/songs?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={personLd} />
      <JsonLd data={websiteLd} />
      <HeroLuma mode="dark" />
      <CinematicHero l={l} />

      {trending.length > 0 && (
        <section className="section-pad" style={{ position: 'relative', zIndex: 2 }}>
          <SectionHead tag="Now Trending" title="Songs being loved right now" href="/songs" hrefLabel="View all songs →" />
          <HorizontalScrollRow songs={trending} />
        </section>
      )}

      {/* Journey teaser */}
      <section className="section-pad" style={{ position: 'relative', zIndex: 2, background: 'linear-gradient(180deg,transparent,var(--panel),transparent)' }}>
        <SectionHead center tag="The Journey" title={`From ${l.bornPlace?.split(',')[0] ?? 'a village'} to the whole of Gujarat`} />
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {journey.map((m, i) => (
            <FadeUp key={m.id} delay={i * 0.07}>
              <div className="home-journey-row">
                <span className="font-serif accent home-journey-year">{m.year ?? '—'}</span>
                <div>
                  <h4 className="font-serif" style={{ fontSize: 'clamp(1.1rem,2vw,1.3rem)', fontWeight: 600, margin: '0 0 6px' }}>{m.title}</h4>
                  <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>{m.description}</p>
                </div>
              </div>
            </FadeUp>
          ))}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/journey" className="accent" style={{ textDecoration: 'none', borderBottom: '1px solid var(--accent)', paddingBottom: 3 }}>
              See the full journey →
            </Link>
          </div>
        </div>
      </section>

      {top.length > 0 && (
        <section className="section-pad" style={{ position: 'relative', zIndex: 2 }}>
          <SectionHead tag="Top 10" title="Most watched & streamed" />
          <HorizontalScrollRow songs={top} ranked />
        </section>
      )}

      <style>{`
        .home-journey-row {
          display: flex; gap: 24px; padding: 18px 0;
          border-bottom: 1px solid var(--line);
          align-items: flex-start;
        }
        .home-journey-row:last-of-type { border-bottom: none; }
        .home-journey-year { flex: 0 0 64px; font-size: 1.05rem; font-weight: 600; padding-top: 2px; }
        @media (max-width: 480px) {
          .home-journey-year { flex: 0 0 50px; font-size: .95rem; }
          .home-journey-row  { gap: 14px; }
        }
      `}</style>
    </>
  );
}
