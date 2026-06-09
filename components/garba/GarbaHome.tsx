import Link from 'next/link';
import { getLyricist, getAllSongs, getJourney, getSocial, getTrendingSongs } from '@/lib/data';

function safeUrl(u?: string | null): string | null {
  if (!u) return null;
  try { const p = new URL(u).protocol; return p === 'https:' || p === 'http:' ? u : null; }
  catch { return null; }
}

const NEON_ACCENTS = ['#FF5F1F', '#E91E8C', '#00D4AA', '#FFD700', '#A259FF', '#FF5F1F'];

function GbSectionHead({
  title,
  color = 'orange',
  link,
  linkLabel,
}: {
  title: string;
  color?: 'orange' | 'pink' | 'teal' | 'gold';
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className={`gb-sechead gb-sechead--${color}`}>
      <span className="gb-orn" aria-hidden>◆</span>
      <h2 className="font-serif gb-sectitle">{title}</h2>
      <span className="gb-orn" aria-hidden>◆</span>
      {link && (
        <Link href={link} className="gb-seclink">{linkLabel ?? 'VIEW ALL'}</Link>
      )}
    </div>
  );
}

export default async function GarbaHome() {
  const [l, songs, journey, social, trending] = await Promise.all([
    getLyricist(),
    getAllSongs(),
    getJourney(),
    getSocial(),
    getTrendingSongs(),
  ]);

  const name = l.displayName ?? l.name;
  const featuredSongs = (trending.length > 0 ? trending : songs).slice(0, 6);
  const videoSongs = songs.filter((s) => s.embed?.youtubeId).slice(0, 3);
  const milestones = journey.slice(0, 6);

  const platformLinks = [
    { name: 'YouTube',     href: social.youtube  || '/songs', color: '#FF0000', icon: '▶' },
    { name: 'Spotify',     href: social.spotify  || '/songs', color: '#1DB954', icon: '♪' },
    { name: 'JioSaavn',    href: social.jiosaavn || '/songs', color: '#2BC5B4', icon: '♬' },
    { name: 'Instagram',   href: social.instagram ? `https://www.instagram.com/${social.instagram.replace(/^@/, '')}` : '/contact', color: '#E91E8C', icon: '✦' },
  ].filter(Boolean);

  return (
    <div className="gb-root">
      {/* Neon top frame */}
      <div className="gb-frame" aria-hidden />

      {/* ═══════════ HERO ═══════════ */}
      <header className="gb-hero">
        {/* Multi-layer neon background */}
        <div className="gb-hero-bg" aria-hidden>
          <div className="gb-glow gb-glow--orange" />
          <div className="gb-glow gb-glow--pink" />
          <div className="gb-glow gb-glow--purple" />
          <div className="gb-glow gb-glow--teal" />
          <div className="gb-pattern" />
        </div>

        {/* Garba circle decoration */}
        <div className="gb-circle-wrap" aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="gb-circle-dot"
              style={{ '--dot-i': i, '--dot-total': 16 } as React.CSSProperties}
            />
          ))}
          <div className="gb-circle-ring gb-circle-ring--1" />
          <div className="gb-circle-ring gb-circle-ring--2" />
        </div>

        <div className="gb-hero-inner">
          <p className="gb-hero-eyebrow">✦ &nbsp; ગુજરાતી ગીત &nbsp;•&nbsp; ગઝલ &nbsp;•&nbsp; ભજન &nbsp; ✦</p>
          <h1 className="font-serif gb-hero-name">{name}</h1>
          <p className="gb-hero-sub">{l.tagline ?? 'Gujarati Lyricist & Songwriter'}</p>

          <div className="gb-hero-ctas">
            <Link href="/songs" className="gb-btn-primary">
              <span className="gb-btn-icon" aria-hidden>▶</span>
              EXPLORE SONGS
            </Link>
            <Link href="/lyrics" className="gb-btn-ghost">LYRICS LIBRARY</Link>
          </div>

          <div className="gb-hero-stats">
            <div className="gb-hstat">
              <span className="font-serif gb-hstat-val">{l.stats?.songsWritten ?? `${songs.length}+`}</span>
              <span className="gb-hstat-label">Songs</span>
            </div>
            <div className="gb-hstat-sep" aria-hidden>◆</div>
            <div className="gb-hstat">
              <span className="font-serif gb-hstat-val">
                {l.careerStartYear ? `${new Date().getFullYear() - l.careerStartYear}+` : '10+'}
              </span>
              <span className="gb-hstat-label">Years</span>
            </div>
            <div className="gb-hstat-sep" aria-hidden>◆</div>
            <div className="gb-hstat">
              <span className="font-serif gb-hstat-val">8+</span>
              <span className="gb-hstat-label">Platforms</span>
            </div>
            <div className="gb-hstat-sep" aria-hidden>◆</div>
            <div className="gb-hstat">
              <span className="font-serif gb-hstat-val">{(l.languages ?? ['Gujarati']).length}+</span>
              <span className="gb-hstat-label">Languages</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="gb-scroll-cue" aria-hidden>
          <span className="gb-scroll-arrow">↓</span>
        </div>
      </header>

      {/* ═══════════ SONGS OF THE SEASON ═══════════ */}
      {featuredSongs.length > 0 && (
        <section className="gb-section">
          <GbSectionHead title="Songs of the Season" color="orange" link="/songs" linkLabel="VIEW ALL →" />
          <div className="gb-songs-grid">
            {featuredSongs.map((s, i) => (
              <Link
                key={s.id}
                href={`/songs/${s.slug}`}
                className="gb-song-card"
                style={{ '--card-accent': NEON_ACCENTS[i % NEON_ACCENTS.length] } as React.CSSProperties}
              >
                <div className="gb-song-art">
                  {safeUrl(s.artworkUrl)
                    ? <img src={s.artworkUrl} alt={s.title} className="gb-song-art-img" loading="lazy" />
                    : (
                      <div className="gb-song-art-ph" style={{ '--ph-color': NEON_ACCENTS[i % NEON_ACCENTS.length] } as React.CSSProperties}>
                        <span className="font-serif gb-song-art-initial">{s.title.charAt(0)}</span>
                      </div>
                    )
                  }
                  {s.genre?.length > 0 && (
                    <span className="gb-song-genre">{s.genre[0]}</span>
                  )}
                  <div className="gb-song-hover-glow" aria-hidden />
                </div>
                <div className="gb-song-info">
                  <span className="gb-song-num font-serif">0{i + 1}</span>
                  <div>
                    <h3 className="font-serif gb-song-title">{s.title}</h3>
                    {s.performingSingers?.length > 0 && (
                      <p className="gb-song-singer">{s.performingSingers.slice(0, 2).join(', ')}</p>
                    )}
                  </div>
                  <span className="gb-song-arrow" aria-hidden>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ WATCH & FEEL ═══════════ */}
      {videoSongs.length > 0 && (
        <section className="gb-section gb-section--alt">
          <GbSectionHead title="Watch & Feel" color="pink" />
          <div className="gb-videos">
            {videoSongs.map((s, i) => (
              <Link
                key={s.id}
                href={`/songs/${s.slug}`}
                className="gb-vid"
                style={{ '--vid-accent': NEON_ACCENTS[(i + 1) % NEON_ACCENTS.length] } as React.CSSProperties}
              >
                {s.embed?.youtubeId && (
                  <div
                    className="gb-vid-thumb"
                    style={{ backgroundImage: `url(https://i.ytimg.com/vi/${s.embed.youtubeId}/hqdefault.jpg)` }}
                  />
                )}
                <div className="gb-vid-veil" />
                <div className="gb-vid-play">▶</div>
                <div className="gb-vid-bottom">
                  {s.genre?.length > 0 && <span className="gb-vid-genre">{s.genre[0]}</span>}
                  <h3 className="font-serif gb-vid-title">{s.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ THE ARTIST ═══════════ */}
      <section className="gb-section">
        <div className="gb-about">
          {/* Portrait with neon rings */}
          <div className="gb-about-portrait-wrap">
            <div className="gb-portrait">
              <div className="gb-portrait-ring gb-portrait-ring--outer" aria-hidden />
              <div className="gb-portrait-ring gb-portrait-ring--mid" aria-hidden />
              <div className="gb-portrait-ring gb-portrait-ring--inner" aria-hidden />
              <div className="gb-portrait-core">
                <span className="font-serif gb-portrait-initial">{name.charAt(0)}</span>
              </div>
              {/* 8 orbiting neon dots */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="gb-orbit-dot"
                  style={{ '--orbit-i': i, '--orbit-total': 8 } as React.CSSProperties}
                />
              ))}
            </div>
            <div className="gb-about-platform-strip">
              {platformLinks.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target={p.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="gb-plat-pill"
                  style={{ '--pill-color': p.color } as React.CSSProperties}
                >
                  <span className="gb-plat-icon" aria-hidden>{p.icon}</span>
                  {p.name}
                </a>
              ))}
            </div>
          </div>

          {/* Bio text */}
          <div className="gb-about-copy">
            <p className="gb-about-eyebrow">✦ The Artist</p>
            <h2 className="font-serif gb-about-name">{name}</h2>
            {l.title && <p className="gb-about-role">{l.title}</p>}
            {l.bio && (
              <p className="gb-about-bio">
                {l.bio.length > 320 ? l.bio.slice(0, 320) + '…' : l.bio}
              </p>
            )}
            <div className="gb-about-tags">
              {(l.languages ?? ['Gujarati']).map((lang) => (
                <span key={lang} className="gb-tag">{lang}</span>
              ))}
              {l.basedIn && <span className="gb-tag">{l.basedIn}</span>}
              {l.genres?.slice(0, 2).map((g) => (
                <span key={g} className="gb-tag">{g}</span>
              ))}
            </div>
            <Link href="/about" className="gb-btn-primary gb-btn-primary--sm">FULL STORY →</Link>
          </div>
        </div>
      </section>

      {/* ═══════════ MILESTONES ═══════════ */}
      {milestones.length > 0 && (
        <section className="gb-section gb-section--alt">
          <GbSectionHead title="Milestones" color="teal" link="/journey" linkLabel="VIEW JOURNEY →" />
          <div className="gb-milestones">
            {milestones.map((m, i) => (
              <div
                key={m.id}
                className={`gb-mile gb-mile--${i % 2 === 0 ? 'even' : 'odd'}`}
                style={{ '--mile-color': NEON_ACCENTS[i % NEON_ACCENTS.length] } as React.CSSProperties}
              >
                <div className="gb-mile-year-wrap">
                  <span className="font-serif gb-mile-year">{m.year ?? '—'}</span>
                </div>
                <div className="gb-mile-connector" aria-hidden>
                  <div className="gb-mile-dot" />
                  <div className="gb-mile-line" />
                </div>
                <div className="gb-mile-card">
                  <h4 className="font-serif gb-mile-title">{m.title}</h4>
                  <p className="gb-mile-desc">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ LISTEN EVERYWHERE ═══════════ */}
      <section className="gb-section">
        <GbSectionHead title="Listen Everywhere" color="gold" link="/songs" linkLabel="BROWSE SONGS →" />
        <div className="gb-platforms-grid">
          {[
            { name: 'YouTube Music', color: '#FF0000', desc: 'Full discography', href: social.youtube || '/songs' },
            { name: 'Spotify',       color: '#1DB954', desc: 'Stream on Spotify', href: social.spotify || '/songs' },
            { name: 'JioSaavn',      color: '#2BC5B4', desc: 'On JioSaavn',      href: social.jiosaavn || '/songs' },
            { name: 'Apple Music',   color: '#FC3C44', desc: 'Apple Music',       href: '/songs' },
            { name: 'Gaana',         color: '#E72C30', desc: 'Listen on Gaana',   href: '/songs' },
            { name: 'Wynk Music',    color: '#7B2FBE', desc: 'Wynk Music',        href: '/songs' },
          ].map((p) => (
            <a
              key={p.name}
              href={p.href}
              target={p.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="gb-platform-card"
              style={{ '--pc-color': p.color } as React.CSSProperties}
            >
              <div className="gb-platform-dot" style={{ background: p.color }} />
              <div>
                <span className="gb-platform-name">{p.name}</span>
                <span className="gb-platform-desc">{p.desc}</span>
              </div>
              <span className="gb-platform-arrow">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════ CLOSING QUOTE ═══════════ */}
      <div className="gb-closing">
        <div className="gb-closing-deco" aria-hidden>
          <span className="gb-closing-diamond" />
          <span className="gb-closing-line" />
          <span className="gb-closing-diamond" />
        </div>
        <p className="font-serif gb-closing-quote">
          "ગઝલ, ભજન, અને ગીત — આ ત્રણ મારી ઓળખ છે"
        </p>
        <p className="gb-closing-by">— {name}</p>
        <div className="gb-closing-ctas">
          <Link href="/songs" className="gb-btn-primary">EXPLORE ALL SONGS</Link>
          <Link href="/contact" className="gb-btn-ghost">GET IN TOUCH</Link>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  /* ──────────────────────────────────────────────────────────────────
     GARBA NIGHT — Festival Neon Theme
     Inspired by Navratri nights: deep indigo sky, electric saffron
     torches, hot-pink dandiya lights, turquoise lanterns.
  ──────────────────────────────────────────────────────────────────── */

  .gb-root { position: relative; overflow-x: hidden; }

  /* ── Neon top frame ── */
  .gb-frame {
    position: fixed; top: 0; left: 0; right: 0; height: 4px; z-index: 300;
    pointer-events: none;
    background: linear-gradient(90deg,
      #FF5F1F 0%, #E91E8C 25%, #A259FF 50%, #00D4AA 75%, #FF5F1F 100%
    );
    background-size: 200% 100%;
    animation: gb-frame-slide 4s linear infinite;
  }
  @keyframes gb-frame-slide {
    0%   { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }

  /* ─────────────────── HERO ─────────────────── */
  .gb-hero {
    position: relative;
    min-height: 100svh;
    display: flex; align-items: center; justify-content: center;
    padding: clamp(120px,16vh,180px) clamp(20px,6vw,80px) clamp(80px,12vh,140px);
    overflow: hidden;
    background: var(--bg);
  }

  /* Layered neon glows */
  .gb-hero-bg { position: absolute; inset: 0; pointer-events: none; }

  .gb-glow {
    position: absolute; border-radius: 50%;
    filter: blur(100px); opacity: .28;
  }
  .gb-glow--orange {
    width: 70vw; height: 70vw; max-width: 800px; max-height: 800px;
    top: -20%; right: -15%;
    background: radial-gradient(circle, #FF5F1F, transparent 70%);
  }
  .gb-glow--pink {
    width: 60vw; height: 60vw; max-width: 700px; max-height: 700px;
    bottom: -25%; left: -10%;
    background: radial-gradient(circle, #E91E8C, transparent 70%);
  }
  .gb-glow--purple {
    width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
    top: 30%; left: 35%;
    background: radial-gradient(circle, #7B2FBE, transparent 70%);
    opacity: .18;
  }
  .gb-glow--teal {
    width: 40vw; height: 40vw; max-width: 500px; max-height: 500px;
    bottom: 10%; right: 5%;
    background: radial-gradient(circle, #00D4AA, transparent 70%);
    opacity: .14;
  }

  /* Subtle Patola diamond pattern */
  .gb-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(45deg, rgba(255,95,31,.06) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,95,31,.06) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(233,30,140,.06) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(233,30,140,.06) 75%);
    background-size: 60px 60px;
    background-position: 0 0, 0 30px, 30px -30px, -30px 0px;
  }

  /* Garba circle — 16 orbiting dots rotating slowly */
  .gb-circle-wrap {
    position: absolute;
    width: clamp(320px, 55vw, 720px);
    height: clamp(320px, 55vw, 720px);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: gb-spin 60s linear infinite;
  }
  @keyframes gb-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

  .gb-circle-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
  }
  .gb-circle-ring--1 {
    width: 100%; height: 100%;
    border-color: rgba(255,95,31,.12);
  }
  .gb-circle-ring--2 {
    width: 78%; height: 78%;
    border-color: rgba(233,30,140,.1);
  }
  .gb-circle-dot {
    position: absolute; width: 6px; height: 6px; border-radius: 50%;
    top: 50%; left: 50%;
    background: conic-gradient(#FF5F1F, #E91E8C, #A259FF, #00D4AA, #FF5F1F);
    background-clip: text;
    /* Place each dot around the circle */
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--dot-i, 0) * (360deg / var(--dot-total, 16))))
      translateX(clamp(145px, 25vw, 330px));
    box-shadow: 0 0 8px currentColor;
  }
  .gb-circle-dot:nth-child(4n)   { background: #FF5F1F; box-shadow: 0 0 8px #FF5F1F; }
  .gb-circle-dot:nth-child(4n+1) { background: #E91E8C; box-shadow: 0 0 8px #E91E8C; }
  .gb-circle-dot:nth-child(4n+2) { background: #00D4AA; box-shadow: 0 0 8px #00D4AA; }
  .gb-circle-dot:nth-child(4n+3) { background: #A259FF; box-shadow: 0 0 8px #A259FF; }

  /* Hero content */
  .gb-hero-inner {
    position: relative; z-index: 2;
    text-align: center; max-width: 900px; width: 100%;
  }
  .gb-hero-eyebrow {
    font-size: clamp(.78rem, 1.4vw, 1rem);
    font-weight: 700; letter-spacing: .18em;
    color: var(--accent); margin: 0 0 22px;
    text-shadow: 0 0 20px rgba(255,95,31,.5);
  }
  .gb-hero-name {
    font-size: clamp(3.5rem, 10vw, 8rem);
    font-weight: 900; line-height: .95; margin: 0 0 24px;
    letter-spacing: -.02em;
    background: linear-gradient(120deg, #FF5F1F 0%, #E91E8C 40%, #A259FF 75%, #00D4AA 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    text-shadow: none;
    filter: drop-shadow(0 0 40px rgba(255,95,31,.35));
  }
  .gb-hero-sub {
    font-size: clamp(1rem, 2vw, 1.35rem);
    color: var(--muted); margin: 0 auto 36px; max-width: 38ch;
    line-height: 1.6;
  }

  /* Hero CTAs */
  .gb-hero-ctas {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px;
  }

  /* Primary neon button */
  .gb-btn-primary {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 14px 32px; border-radius: 8px;
    font-weight: 700; font-size: .88rem; letter-spacing: .08em;
    text-decoration: none; text-transform: uppercase; white-space: nowrap;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C);
    color: #fff;
    box-shadow: 0 8px 28px rgba(255,95,31,.4), 0 0 0 1px rgba(255,95,31,.3);
    transition: transform .22s, box-shadow .22s, filter .22s;
  }
  .gb-btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 38px rgba(255,95,31,.55), 0 0 0 1px rgba(255,95,31,.5);
    filter: brightness(1.08);
  }
  .gb-btn-primary--sm { padding: 10px 22px; font-size: .8rem; }
  .gb-btn-icon { font-size: .76rem; }

  /* Ghost button */
  .gb-btn-ghost {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 14px 32px; border-radius: 8px;
    font-weight: 700; font-size: .88rem; letter-spacing: .08em;
    text-decoration: none; text-transform: uppercase; white-space: nowrap;
    background: transparent;
    color: var(--text);
    border: 1.5px solid rgba(255,95,31,.5);
    transition: border-color .22s, background .22s, transform .22s;
  }
  .gb-btn-ghost:hover {
    border-color: #FF5F1F;
    background: rgba(255,95,31,.1);
    transform: translateY(-3px);
  }

  /* Stats row */
  .gb-hero-stats {
    display: flex; align-items: center; justify-content: center;
    gap: clamp(12px, 3vw, 40px); flex-wrap: wrap;
  }
  .gb-hstat { text-align: center; }
  .gb-hstat-val {
    display: block;
    font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 900; line-height: 1;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .gb-hstat-label {
    display: block; font-size: .72rem; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-top: 5px;
  }
  .gb-hstat-sep { color: rgba(255,95,31,.4); font-size: .7rem; }

  /* Scroll cue */
  .gb-scroll-cue {
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    z-index: 2;
    animation: gb-bounce 2s ease-in-out infinite;
  }
  @keyframes gb-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(8px); }
  }
  .gb-scroll-arrow {
    color: rgba(255,95,31,.6); font-size: 1.4rem;
    text-shadow: 0 0 10px rgba(255,95,31,.5);
  }

  /* ── Sections ── */
  .gb-section {
    max-width: 1200px; margin: 0 auto;
    padding: clamp(60px,9vh,110px) clamp(20px,6vw,80px) 0;
  }
  .gb-section--alt {
    max-width: 100%; margin: 0;
    padding: clamp(60px,9vh,110px) 0 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,95,31,.05), transparent 70%),
                linear-gradient(180deg, var(--panel-solid) 0%, transparent 100%);
  }
  .gb-section--alt > .gb-sechead,
  .gb-section--alt > .gb-songs-grid,
  .gb-section--alt > .gb-videos,
  .gb-section--alt > .gb-milestones {
    max-width: 1200px; margin-left: auto; margin-right: auto;
    padding-left: clamp(20px,6vw,80px); padding-right: clamp(20px,6vw,80px);
  }

  /* ── Section head ── */
  .gb-sechead {
    position: relative; display: flex; align-items: center; justify-content: center;
    gap: 14px; margin-bottom: 40px; flex-wrap: wrap;
  }
  .gb-orn {
    font-size: .9rem; opacity: .5;
  }
  .gb-sechead--orange .gb-orn { color: #FF5F1F; }
  .gb-sechead--pink   .gb-orn { color: #E91E8C; }
  .gb-sechead--teal   .gb-orn { color: #00D4AA; }
  .gb-sechead--gold   .gb-orn { color: #FFD700; }

  .gb-sectitle {
    font-size: clamp(1.7rem, 4vw, 2.8rem); font-weight: 800; margin: 0;
    text-align: center;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .gb-sechead--pink   .gb-sectitle { background-image: linear-gradient(120deg, #E91E8C, #A259FF); }
  .gb-sechead--teal   .gb-sectitle { background-image: linear-gradient(120deg, #00D4AA, #A259FF); }
  .gb-sechead--gold   .gb-sectitle { background-image: linear-gradient(120deg, #FFD700, #FF5F1F); }

  .gb-seclink {
    position: absolute; right: 0; top: 50%; transform: translateY(-50%);
    font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-decoration: none;
    color: #FF5F1F; border: 1px solid rgba(255,95,31,.4);
    padding: 7px 16px; border-radius: 6px;
    transition: background .2s, border-color .2s;
  }
  .gb-seclink:hover { background: rgba(255,95,31,.12); border-color: #FF5F1F; }
  .gb-seclink--teal { color: #00D4AA; border-color: rgba(0,212,170,.4); }
  .gb-seclink--teal:hover { background: rgba(0,212,170,.12); border-color: #00D4AA; }

  /* ─────────────────── SONGS GRID ─────────────────── */
  .gb-songs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(14px, 1.8vw, 22px);
  }

  .gb-song-card {
    position: relative; text-decoration: none; color: var(--text);
    background: var(--panel-solid);
    border-radius: 14px; overflow: hidden;
    border: 1px solid var(--line);
    border-left: 3px solid var(--card-accent, #FF5F1F);
    transition: transform .25s, box-shadow .25s, border-color .25s;
  }
  .gb-song-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 48px rgba(0,0,0,.35), 0 0 30px rgba(var(--card-accent, #FF5F1F), .12);
    border-color: var(--card-accent, #FF5F1F);
  }

  .gb-song-art {
    aspect-ratio: 16 / 9; position: relative; overflow: hidden;
    background: var(--panel-solid);
  }
  .gb-song-art-img {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    transition: transform .4s;
  }
  .gb-song-card:hover .gb-song-art-img { transform: scale(1.06); }

  .gb-song-art-ph {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--ph-color, #FF5F1F) 20%, var(--panel-solid)),
      var(--panel-solid)
    );
  }
  .gb-song-art-initial {
    font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; color: var(--ph-color, #FF5F1F);
    opacity: .7;
    text-shadow: 0 0 40px var(--ph-color, #FF5F1F);
  }

  .gb-song-genre {
    position: absolute; top: 10px; left: 10px;
    background: rgba(0,0,0,.55); backdrop-filter: blur(6px);
    color: #fff; font-size: .62rem; padding: 4px 10px;
    border-radius: 100px; letter-spacing: .12em; text-transform: uppercase; z-index: 1;
  }

  .gb-song-hover-glow {
    position: absolute; inset: 0; opacity: 0;
    background: linear-gradient(135deg, rgba(255,95,31,.16), rgba(233,30,140,.1));
    transition: opacity .3s;
    pointer-events: none;
  }
  .gb-song-card:hover .gb-song-hover-glow { opacity: 1; }

  .gb-song-info {
    display: flex; align-items: center; gap: 14px; padding: 14px 16px 16px;
  }
  .gb-song-num {
    font-size: 1.5rem; font-weight: 900; line-height: 1; flex-shrink: 0;
    color: var(--card-accent, #FF5F1F); opacity: .25;
  }
  .gb-song-title {
    font-size: 1.05rem; font-weight: 600; margin: 0 0 4px; line-height: 1.3;
    transition: color .2s;
  }
  .gb-song-card:hover .gb-song-title { color: var(--card-accent, #FF5F1F); }
  .gb-song-singer { font-size: .76rem; color: var(--muted); margin: 0; }
  .gb-song-arrow {
    margin-left: auto; color: var(--card-accent, #FF5F1F); opacity: 0;
    font-size: 1.1rem; transition: opacity .2s, transform .2s;
  }
  .gb-song-card:hover .gb-song-arrow { opacity: 1; transform: translateX(4px); }

  /* ─────────────────── VIDEOS ─────────────────── */
  .gb-videos {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: clamp(14px, 1.8vw, 22px);
  }
  .gb-vid {
    position: relative; aspect-ratio: 16/9; border-radius: 14px; overflow: hidden;
    text-decoration: none; display: flex; align-items: flex-end;
    border: 1px solid var(--line);
    border-bottom: 3px solid var(--vid-accent, #E91E8C);
    transition: transform .28s, box-shadow .28s;
  }
  .gb-vid:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 52px rgba(0,0,0,.45), 0 0 40px rgba(233,30,140,.2);
  }
  .gb-vid-thumb {
    position: absolute; inset: 0; background-size: cover; background-position: center;
    transition: transform .4s;
  }
  .gb-vid:hover .gb-vid-thumb { transform: scale(1.06); }
  .gb-vid-veil {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(5,4,26,.9) 0%, rgba(5,4,26,.4) 50%, transparent 100%);
  }
  .gb-vid-play {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 50px; height: 50px; border-radius: 50%;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 1.1rem; padding-left: 3px;
    box-shadow: 0 0 30px rgba(255,95,31,.5);
    transition: transform .2s, box-shadow .2s;
  }
  .gb-vid:hover .gb-vid-play {
    transform: translate(-50%, -50%) scale(1.12);
    box-shadow: 0 0 50px rgba(255,95,31,.7);
  }
  .gb-vid-bottom {
    position: relative; z-index: 1; padding: 16px;
  }
  .gb-vid-genre {
    display: block; font-size: .6rem; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; color: var(--vid-accent, #E91E8C); margin-bottom: 5px;
  }
  .gb-vid-title {
    font-size: .95rem; font-weight: 700; color: #fff; margin: 0; line-height: 1.3;
    text-shadow: 0 2px 6px rgba(0,0,0,.8);
  }

  /* ─────────────────── ABOUT ─────────────────── */
  .gb-about {
    display: grid; grid-template-columns: 1fr 1.5fr;
    gap: clamp(32px, 5vw, 72px); align-items: center;
  }

  .gb-about-portrait-wrap { display: flex; flex-direction: column; align-items: center; gap: 28px; }

  /* Circular portrait with orbiting rings */
  .gb-portrait {
    position: relative; width: clamp(200px, 28vw, 320px); height: clamp(200px, 28vw, 320px);
    display: flex; align-items: center; justify-content: center;
  }
  .gb-portrait-ring {
    position: absolute; border-radius: 50%; top: 50%; left: 50%;
    transform: translate(-50%, -50%); border-style: solid;
  }
  .gb-portrait-ring--outer {
    width: 100%; height: 100%;
    border-width: 1px; border-color: rgba(255,95,31,.25);
    animation: gb-spin-slow 20s linear infinite;
  }
  .gb-portrait-ring--mid {
    width: 84%; height: 84%;
    border-width: 1.5px; border-color: rgba(233,30,140,.3);
    animation: gb-spin-slow 14s linear infinite reverse;
  }
  .gb-portrait-ring--inner {
    width: 68%; height: 68%;
    border-width: 2px; border-color: rgba(162,89,255,.35);
    animation: gb-spin-slow 9s linear infinite;
  }
  @keyframes gb-spin-slow {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  .gb-portrait-core {
    width: 56%; height: 56%; border-radius: 50%;
    background: linear-gradient(135deg, #FF5F1F22, #E91E8C22, #A259FF22);
    border: 2px solid rgba(255,95,31,.5);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 60px rgba(255,95,31,.25), inset 0 0 40px rgba(255,95,31,.08);
    position: relative; z-index: 1;
  }
  .gb-portrait-initial {
    font-size: clamp(3rem, 6vw, 5rem); font-weight: 900;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C, #A259FF);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }

  /* 8 small orbiting dots around portrait */
  .gb-orbit-dot {
    position: absolute; width: 8px; height: 8px; border-radius: 50%;
    top: 50%; left: 50%;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--orbit-i, 0) * (360deg / var(--orbit-total, 8))))
      translateX(calc(clamp(100px, 14vw, 160px)));
  }
  .gb-orbit-dot:nth-child(8n)   { background: #FF5F1F; box-shadow: 0 0 10px #FF5F1F; }
  .gb-orbit-dot:nth-child(8n+1) { background: #E91E8C; box-shadow: 0 0 10px #E91E8C; }
  .gb-orbit-dot:nth-child(8n+2) { background: #00D4AA; box-shadow: 0 0 10px #00D4AA; }
  .gb-orbit-dot:nth-child(8n+3) { background: #A259FF; box-shadow: 0 0 10px #A259FF; }
  .gb-orbit-dot:nth-child(8n+4) { background: #FFD700; box-shadow: 0 0 10px #FFD700; }
  .gb-orbit-dot:nth-child(8n+5) { background: #FF5F1F; box-shadow: 0 0 10px #FF5F1F; }
  .gb-orbit-dot:nth-child(8n+6) { background: #E91E8C; box-shadow: 0 0 10px #E91E8C; }
  .gb-orbit-dot:nth-child(8n+7) { background: #00D4AA; box-shadow: 0 0 10px #00D4AA; }

  /* Platform strip */
  .gb-about-platform-strip { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .gb-plat-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 100px;
    font-size: .76rem; font-weight: 700; letter-spacing: .06em;
    text-decoration: none; white-space: nowrap;
    color: var(--text);
    border: 1.5px solid var(--pill-color, #FF5F1F);
    background: color-mix(in srgb, var(--pill-color, #FF5F1F) 8%, transparent);
    transition: background .22s, transform .22s, box-shadow .22s;
  }
  .gb-plat-pill:hover {
    background: color-mix(in srgb, var(--pill-color, #FF5F1F) 18%, transparent);
    box-shadow: 0 4px 18px color-mix(in srgb, var(--pill-color, #FF5F1F) 35%, transparent);
    transform: translateY(-2px);
  }
  .gb-plat-icon { font-size: .8rem; }

  /* About copy */
  .gb-about-eyebrow {
    font-size: .78rem; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: #FF5F1F; margin: 0 0 14px;
  }
  .gb-about-name {
    font-size: clamp(2rem, 5vw, 3.8rem); font-weight: 900; line-height: 1.05; margin: 0 0 10px;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C, #A259FF);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .gb-about-role { font-size: .95rem; color: var(--muted); margin: 0 0 20px; font-weight: 500; }
  .gb-about-bio { font-size: .97rem; line-height: 1.8; color: var(--text); opacity: .88; margin: 0 0 22px; }
  .gb-about-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
  .gb-tag {
    padding: 6px 14px; border-radius: 100px;
    font-size: .72rem; font-weight: 700; letter-spacing: .08em;
    border: 1px solid rgba(255,95,31,.3);
    color: var(--muted); text-transform: uppercase;
    background: rgba(255,95,31,.06);
  }

  /* ─────────────────── MILESTONES ─────────────────── */
  .gb-milestones { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .gb-mile {
    display: grid; grid-template-columns: 80px 24px 1fr; gap: 10px; align-items: start;
  }
  .gb-mile--odd { direction: ltr; }

  .gb-mile-year-wrap { text-align: right; }
  .gb-mile-year {
    font-size: 1.4rem; font-weight: 900; line-height: 1;
    color: var(--mile-color, #FF5F1F);
    text-shadow: 0 0 20px var(--mile-color, #FF5F1F);
  }

  .gb-mile-connector { display: flex; flex-direction: column; align-items: center; }
  .gb-mile-dot {
    width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 6px;
    background: var(--mile-color, #FF5F1F);
    box-shadow: 0 0 16px var(--mile-color, #FF5F1F);
  }
  .gb-mile-line {
    flex: 1; width: 1px; margin-top: 6px;
    background: linear-gradient(180deg, var(--mile-color, #FF5F1F), transparent);
    min-height: 30px;
  }

  .gb-mile-card {
    background: var(--panel-solid);
    border: 1px solid var(--line);
    border-left: 3px solid var(--mile-color, #FF5F1F);
    border-radius: 0 12px 12px 0;
    padding: 16px 18px 20px;
    transition: box-shadow .22s;
  }
  .gb-mile-card:hover {
    box-shadow: 0 8px 28px rgba(0,0,0,.25), 0 0 20px rgba(255,95,31,.1);
  }
  .gb-mile-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 8px; }
  .gb-mile-desc { font-size: .88rem; line-height: 1.7; color: var(--muted); margin: 0; }

  /* ─────────────────── PLATFORMS GRID ─────────────────── */
  .gb-platforms-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: clamp(12px, 1.5vw, 18px);
  }
  .gb-platform-card {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 20px; border-radius: 12px; text-decoration: none; color: var(--text);
    background: var(--panel-solid);
    border: 1px solid var(--line);
    border-left: 3px solid var(--pc-color, #FF5F1F);
    transition: transform .22s, box-shadow .22s, border-color .22s;
  }
  .gb-platform-card:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 28px rgba(0,0,0,.2);
    border-color: var(--pc-color, #FF5F1F);
  }
  .gb-platform-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .gb-platform-name { display: block; font-weight: 700; font-size: .92rem; }
  .gb-platform-desc { display: block; font-size: .75rem; color: var(--muted); margin-top: 2px; }
  .gb-platform-arrow { margin-left: auto; color: var(--pc-color, #FF5F1F); font-size: 1.1rem; opacity: .5; }

  /* ─────────────────── CLOSING ─────────────────── */
  .gb-closing {
    text-align: center;
    padding: clamp(70px,10vh,120px) clamp(20px,6vw,80px);
    margin-top: clamp(60px,9vh,100px);
    background: radial-gradient(ellipse 70% 80% at 50% 50%,
      rgba(255,95,31,.08), rgba(233,30,140,.05), transparent 70%);
    border-top: 1px solid var(--line);
  }
  .gb-closing-deco {
    display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 28px;
  }
  .gb-closing-diamond {
    display: inline-block; width: 10px; height: 10px; border-radius: 2px;
    background: linear-gradient(45deg, #FF5F1F, #E91E8C);
    transform: rotate(45deg);
    box-shadow: 0 0 12px rgba(255,95,31,.6);
  }
  .gb-closing-line {
    display: inline-block; width: clamp(60px, 12vw, 120px); height: 1px; margin: 0 14px;
    background: linear-gradient(90deg, transparent, #FF5F1F, #E91E8C, transparent);
  }
  .gb-closing-quote {
    font-size: clamp(1.2rem, 3vw, 2rem); font-style: italic; font-weight: 700;
    max-width: 36ch; margin: 0 auto 16px;
    background: linear-gradient(120deg, #FF5F1F, #E91E8C, #A259FF);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    line-height: 1.5;
  }
  .gb-closing-by { color: var(--muted); font-size: .95rem; margin: 0 0 32px; }
  .gb-closing-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  /* ─────────────────── NAV overrides ─────────────────── */
  [data-theme-skin='garba'] .site-nav:not(.scrolled) {
    background: linear-gradient(180deg, rgba(5,4,26,.55) 0%, transparent 100%);
  }
  [data-theme-skin='garba'] .site-nav:not(.scrolled) .nav-logo,
  [data-theme-skin='garba'] .site-nav:not(.scrolled) .nav-link {
    color: rgba(255,255,255,.88);
    text-shadow: 0 1px 12px rgba(0,0,0,.5);
  }
  [data-theme-skin='garba'] .site-nav:not(.scrolled) .nav-logo .accent { color: #FF5F1F; }
  [data-theme-skin='garba'] .site-nav:not(.scrolled) .burger-line { background: rgba(255,255,255,.88); }

  /* ─────────────────── RESPONSIVE ─────────────────── */
  @media (max-width: 900px) {
    .gb-songs-grid    { grid-template-columns: repeat(2, 1fr); }
    .gb-about         { grid-template-columns: 1fr; }
    .gb-about-portrait-wrap { flex-direction: row; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
    .gb-milestones    { grid-template-columns: 1fr; }
    .gb-platforms-grid { grid-template-columns: repeat(2, 1fr); }
    .gb-seclink       { position: static; transform: none; margin-top: 6px; }
  }
  @media (max-width: 640px) {
    .gb-songs-grid    { grid-template-columns: 1fr; }
    .gb-videos        { grid-template-columns: 1fr; }
    .gb-platforms-grid { grid-template-columns: 1fr; }
    .gb-about-portrait-wrap { flex-direction: column; align-items: center; }
    .gb-portrait { width: clamp(180px,60vw,260px); height: clamp(180px,60vw,260px); }
    .gb-hero-stats { gap: 14px; }
    .gb-mile { grid-template-columns: 60px 20px 1fr; }
    .gb-mile-year { font-size: 1.1rem; }
  }
`;
