import Link from 'next/link';
export const dynamic = 'force-dynamic';
import { getLyricist, getTrendingSongs, getTopSongs, getJourney } from '@/lib/data';
import CinematicHero from '@/components/CinematicHero';
import HorizontalScrollRow from '@/components/HorizontalScrollRow';
import SectionHead from '@/components/SectionHead';
import { FadeUp } from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import { siteUrl } from '@/lib/seo';

export default async function Home() {
  const [l, trendingAll, topAll, journeyAll] = await Promise.all([
    getLyricist(),
    getTrendingSongs(),
    getTopSongs(10),
    getJourney(),
  ]);
  const trending = trendingAll;
  const top = topAll.filter((s) => s.viewCount > 0);
  const journey = journeyAll.slice(0, 4);

  const name = l.displayName ?? l.name;
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: l.penName ?? undefined,
    jobTitle: l.title ?? 'Lyricist',
    description: l.tagline,
    url: siteUrl(),
    ...(l.bornPlace ? { birthPlace: l.bornPlace } : {}),
    knowsLanguage: l.languages ?? [],
  };
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: siteUrl(),
  };

  return (
    <>
      <JsonLd data={personLd} />
      <JsonLd data={websiteLd} />
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
