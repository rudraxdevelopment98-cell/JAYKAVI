import Link from 'next/link';
import { getLyricist, getAllSongs, getSocial, type TraditionalSettings } from '@/lib/data';
import type { Song } from '@/lib/types';

function safeUrl(u?: string | null): string | null {
  if (!u) return null;
  try { const p = new URL(u).protocol; return p === 'https:' || p === 'http:' ? u : null; }
  catch { return null; }
}

/* ── Library-themed SVG icons ─────────────────────────────────── */
function BookOpen() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 6c0-1.1.9-2 2-2h5a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4a2 2 0 0 1-2-2V6z"/>
      <path d="M22 6c0-1.1-.9-2-2-2h-5a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h6a2 2 0 0 0 2-2V6z"/>
    </svg>
  );
}
function Scroll() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 21h12a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4z"/>
      <path d="M19 17V5a2 2 0 0 0-2-2H4"/>
      <path d="M4 3a2 2 0 0 0-2 2v13.5"/>
      <path d="M4 3a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}
function Quill() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 3c-1.5 1.5-3 3-3 7H5s1-5 5-7h10z"/>
      <path d="M17 10c0 4-7 11-7 11s-.5-2-1-4"/>
      <path d="M6 17c-1 1-2 3-2 4"/>
    </svg>
  );
}
function MusicNote() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
}
function Play() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function YouTube() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#E0231C"/>
      <path d="M10 9l5 3-5 3z" fill="#fff"/>
    </svg>
  );
}

function SectionHead({ tag, title, center }: { tag: string; title: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 32 }}>
      <span className="trad-eyebrow">{tag}</span>
      <h2 className="font-serif trad-gold-text th-section-title">{title}</h2>
      <div className="trad-divider" style={center ? undefined : { justifyContent: 'flex-start' }}>❖</div>
    </div>
  );
}

export default async function TraditionalHome({ settings }: { settings: TraditionalSettings }) {
  const [l, songs, social] = await Promise.all([
    getLyricist(),
    getAllSongs(),
    getSocial(),
  ]);

  const name = l.displayName ?? l.name;
  const nameParts = name.split(' ');
  const firstWord = nameParts[0];
  const restWords = nameParts.slice(1).join(' ');

  const bhajans = songs.slice(0, 8);
  const videos = songs.filter((s) => s.embed?.youtubeId).slice(0, 4);
  const ytVideos = videos.length ? videos : bhajans.slice(0, 4);
  const youtubeUrl = social.youtube || 'https://www.youtube.com';
  const firstSong = bhajans[0];

  const portraitUrl  = safeUrl(settings.heroPortrait);
  const deityUrl     = safeUrl(settings.heroDeity);
  const heroBgUrl    = safeUrl(settings.heroBg);
  const heroBgVideo  = safeUrl(settings.heroBgVideo);
  const bgFilter     = `blur(${settings.heroBgBlur}px) brightness(${settings.heroBgBright}%)`;
  const bgOpacity    = settings.heroBgOpacity / 100;
  const overlayAlpha = settings.heroOverlay / 100;

  const featureIcons = [<BookOpen key="book" />, <MusicNote key="music" />, <Scroll key="scroll" />, <Quill key="quill" />];
  const features = settings.features.map((f, i) => ({ icon: featureIcons[i], t: f.title, d: f.desc }));

  const stats: string[] = [
    songs.length > 0 ? `${songs.length}+ ભજન` : '',
    l.languages?.length ? l.languages.slice(0, 2).join(' · ') : '',
    l.careerStartYear ? `Since ${l.careerStartYear}` : '',
  ].filter(Boolean);

  return (
    <div className="th-root">

      {/* ══════════════ HERO — Library title page ══════════════ */}
      <header className="th-hero">
        {heroBgVideo ? (
          <video
            src={heroBgVideo}
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', filter: bgFilter, opacity: bgOpacity,
              transform: 'scale(1.05)',
            }}
          />
        ) : heroBgUrl ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${heroBgUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: bgFilter, opacity: bgOpacity,
          }} />
        ) : null}
        {(heroBgVideo || heroBgUrl) && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom right, rgba(10,7,4,${overlayAlpha}) 0%, rgba(8,6,3,${overlayAlpha * 0.88}) 100%)`,
          }} />
        )}
        <div className="th-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
          <p className="th-mantra">{settings.mantra}</p>
          <h1 className="font-serif th-name">
            {firstWord && <span className="th-name-first">{firstWord}</span>}
            {restWords && <span className="th-name-rest trad-gold-text">{restWords}</span>}
          </h1>
          <p className="th-tagline">{l.tagline}</p>

          {stats.length > 0 && (
            <div className="th-stats">
              {stats.map((s, i) => <span key={i}>{s}</span>)}
            </div>
          )}

          <div className="th-hero-ctas">
            <Link href="/songs" className="th-cta-primary">
              Browse Collection
            </Link>
            <Link href="/about" className="th-cta-ghost">
              About the Lyricist
            </Link>
          </div>
        </div>

        {/* Portrait shown on tablet/desktop when provided */}
        {portraitUrl && (
          <div className="th-hero-portrait" aria-hidden>
            <img src={portraitUrl} alt={name} />
          </div>
        )}

        <div className="th-hero-scallop" aria-hidden />
      </header>

      {/* ══════════════ COLLECTION — Catalog grid ══════════════ */}
      <section className="th-section">
        <SectionHead tag="The Collection" title="ભજન સંગ્રહ" />
        <div className="th-catalog">
          {bhajans.map((s) => (
            <CatalogCard key={s.id} song={s} lyricist={name} />
          ))}
        </div>
        <div className="th-section-footer">
          <Link href="/songs" className="th-btn-outline">
            View Full Catalog <ChevronRight />
          </Link>
        </div>
      </section>

      {/* ══════════════ ABOUT — Author profile ══════════════ */}
      <section className="th-section th-about-section">
        {/* Portrait side */}
        <div className="th-about-visual">
          {portraitUrl ? (
            <img src={portraitUrl} alt={name} className="th-about-photo" />
          ) : deityUrl ? (
            <img src={deityUrl} alt="Devotional art" className="th-about-photo" />
          ) : (
            <div className="th-about-placeholder">
              <BookOpen />
            </div>
          )}
        </div>

        {/* Bio side */}
        <div className="th-about-body">
          <span className="trad-eyebrow">About the Lyricist</span>
          <h2 className="font-serif trad-gold-text th-about-name">{name}</h2>
          {l.title && <p className="th-about-title">{l.title}</p>}
          <p className="th-about-bio">{l.bio}</p>

          <div className="th-features">
            {features.map((f) => (
              <div key={f.t} className="th-feature">
                <span className="th-feature-icon">{f.icon}</span>
                <div>
                  <div className="font-serif th-feature-title">{f.t}</div>
                  <div className="th-feature-desc">{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/about" className="th-btn-outline">
            Read Full Biography <ChevronRight />
          </Link>
        </div>
      </section>

      {/* ══════════════ WATCH & LISTEN ══════════════ */}
      {ytVideos.length > 0 && (
        <section className="th-section">
          <div className="th-vl-head">
            <SectionHead tag="Watch &amp; Listen" title="ભક્તિ ગીતો" />
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="th-yt-badge"
            >
              <YouTube /> YouTube Channel ↗
            </a>
          </div>
          <div className="th-video-grid">
            {ytVideos.map((s) => (
              <VideoCard key={s.id} song={s} />
            ))}
          </div>
          <div className="th-section-footer">
            <Link href="/songs" className="th-btn-outline">
              Browse All Songs <ChevronRight />
            </Link>
          </div>
        </section>
      )}

      <TraditionalHomeStyles />
    </div>
  );
}

/* ── Catalog card — library index-card style ─────────────────── */
function CatalogCard({ song, lyricist }: { song: Song; lyricist: string }) {
  const art = safeUrl(song.artworkUrl);
  const genre = song.genre?.[0];
  const singer = song.performingSingers?.[0] || lyricist;
  return (
    <Link href={`/songs/${song.slug}`} className="th-catalog-card">
      <div
        className={`th-catalog-art${art ? '' : ' sc-art-fallback'}`}
        style={art ? { backgroundImage: `url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <span className="th-catalog-play"><Play /></span>
        {song.isTrending && <span className="th-catalog-badge">Trending</span>}
      </div>
      <div className="th-catalog-body">
        {genre && <span className="th-catalog-genre">{genre}</span>}
        <div className="font-serif th-catalog-title">{song.title}</div>
        <div className="th-catalog-sub">
          {singer}
          {song.releaseYear && <> · {song.releaseYear}</>}
        </div>
      </div>
    </Link>
  );
}

/* ── Video card ───────────────────────────────────────────────── */
function VideoCard({ song }: { song: Song }) {
  const art = safeUrl(song.artworkUrl);
  return (
    <Link href={`/songs/${song.slug}`} className="th-vid-card">
      <div
        className={`th-vid-thumb${art ? '' : ' sc-art-fallback'}`}
        style={art ? { backgroundImage: `url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <span className="th-play-dot"><Play /></span>
      </div>
      <p className="font-serif th-vid-title">{song.title}</p>
    </Link>
  );
}

/* ── Scoped CSS for the traditional homepage ─────────────────── */
function TraditionalHomeStyles() {
  return (
    <style>{`
      .th-root { position: relative; z-index: 2; }

      /* ── HERO (mobile-first) ── */
      .th-hero {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100svh;
        padding: 90px 24px 70px;
        background: var(--hero-grad);
        overflow: hidden;
        text-align: center;
      }
      .th-hero-inner {
        position: relative; z-index: 3;
        max-width: 540px; width: 100%;
      }
      .th-mantra {
        font-size: .82rem; letter-spacing: .28em;
        color: var(--gold); font-weight: 500;
        margin: 0 0 28px; text-transform: uppercase;
        display: flex; align-items: center; justify-content: center; gap: 16px;
      }
      .th-mantra::before, .th-mantra::after {
        content: ''; display: block; height: 1px;
        flex: 0 0 32px; background: var(--gold); opacity: .55;
      }
      .th-name {
        font-size: clamp(2.4rem, 11vw, 6.5rem);
        font-weight: 300; line-height: 1.06;
        margin: 0 0 18px; letter-spacing: -.03em;
        word-break: break-word;
      }
      .th-name-first { display: block; color: var(--text); }
      .th-name-rest  { display: block; }
      .th-tagline {
        font-family: var(--font-hanken), system-ui, sans-serif;
        font-weight: 300; letter-spacing: .02em;
        font-size: clamp(.92rem, 3vw, 1.1rem);
        color: var(--muted); margin: 0 0 28px; line-height: 1.9;
      }
      .th-stats {
        display: flex; flex-wrap: wrap; gap: 8px;
        justify-content: center; margin: 0 0 36px;
      }
      .th-stats span {
        font-size: .76rem; color: var(--muted);
        padding: 5px 14px; border-radius: 100px;
        border: 1px solid var(--gold-line); white-space: nowrap;
      }
      .th-hero-ctas {
        display: flex; flex-direction: column; gap: 12px;
        align-items: stretch; width: 100%; max-width: 320px;
        margin: 0 auto;
      }
      .th-cta-primary {
        display: flex; align-items: center; justify-content: center;
        padding: 17px 28px; border-radius: 14px;
        background: linear-gradient(120deg, var(--gold-soft), var(--gold));
        color: #1a1200; font-weight: 700; font-size: .9rem;
        letter-spacing: .06em; text-decoration: none;
        box-shadow: 0 8px 28px rgba(212,175,55,.35);
        transition: transform .22s, box-shadow .22s;
        min-height: 52px;
      }
      .th-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(212,175,55,.45); }
      .th-cta-ghost {
        display: flex; align-items: center; justify-content: center;
        padding: 16px 28px; border-radius: 14px;
        border: 1px solid var(--gold-line); color: var(--muted);
        font-size: .88rem; text-decoration: none;
        min-height: 52px; transition: background .22s, color .22s;
      }
      .th-cta-ghost:hover { background: rgba(212,175,55,.08); color: var(--text); }

      /* portrait — hidden on phones, shown on tablet/desktop */
      .th-hero-portrait { display: none; flex-shrink: 0; position: relative; z-index: 2; }
      .th-hero-portrait img {
        width: clamp(200px,28vw,320px); height: auto; aspect-ratio: 3/4;
        object-fit: cover; border-radius: 20px;
        border: 2px solid var(--gold-line);
        box-shadow: 0 24px 64px rgba(0,0,0,.55);
      }

      /* scallop bottom edge */
      .th-hero-scallop {
        position: absolute; bottom: -2px; left: 0; right: 0; height: 60px;
        background: radial-gradient(circle at 30px -18px, transparent 30px, var(--bg) 31px) repeat-x;
        background-size: 60px 60px;
      }

      /* ── SECTIONS ── */
      .th-section {
        padding: clamp(44px,7vh,80px) clamp(20px,5vw,64px);
        max-width: 1200px; margin: 0 auto;
      }
      .th-section-title {
        font-size: clamp(1.7rem,5vw,2.8rem); font-weight: 700; margin: 4px 0 0;
      }
      .th-section-footer { text-align: center; margin-top: 36px; }

      /* ── CATALOG GRID (mobile: 2 col) ── */
      .th-catalog {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      .th-catalog-card {
        display: flex; flex-direction: column;
        border-radius: 14px; overflow: hidden;
        border: 1px solid var(--gold-line);
        background: var(--panel-solid);
        text-decoration: none;
        transition: transform .28s, box-shadow .28s;
      }
      .th-catalog-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.3); }
      .th-catalog-art {
        aspect-ratio: 16 / 9;
        background-size: cover; background-position: center;
        background-color: var(--panel-solid);
        display: grid; place-items: center; position: relative;
      }
      .th-catalog-play {
        width: 38px; height: 38px; border-radius: 50%;
        background: rgba(212,175,55,.9); color: #1a1200;
        display: grid; place-items: center;
        box-shadow: 0 4px 14px rgba(0,0,0,.45);
        transition: transform .2s;
      }
      .th-catalog-card:hover .th-catalog-play { transform: scale(1.1); }
      .th-catalog-badge {
        position: absolute; top: 8px; right: 8px;
        font-size: .65rem; font-weight: 700; letter-spacing: .06em;
        background: var(--gold); color: #1a1200;
        padding: 2px 8px; border-radius: 100px;
      }
      .th-catalog-body { padding: 11px 13px 15px; }
      .th-catalog-genre {
        display: inline-block; font-size: .66rem; font-weight: 600;
        letter-spacing: .08em; padding: 2px 8px; border-radius: 100px;
        color: var(--gold); border: 1px solid var(--gold-line);
        margin-bottom: 7px; text-transform: uppercase;
      }
      .th-catalog-title {
        font-size: .92rem; font-weight: 600; color: var(--text);
        line-height: 1.35; margin-bottom: 5px;
        display: -webkit-box; -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden;
      }
      .th-catalog-sub { font-size: .72rem; color: var(--muted); }

      /* ── ABOUT ── */
      .th-about-section {
        display: grid; grid-template-columns: 1fr; gap: 36px;
      }
      .th-about-visual { display: flex; justify-content: center; }
      .th-about-photo {
        width: min(200px, 52vw); height: auto; aspect-ratio: 3/4;
        object-fit: cover; border-radius: 18px;
        border: 2px solid var(--gold-line);
        box-shadow: 0 20px 60px rgba(0,0,0,.45);
      }
      .th-about-placeholder {
        width: min(180px, 48vw); aspect-ratio: 3/4;
        border-radius: 18px; border: 2px solid var(--gold-line);
        display: grid; place-items: center; color: var(--gold);
        background: var(--panel-solid); opacity: .6;
      }
      .th-about-name { font-size: clamp(1.7rem,5vw,2.4rem); font-weight: 700; margin: 6px 0 8px; }
      .th-about-title { color: var(--gold-soft); font-size: .88rem; margin: 0 0 14px; font-style: italic; }
      .th-about-bio { color: var(--muted); line-height: 1.85; font-size: .97rem; margin: 0 0 24px; }
      .th-features { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 0 0 28px; }
      .th-feature { display: flex; gap: 12px; align-items: flex-start; }
      .th-feature-icon { color: var(--gold); flex-shrink: 0; margin-top: 2px; }
      .th-feature-title { font-size: .98rem; font-weight: 600; color: var(--text); }
      .th-feature-desc { color: var(--muted); font-size: .79rem; margin-top: 3px; line-height: 1.5; }

      /* ── SHARED BUTTON ── */
      .th-btn-outline {
        display: inline-flex; align-items: center; gap: 6px;
        text-decoration: none; color: var(--gold);
        border: 1px solid var(--gold); padding: 13px 26px; border-radius: 12px;
        font-size: .82rem; font-weight: 700; letter-spacing: .07em;
        transition: background .22s, color .22s; min-height: 48px;
      }
      .th-btn-outline:hover { background: var(--gold); color: #1a1200; }

      /* ── VIDEO SECTION ── */
      .th-vl-head { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
      .th-yt-badge {
        display: inline-flex; align-items: center; gap: 7px;
        text-decoration: none; font-size: .78rem; font-weight: 600;
        color: var(--muted); border: 1px solid var(--line);
        padding: 8px 16px; border-radius: 100px;
        transition: background .2s, color .2s; white-space: nowrap; flex-shrink: 0;
        margin-top: 4px;
      }
      .th-yt-badge:hover { background: rgba(212,175,55,.08); color: var(--text); }
      .th-video-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
      }
      .th-vid-card { text-decoration: none; }
      .th-vid-thumb {
        aspect-ratio: 16 / 9; border-radius: 14px;
        background-size: cover; background-position: center;
        background-color: var(--panel-solid);
        display: grid; place-items: center;
        border: 1px solid var(--gold-line); margin-bottom: 10px;
        transition: transform .25s;
        overflow: hidden;
      }
      .th-vid-card:hover .th-vid-thumb { transform: scale(1.02); }
      .th-play-dot {
        width: 44px; height: 44px; border-radius: 50%;
        display: grid; place-items: center;
        background: rgba(212,175,55,.9); color: #1a1200;
        box-shadow: 0 6px 18px rgba(0,0,0,.4);
      }
      .th-vid-title {
        font-size: .85rem; color: var(--text);
        line-height: 1.35; text-align: center;
        display: -webkit-box; -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden;
        padding: 0 4px;
      }

      /* ── TABLET: 640px ── */
      @media (min-width: 640px) {
        .th-hero { padding: 100px 48px 80px; }
        .th-hero-ctas { flex-direction: row; width: auto; max-width: none; margin: 0 auto; }
        .th-cta-primary, .th-cta-ghost { min-width: 200px; }
        .th-catalog { grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .th-about-section { grid-template-columns: 220px 1fr; align-items: start; gap: 48px; }
        .th-about-visual { justify-content: flex-start; }
        .th-about-photo { width: 220px; }
        .th-video-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
      }

      /* ── DESKTOP: 1024px ── */
      @media (min-width: 1024px) {
        .th-hero {
          flex-direction: row; gap: 60px; text-align: left;
          justify-content: center; min-height: 88svh;
          padding: 120px 8vw 80px;
        }
        .th-hero-inner { max-width: 500px; }
        .th-hero-ctas { justify-content: flex-start; margin: 0; }
        .th-mantra { text-align: left; }
        .th-stats { justify-content: flex-start; }
        .th-hero-portrait { display: block; }
        .th-catalog { grid-template-columns: repeat(4, 1fr); }
        .th-about-section { grid-template-columns: 260px 1fr; gap: 64px; }
        .th-about-photo { width: 260px; }
        .th-features { grid-template-columns: 1fr 1fr; }
        .th-video-grid { grid-template-columns: repeat(4, 1fr); }
      }
    `}</style>
  );
}
