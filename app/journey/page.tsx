import type { Metadata } from 'next';
import { getJourney, getLyricist } from '@/lib/data';
import { FadeUp } from '@/components/Reveal';

export const metadata: Metadata = { title: 'Journey — JAYKAVI' };

export default async function JourneyPage() {
  const [milestones, l] = await Promise.all([getJourney(), getLyricist()]);

  return (
    <div className="page-wrap">
      <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,80px)' }}>
        <FadeUp>
          <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>The Journey</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)', fontWeight: 600, margin: '14px auto', maxWidth: '16ch', lineHeight: 1.05 }}>
            A life written in song
          </h1>
          <p className="text-muted" style={{ maxWidth: '52ch', margin: '0 auto', lineHeight: 1.7 }}>{l.tagline}</p>
        </FadeUp>
      </div>

      <div className="timeline-wrap">
        <div className="timeline-line" />
        {milestones.map((m, i) => (
          <FadeUp key={m.id} delay={Math.min(i * 0.08, 0.4)}>
            <div className="timeline-row">
              <div className="timeline-dot" />
              <div className="timeline-body">
                <div className="font-serif accent" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{m.year ?? '—'}</div>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.15rem,2.5vw,1.5rem)', fontWeight: 600, margin: '4px 0 10px' }}>{m.title}</h3>
                <p className="text-muted" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7 }}>{m.description}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      <style>{`
        .timeline-wrap { max-width: 760px; margin: 0 auto; position: relative; }
        .timeline-line {
          position: absolute; left: 11px; top: 10px; bottom: 10px; width: 2px;
          background: linear-gradient(var(--accent), #5B2A86, transparent);
        }
        .timeline-row { display: flex; gap: 24px; padding: 22px 0; position: relative; }
        .timeline-dot {
          flex: 0 0 24px; width: 24px; height: 24px; border-radius: 50%;
          background: var(--bg); border: 2px solid var(--accent);
          margin-top: 4px; box-shadow: var(--glow); z-index: 2;
        }
        .timeline-body { flex: 1; min-width: 0; }

        @media (max-width: 480px) {
          .timeline-line { left: 8px; }
          .timeline-dot  { flex: 0 0 18px; width: 18px; height: 18px; margin-top: 5px; }
          .timeline-row  { gap: 16px; }
        }
      `}</style>
    </div>
  );
}
