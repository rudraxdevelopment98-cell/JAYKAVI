import Link from 'next/link';
import { getLyricist, getTrendingSongs, getTopSongs, getJourney } from '@/lib/data';
import CinematicHero from '@/components/CinematicHero';
import HorizontalScrollRow from '@/components/HorizontalScrollRow';
import SectionHead from '@/components/SectionHead';
import { FadeUp } from '@/components/Reveal';

export default function Home() {
  const l = getLyricist();
  const trending = getTrendingSongs();
  const top = getTopSongs(10).filter((s) => s.viewCount > 0);
  const journey = getJourney().slice(0, 4);

  return (
    <>
      <CinematicHero l={l} />

      {trending.length > 0 && (
        <section style={{ padding: '9vh 6vw', position: 'relative', zIndex: 2 }}>
          <SectionHead tag="Now Trending" title="Songs being loved right now" href="/songs" hrefLabel="View all songs →" />
          <HorizontalScrollRow songs={trending} />
        </section>
      )}

      {/* Journey teaser */}
      <section style={{ padding: '9vh 6vw', position: 'relative', zIndex: 2, background: 'linear-gradient(180deg,transparent,var(--panel),transparent)' }}>
        <SectionHead center tag="The Journey" title={`From ${l.bornPlace?.split(',')[0] ?? 'a village'} to the whole of Gujarat`} />
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {journey.map((m, i) => (
            <FadeUp key={m.id} delay={i * 0.08}>
              <div style={{ display: 'flex', gap: 28, padding: '22px 0' }}>
                <div style={{ flex: '0 0 80px' }}>
                  <span className="font-serif accent" style={{ fontWeight: 600, fontSize: '1.1rem' }}>{m.year ?? '—'}</span>
                </div>
                <div>
                  <h4 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 600, margin: '0 0 8px' }}>{m.title}</h4>
                  <p className="text-muted" style={{ margin: 0 }}>{m.description}</p>
                </div>
              </div>
            </FadeUp>
          ))}
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link href="/journey" style={{ textDecoration: 'none', borderBottom: '1px solid var(--accent)', paddingBottom: 4 }} className="accent">See the full journey →</Link>
          </div>
        </div>
      </section>

      {top.length > 0 && (
        <section style={{ padding: '9vh 6vw', position: 'relative', zIndex: 2 }}>
          <SectionHead tag="Top 10" title="Most watched & streamed" />
          <HorizontalScrollRow songs={top} ranked />
        </section>
      )}
    </>
  );
}
