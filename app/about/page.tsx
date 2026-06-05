import type { Metadata } from 'next';
import { getLyricist } from '@/lib/data';
import { FadeUp } from '@/components/Reveal';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLyricist();
  const name = l.displayName ?? l.name;
  const desc = `Learn about ${name} — ${l.title ?? 'Gujarati lyricist'}. ${l.bio?.slice(0, 140) ?? ''}`;
  return {
    title: `About ${name}`,
    description: desc,
    keywords: [name, l.penName ?? '', 'JAYKAVI', 'Jayesh Prajapati', 'Gujarati lyricist', 'ગીતકાર', 'biography', l.bornPlace ?? ''].filter(Boolean),
    alternates: { canonical: absoluteUrl('/about') },
    openGraph: { title: `About ${name}`, description: desc, url: absoluteUrl('/about') },
  };
}

export default async function AboutPage() {
  const l = await getLyricist();
  return (
    <div className="page-wrap page-wrap-narrow">
      <FadeUp>
        <p className="accent" style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '.76rem', fontWeight: 600 }}>About</p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', fontWeight: 600, lineHeight: 1, margin: '14px 0 10px' }}>
          {l.displayName ?? l.name}
        </h1>
        <p className="text-muted" style={{ fontSize: '1.05rem' }}>{l.title}</p>
      </FadeUp>

      <FadeUp delay={0.1}>
        <p style={{ fontSize: '1.2rem', lineHeight: 1.8, marginTop: 40 }}>{l.bio}</p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 24, marginTop: 50 }}>
          {l.bornPlace && <Fact label="Born" value={l.bornPlace} />}
          {l.basedIn && <Fact label="Based in" value={l.basedIn} />}
          {l.languages && <Fact label="Writes in" value={l.languages.join(', ')} />}
          {l.genres && <Fact label="Forms" value={l.genres.join(' · ')} />}
        </div>
      </FadeUp>

      {l.philosophy && (
        <FadeUp delay={0.2}>
          <blockquote className="font-serif" style={{ fontSize: '1.6rem', lineHeight: 1.5, margin: '60px 0', paddingLeft: 24, borderLeft: '3px solid var(--accent)', fontStyle: 'italic' }}>
            {l.philosophy}
          </blockquote>
        </FadeUp>
      )}

      {l.awards && l.awards.length > 0 && (
        <FadeUp delay={0.25}>
          <h2 className="font-serif" style={{ fontSize: '1.6rem', marginTop: 50, marginBottom: 16 }}>Recognition</h2>
          <ul style={{ lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            {l.awards.map((a) => (
              <li key={a} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                <span className="accent" style={{ fontSize: '.8rem', flexShrink: 0 }}>✦</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </FadeUp>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass" style={{ padding: 22, borderRadius: 16 }}>
      <div className="text-muted" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8 }}>{label}</div>
      <div className="font-serif" style={{ fontSize: '1.1rem' }}>{value}</div>
    </div>
  );
}
