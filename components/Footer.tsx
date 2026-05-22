import Link from 'next/link';
import { getLyricist, getSocial } from '@/lib/data';

export default async function Footer() {
  const [l, social] = await Promise.all([getLyricist(), getSocial()]);
  const socialEntries = Object.entries(social).filter(([, v]) => v && v.startsWith('http'));

  return (
    <footer style={{ textAlign: 'center', padding: '6vh 6vw', borderTop: '1px solid var(--line)', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', gap: 26, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <Link href="/songs" style={{ textDecoration: 'none', opacity: .8 }}>Songs</Link>
        <Link href="/journey" style={{ textDecoration: 'none', opacity: .8 }}>Journey</Link>
        <Link href="/lyrics" style={{ textDecoration: 'none', opacity: .8 }}>Lyrics</Link>
        <Link href="/contact" style={{ textDecoration: 'none', opacity: .8 }}>Contact</Link>
        {socialEntries.map(([k, v]) => (
          <a key={k} href={v} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', opacity: .8, textTransform: 'capitalize' }}>
            {k.replace(/Secondary/i, '')}
          </a>
        ))}
      </div>
      <p className="text-muted" style={{ fontSize: '.9rem' }}>
        {l.displayName ?? l.name} · {l.title ?? 'Lyricist'} · {l.basedIn ?? ''}
      </p>
      <p className="text-muted" style={{ fontSize: '.8rem', marginTop: 8, opacity: .7 }}>
        © {new Date().getFullYear()} · All lyrics © their respective rights holders.
      </p>
    </footer>
  );
}
