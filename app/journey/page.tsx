import type { Metadata } from 'next';
import { getJourney, getLyricist } from '@/lib/data';
import { FadeUp } from '@/components/Reveal';

export const metadata: Metadata = { title: 'Journey — JAYKAVI' };

export default function JourneyPage() {
  const milestones = getJourney();
  const l = getLyricist();

  return (
    <div style={{ padding: '16vh 6vw 9vh', position: 'relative', zIndex: 2 }}>
      <div style={{ textAlign: 'center', marginBottom: 70 }}>
        <FadeUp>
          <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>The Journey</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', fontWeight: 600, margin: '14px auto', maxWidth: '16ch', lineHeight: 1.05 }}>
            A life written in song
          </h1>
          <p className="text-muted" style={{ maxWidth: '52ch', margin: '0 auto' }}>{l.tagline}</p>
        </FadeUp>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 11, top: 10, bottom: 10, width: 2, background: 'linear-gradient(var(--accent),#5B2A86,transparent)' }} />
        {milestones.map((m, i) => (
          <FadeUp key={m.id} delay={Math.min(i * 0.1, 0.5)}>
            <div style={{ display: 'flex', gap: 28, padding: '26px 0', position: 'relative' }}>
              <div style={{ flex: '0 0 24px', width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--accent)', marginTop: 5, boxShadow: 'var(--glow)', zIndex: 2 }} />
              <div>
                <div className="font-serif accent" style={{ fontWeight: 600, fontSize: '1.1rem' }}>{m.year ?? '—'}</div>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 600, margin: '2px 0 10px' }}>{m.title}</h3>
                <p className="text-muted" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7 }}>{m.description}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
