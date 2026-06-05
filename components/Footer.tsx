import Link from 'next/link';
import { getLyricist, getSocial, getActiveTheme } from '@/lib/data';

const iconStyle: React.CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
  marginRight: 5,
  opacity: 0.7,
  flexShrink: 0,
};

function MusicIcon() {
  return (
    <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h3V3z" />
    </svg>
  );
}

function JourneyIcon() {
  return (
    <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18l6-6 4 4 8-8" />
    </svg>
  );
}

function LyricsIcon() {
  return (
    <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg style={iconStyle} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 0-3.77-2.7C14.01 4 12 4 12 4s-2.01 0-3.82.04a4.83 4.83 0 0 0-3.77 2.7 27.14 27.14 0 0 0-.38 5.31 27.14 27.14 0 0 0 .39 5.31 4.83 4.83 0 0 0 3.77 2.7C9.99 20 12 20 12 20s2.01 0 3.82-.04a4.83 4.83 0 0 0 3.77-2.7 27.14 27.14 0 0 0 .38-5.31 27.14 27.14 0 0 0-.38-5.26zM10 15V9l5.2 3-5.2 3z" />
    </svg>
  );
}

function SocialIcon({ name }: { name: string }) {
  const k = name.toLowerCase();
  if (k.includes('instagram')) return <InstagramIcon />;
  if (k.includes('youtube')) return <YouTubeIcon />;
  return null;
}

export default async function Footer() {
  const [l, social, activeTheme] = await Promise.all([getLyricist(), getSocial(), getActiveTheme()]);
  const socialEntries = Object.entries(social).filter(([, v]) => v && v.startsWith('http'));

  if (activeTheme === 'traditional') {
    return <TraditionalFooter l={l} socialEntries={socialEntries} />;
  }

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    opacity: 0.8,
    display: 'inline-flex',
    alignItems: 'center',
  };

  return (
    <footer style={{ textAlign: 'center', padding: '6vh 6vw', borderTop: '1px solid var(--line)', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', gap: 26, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <Link href="/songs" style={linkStyle}>
          <MusicIcon />Songs
        </Link>
        <Link href="/explore?tab=collections" style={linkStyle}>
          <JourneyIcon />Collections
        </Link>
        <Link href="/explore?tab=singers" style={linkStyle}>
          <LyricsIcon />Singers
        </Link>
        <Link href="/journey" style={linkStyle}>
          <JourneyIcon />Journey
        </Link>
        <Link href="/lyrics" style={linkStyle}>
          <LyricsIcon />Lyrics
        </Link>
        <Link href="/contact" style={linkStyle}>
          <ContactIcon />Contact
        </Link>
        {socialEntries.map(([k, v]) => (
          <a
            key={k}
            href={v}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...linkStyle, textTransform: 'capitalize' }}
          >
            <SocialIcon name={k} />
            {k.replace(/Secondary/i, '').replace(/([A-Z])/g, ' $1').trim() || k}
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

/* ── Traditional (gold devotional) footer ───────────────────────── */
function TraditionalFooter({
  l,
  socialEntries,
}: {
  l: Awaited<ReturnType<typeof getLyricist>>;
  socialEntries: [string, string][];
}) {
  const name = l.displayName ?? l.name;
  const quote = l.philosophy || 'સંગીત એ સાધના છે, અને ભજન એ આત્માની ભાષા છે.';
  const location = l.basedIn || 'Gujarat, India';

  return (
    <footer className="tf-root">
      <div className="tf-grid">
        {/* Quote panel */}
        <div className="tf-quote">
          <div className="tf-orn">❖</div>
          <p className="font-serif">{quote}</p>
          <div className="tf-orn">❖</div>
        </div>

        {/* Quick links */}
        <div className="tf-col">
          <h4 className="tf-head">QUICK LINKS</h4>
          <div className="tf-links">
            <Link href="/" className="tf-link">Home</Link>
            <Link href="/about" className="tf-link">About</Link>
            <Link href="/songs" className="tf-link">Songs</Link>
            <Link href="/explore?tab=collections" className="tf-link">Collections</Link>
            <Link href="/explore?tab=singers" className="tf-link">Singers</Link>
            <Link href="/journey" className="tf-link">Journey</Link>
            <Link href="/lyrics" className="tf-link">Lyrics</Link>
            <Link href="/contact" className="tf-link">Contact</Link>
          </div>
        </div>

        {/* Contact / booking */}
        <div className="tf-col">
          <h4 className="tf-head">CONTACT / BOOKING</h4>
          <p className="tf-contact">📍 {location}</p>
          <Link href="/contact" className="tf-contact tf-contact-link">📩 Booking &amp; enquiries</Link>
          <div className="tf-social">
            {socialEntries.map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="tf-social-icon" aria-label={k}>
                <SocialIcon name={k} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="tf-bottom">
        <span>© {new Date().getFullYear()} {name}. All Rights Reserved.</span>
        <span>Made with ♥ for devotional music</span>
      </div>

      {/* CSS deity corner flourish */}
      <div className="tf-deity" aria-hidden>🪔</div>

      <style>{`
        .tf-root {
          position: relative; z-index: 2; padding: clamp(40px,6vh,70px) 6vw 28px;
          border-top: 1px solid var(--gold-line);
          background: linear-gradient(180deg, transparent, rgba(212,175,55,.04));
          overflow: hidden;
        }
        .tf-grid {
          display: grid; grid-template-columns: 1.1fr 1fr 1.1fr; gap: 32px;
          max-width: 1100px; margin: 0 auto;
        }
        .tf-quote {
          border: 1px solid var(--gold-line); border-radius: 16px; padding: 26px 22px;
          text-align: center; background: rgba(212,175,55,.04);
          display: flex; flex-direction: column; justify-content: center; gap: 10px;
        }
        .tf-quote p { font-size: 1.05rem; line-height: 1.7; margin: 0; color: var(--text); }
        .tf-orn { color: var(--gold); font-size: .8rem; opacity: .8; }
        .tf-head {
          color: var(--gold); font-size: .82rem; letter-spacing: .14em; font-weight: 700;
          margin: 0 0 16px; text-transform: uppercase;
        }
        .tf-links { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; }
        .tf-link { text-decoration: none; color: var(--muted); font-size: .9rem; transition: color .2s; }
        .tf-link:hover { color: var(--gold); }
        .tf-contact { color: var(--muted); font-size: .9rem; margin: 0 0 10px; display: block; text-decoration: none; }
        .tf-contact-link:hover { color: var(--gold); }
        .tf-social { display: flex; gap: 10px; margin-top: 8px; color: var(--gold); }
        .tf-social-icon {
          width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center;
          border: 1px solid var(--gold-line); color: var(--gold); transition: background .2s;
        }
        .tf-social-icon:hover { background: rgba(212,175,55,.12); }
        .tf-bottom {
          max-width: 1100px; margin: 28px auto 0; padding-top: 18px;
          border-top: 1px solid var(--gold-line);
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          color: var(--muted); font-size: .78rem;
        }
        .tf-deity {
          position: absolute; right: 3vw; bottom: 10px; font-size: 3.4rem; opacity: .5;
          filter: drop-shadow(0 0 18px rgba(212,175,55,.4));
        }
        @media (max-width: 820px) {
          .tf-grid { grid-template-columns: 1fr; }
          .tf-bottom { justify-content: center; text-align: center; }
          .tf-deity { display: none; }
        }
      `}</style>
    </footer>
  );
}
