import Link from 'next/link';
import { getLyricist, getAllSongs, getSocial } from '@/lib/data';
import type { Song } from '@/lib/types';

// Only allow http/https artwork URLs to be interpolated into CSS backgrounds.
function safeUrl(u?: string | null): string | null {
  if (!u) return null;
  try {
    const p = new URL(u).protocol;
    return p === 'https:' || p === 'http:' ? u : null;
  } catch {
    return null;
  }
}

/* ── Inline ornamental icons ─────────────────────────────────────── */
function Lotus() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21c4 0 7-2.5 7-5 0-1-3 .5-3 .5S15 12 12 12s-4 4.5-4 4.5-3-1.5-3-.5c0 2.5 3 5 7 5z" />
      <path d="M12 12c0-3 0-7 0-9-2 2-3 5-3 7M12 12c0-3 0-7 0-9 2 2 3 5 3 7" />
    </svg>
  );
}
function MusicNote() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h3V3z" />
    </svg>
  );
}
function Temple() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l3 4H9l3-4zM5 10h14M6 10v9M18 10v9M10 10v9M14 10v9M4 22h16M4 19h16" />
    </svg>
  );
}
function Hands() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3c1 2 1 4 1 6M7 21c-2-2-3-5-3-8 0-1.5 2-1.5 2 0M17 21c2-2 3-5 3-8 0-1.5-2-1.5-2 0" />
      <path d="M9 13c0-2 0-3 1-3s1 1 1 3M15 13c0-2 0-3-1-3s-1 1-1 3" />
    </svg>
  );
}
function Play() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function YouTube() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#E0231C" />
      <path d="M10 9l5 3-5 3z" fill="#fff" />
    </svg>
  );
}
function Om() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity=".5" aria-hidden>
      <path d="M7 14c-2 0-3-1.5-3-3s1.5-3 3-3 2 1 2 2-1 2-2 2M9 12c1-2 3-3 5-3 2 0 3 1.5 3 3.5S15 16 13 16M16 6c1-.5 2 0 2 1M14 4a3 3 0 0 1 3 3" />
    </svg>
  );
}

/* ── Decorative double-bell, CSS chain via inline style ──────────── */
function Bell({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`th-bell th-bell-${side}`} aria-hidden>
      <span className="th-chain" />
      <span className="th-bell-body" />
    </div>
  );
}

function SectionHead({ tag, title, center }: { tag: string; title: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 34 }}>
      <span className="trad-eyebrow">{tag}</span>
      <h2 className="font-serif trad-gold-text th-section-title">{title}</h2>
      {center && <div className="trad-divider">❖</div>}
    </div>
  );
}

export default async function TraditionalHome() {
  const [l, songs, social] = await Promise.all([
    getLyricist(),
    getAllSongs(),
    getSocial(),
  ]);

  const name = l.displayName ?? l.name;
  const bhajans = songs.slice(0, 8);
  const videos = songs.filter((s) => s.embed?.youtubeId).slice(0, 6);
  const ytVideos = videos.length ? videos : bhajans;
  const youtubeUrl = social.youtube || 'https://www.youtube.com';
  const firstSong = bhajans[0];
  const philosophy = l.philosophy || 'સંગીત એ સાધના છે, અને ભજન એ આત્માની ભાષા છે.';

  const features = [
    { icon: <Lotus />, t: 'ભક્તિ', d: 'શુદ્ધ ભાવ અને શ્રદ્ધા' },
    { icon: <MusicNote />, t: 'સંગીત', d: 'સુરોથી સર્જાયેલ ભક્તિ' },
    { icon: <Temple />, t: 'સંસ્કૃતિ', d: 'ગુજરાતી સંસ્કૃતિનો સંગમ' },
    { icon: <Hands />, t: 'સેવા', d: 'સંગીત દ્વારા સેવા અને સમર્પણ' },
  ];

  const lyricCards = [
    { t: 'ભજન લિરિક્સ', d: 'પ્રતિ એક ભજનના લિરિક્સ અહીં વાંચો.' },
    { t: 'કવિતા સંગ્રહ', d: 'ભક્તિ, પ્રેમ અને જીવન પર આધારિત કવિતાઓ.' },
    { t: 'સંદેશ', d: 'પ્રેરણાદાયક વિચારો અને જીવન માર્ગદર્શન.' },
  ];

  return (
    <div className="th-root">
      {/* ════════ HERO ════════ */}
      <header className="th-hero">
        <Bell side="left" />
        <Bell side="right" />

        {/* flanking ornamental art panels */}
        <div className="th-hero-art th-hero-art-left" aria-hidden>
          <div className="th-arch"><Om /></div>
        </div>

        <div className="th-hero-center">
          <p className="th-mantra">॥ જય શ્રી કૃષ્ણ ॥</p>
          <div className="trad-divider">❖</div>
          <h1 className="font-serif th-name">
            {l.name.split(' ').map((w, i) => (
              <span key={i} className={i === 0 ? 'th-name-first trad-gold-text' : 'th-name-rest'}>
                {w}{' '}
              </span>
            ))}
          </h1>
          <p className="th-tagline">{l.tagline}</p>
          <Link href={firstSong ? `/songs/${firstSong.slug}` : '/songs'} className="th-listen">
            <span className="th-listen-play"><Play /></span>
            LISTEN NOW
          </Link>
        </div>

        <div className="th-hero-art th-hero-art-right" aria-hidden>
          <div className="th-arch th-arch-deity"><Lotus /></div>
        </div>

        <div className="th-hero-scallop" aria-hidden />
      </header>

      {/* ════════ ABOUT ════════ */}
      <section className="th-section th-about">
        <div className="th-about-portrait" aria-hidden>
          <div className="th-arch th-arch-sm"><MusicNote /></div>
        </div>
        <div className="th-about-body">
          <span className="trad-eyebrow">ABOUT</span>
          <h2 className="font-serif trad-gold-text th-about-name">{name}</h2>
          <p className="th-about-bio">{l.bio}</p>
          <Link href="/about" className="th-readmore">READ MORE ✍</Link>
        </div>
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
      </section>

      {/* ════════ BHAJANS COLLECTION ════════ */}
      <section className="th-section">
        <SectionHead center tag="Bhajans Collection" title="ગુજરાતી ભજનો" />
        <div className="trad-scroll">
          {bhajans.map((s) => (
            <BhajanCard key={s.id} song={s} name={name} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link href="/songs" className="th-pill-btn">VIEW ALL BHAJANS</Link>
        </div>
      </section>

      {/* ════════ VIDEO + LYRICS ════════ */}
      <section className="th-section th-vl">
        {/* Video gallery */}
        <div className="trad-card th-panel">
          <div className="th-panel-head">
            <div>
              <span className="trad-eyebrow">Video Gallery</span>
              <h3 className="font-serif trad-gold-text th-panel-title">ભક્તિના દર્શન</h3>
            </div>
            <Link href="/songs" className="th-mini-btn">VIEW ALL</Link>
          </div>
          <div className="th-video-grid">
            {ytVideos.slice(0, 3).map((s) => (
              <Link key={s.id} href={`/songs/${s.slug}`} className="th-video">
                <div
                  className="th-video-thumb"
                  style={safeUrl(s.artworkUrl) ? { backgroundImage: `url(${s.artworkUrl})` } : undefined}
                >
                  <span className="th-play-dot"><Play /></span>
                </div>
                <span className="th-video-title">{s.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Lyrics & poetry */}
        <div className="trad-card th-panel">
          <div className="th-panel-head">
            <div>
              <span className="trad-eyebrow">Lyrics &amp; Poetry</span>
              <h3 className="font-serif trad-gold-text th-panel-title">શબ્દો જે સ્પર્શે છે આત્માને</h3>
            </div>
            <Link href="/lyrics" className="th-mini-btn">VIEW ALL</Link>
          </div>
          <div className="th-lyric-grid">
            {lyricCards.map((c) => (
              <Link key={c.t} href="/lyrics" className="th-lyric-card">
                <span className="th-lyric-icon"><Lotus /></span>
                <div className="font-serif th-lyric-title">{c.t}</div>
                <div className="th-lyric-desc">{c.d}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ YOUTUBE MUSIC ════════ */}
      <section className="th-section">
        <div className="trad-card th-yt">
          <div className="th-yt-head">
            <span className="th-yt-icon"><YouTube /></span>
            <div>
              <div className="font-serif th-yt-title">YOUTUBE MUSIC</div>
              <div className="th-yt-sub">સાંભળો હવે અમારી ચેનલ પર</div>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="th-pill-btn th-yt-btn">
                VISIT CHANNEL ▶
              </a>
            </div>
          </div>
          <div className="trad-scroll th-yt-scroll">
            {ytVideos.slice(0, 6).map((s) => (
              <Link key={s.id} href={`/songs/${s.slug}`} className="th-yt-vid">
                <div
                  className="th-video-thumb"
                  style={safeUrl(s.artworkUrl) ? { backgroundImage: `url(${s.artworkUrl})` } : undefined}
                >
                  <span className="th-play-dot"><Play /></span>
                </div>
                <span className="th-video-title">{s.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TraditionalHomeStyles philosophy={philosophy} />
    </div>
  );
}

function BhajanCard({ song, name }: { song: Song; name: string }) {
  const art = safeUrl(song.artworkUrl);
  return (
    <Link href={`/songs/${song.slug}`} className="th-bhajan h-scroll-item">
      <div className="th-bhajan-card trad-card">
        <div className="th-bhajan-art" style={art ? { backgroundImage: `url(${art})` } : undefined}>
          <span className="th-play-dot th-play-lg"><Play /></span>
        </div>
        <div className="th-bhajan-meta">
          <div className="font-serif th-bhajan-title">{song.title}</div>
          <div className="th-bhajan-sub">{name}</div>
        </div>
      </div>
    </Link>
  );
}

/* Scoped styles for the traditional homepage. */
function TraditionalHomeStyles({ philosophy }: { philosophy: string }) {
  return (
    <style>{`
      .th-root { position: relative; z-index: 2; }
      .th-section { padding: clamp(48px,7vh,90px) clamp(20px,6vw,80px); max-width: 1180px; margin: 0 auto; }
      .th-section-title { font-size: clamp(1.8rem,4vw,2.8rem); font-weight: 700; margin: 6px 0 0; }

      /* ── HERO ── */
      .th-hero {
        position: relative; min-height: 92svh; display: grid;
        grid-template-columns: 1fr minmax(0,640px) 1fr; align-items: center;
        gap: 20px; padding: 120px 5vw 90px; background: var(--hero-grad); overflow: hidden;
      }
      .th-hero-center { text-align: center; position: relative; z-index: 3; }
      .th-mantra { color: var(--gold); letter-spacing: .22em; font-size: clamp(.9rem,2vw,1.15rem); font-weight: 600; margin: 0; }
      .th-name { font-weight: 700; line-height: .98; margin: 6px 0 0; font-size: clamp(2.6rem,9vw,6rem); letter-spacing: -.01em; }
      .th-name-rest { color: var(--text); }
      .th-tagline { color: var(--gold-soft); font-size: clamp(1rem,2vw,1.35rem); margin: 18px 0 30px; font-family: var(--font-fraunces), serif; }
      .th-listen {
        display: inline-flex; align-items: center; gap: 12px;
        padding: 13px 28px 13px 14px; border-radius: 100px; text-decoration: none;
        font-weight: 700; letter-spacing: .12em; font-size: .82rem; color: #1a1200;
        background: linear-gradient(120deg, var(--gold-soft), var(--gold));
        box-shadow: 0 10px 30px rgba(212,175,55,.4); transition: transform .25s;
      }
      .th-listen:hover { transform: translateY(-2px); }
      .th-listen-play {
        width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
        background: rgba(26,18,0,.85); color: var(--gold);
      }

      /* flanking arch art */
      .th-hero-art { display: grid; place-items: center; position: relative; z-index: 2; }
      .th-arch {
        width: clamp(150px, 18vw, 240px); aspect-ratio: 3/4; border-radius: 50% 50% 14px 14px;
        display: grid; place-items: center; color: var(--gold);
        background:
          radial-gradient(120% 90% at 50% 20%, rgba(212,175,55,.22), transparent 70%),
          var(--panel-solid);
        border: 2px solid var(--gold-line);
        box-shadow: 0 0 60px rgba(212,175,55,.25), inset 0 0 40px rgba(212,175,55,.08);
      }
      .th-arch-deity { background:
          radial-gradient(120% 90% at 50% 25%, rgba(255,153,51,.28), transparent 70%),
          var(--panel-solid); }
      .th-arch-sm { width: clamp(140px,16vw,200px); }

      /* hanging bells */
      .th-bell { position: absolute; top: 0; z-index: 4; display: flex; flex-direction: column; align-items: center; }
      .th-bell-left { left: clamp(12px,6vw,90px); }
      .th-bell-right { right: clamp(12px,6vw,90px); }
      .th-chain { width: 2px; height: clamp(70px,12vh,130px); background: linear-gradient(var(--gold), var(--gold-soft)); }
      .th-bell-body {
        width: 30px; height: 34px; border-radius: 50% 50% 40% 40%;
        background: linear-gradient(160deg, var(--gold-soft), var(--gold));
        box-shadow: 0 6px 16px rgba(212,175,55,.45); position: relative;
      }
      .th-bell-body::after {
        content: ""; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
        width: 7px; height: 7px; border-radius: 50%; background: var(--gold);
      }

      .th-hero-scallop {
        position: absolute; bottom: -2px; left: 0; right: 0; height: 60px;
        background:
          radial-gradient(circle at 30px -18px, transparent 30px, var(--bg) 31px) repeat-x;
        background-size: 60px 60px;
      }

      /* ── ABOUT ── */
      .th-about {
        display: grid; grid-template-columns: 220px 1.3fr 1fr; gap: 40px; align-items: center;
      }
      .th-about-portrait { display: grid; place-items: center; }
      .th-arch.th-arch-sm { width: 200px; }
      .th-about-name { font-size: clamp(1.6rem,3.5vw,2.3rem); font-weight: 700; margin: 6px 0 14px; }
      .th-about-bio { color: var(--muted); line-height: 1.8; font-size: .98rem; margin: 0 0 22px; }
      .th-readmore {
        display: inline-block; text-decoration: none; color: var(--gold);
        border: 1px solid var(--gold-line); padding: 9px 20px; border-radius: 100px;
        font-size: .8rem; font-weight: 600; letter-spacing: .08em; transition: background .25s;
      }
      .th-readmore:hover { background: rgba(212,175,55,.1); }
      .th-features { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .th-feature { display: flex; gap: 14px; align-items: flex-start; }
      .th-feature-icon { color: var(--gold); flex-shrink: 0; }
      .th-feature-title { font-size: 1.1rem; font-weight: 600; color: var(--text); }
      .th-feature-desc { color: var(--muted); font-size: .82rem; margin-top: 2px; }

      /* ── horizontal scroll shared ── */
      .trad-scroll {
        display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory;
        padding: 10px 4px 24px; scrollbar-width: none;
      }
      .trad-scroll::-webkit-scrollbar { display: none; }

      /* ── BHAJAN CARDS ── */
      .th-bhajan { flex: 0 0 min(200px,60vw); scroll-snap-align: start; text-decoration: none; }
      .th-bhajan-card { display: flex; flex-direction: column; transition: transform .3s; }
      .th-bhajan:hover .th-bhajan-card { transform: translateY(-5px); }
      .th-bhajan-art {
        height: 200px; background-size: cover; background-position: center;
        background-color: var(--panel-solid);
        background-image: linear-gradient(160deg, rgba(212,175,55,.3), rgba(17,12,3,.9));
        display: grid; place-items: center; position: relative;
      }
      .th-bhajan-meta { padding: 14px 14px 18px; text-align: center; }
      .th-bhajan-title { font-size: 1.05rem; font-weight: 600; color: var(--text); }
      .th-bhajan-sub { color: var(--muted); font-size: .78rem; margin-top: 3px; }

      .th-play-dot {
        width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
        background: rgba(212,175,55,.92); color: #1a1200;
        box-shadow: 0 6px 18px rgba(0,0,0,.4);
      }
      .th-play-lg { width: 52px; height: 52px; }

      .th-pill-btn {
        display: inline-block; text-decoration: none; color: var(--gold);
        border: 1px solid var(--gold); padding: 10px 24px; border-radius: 100px;
        font-size: .8rem; font-weight: 700; letter-spacing: .1em; transition: background .25s, color .25s;
      }
      .th-pill-btn:hover { background: var(--gold); color: #1a1200; }

      /* ── VIDEO + LYRICS ── */
      .th-vl { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
      .th-panel { padding: 26px; }
      .th-panel-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 14px; }
      .th-panel-title { font-size: clamp(1.3rem,2.5vw,1.7rem); font-weight: 700; margin: 4px 0 0; }
      .th-mini-btn {
        text-decoration: none; color: var(--gold); border: 1px solid var(--gold-line);
        padding: 6px 14px; border-radius: 100px; font-size: .7rem; font-weight: 700;
        letter-spacing: .08em; white-space: nowrap; flex-shrink: 0;
      }
      .th-video-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
      .th-video { text-decoration: none; text-align: center; }
      .th-video-thumb {
        height: 90px; border-radius: 12px; background-size: cover; background-position: center;
        background-image: linear-gradient(160deg, rgba(212,175,55,.3), rgba(17,12,3,.9));
        display: grid; place-items: center; border: 1px solid var(--gold-line); margin-bottom: 8px;
      }
      .th-video-title { color: var(--text); font-size: .8rem; font-family: var(--font-fraunces), serif; }
      .th-lyric-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
      .th-lyric-card {
        text-decoration: none; text-align: center; padding: 18px 12px; border-radius: 14px;
        background: rgba(212,175,55,.05); border: 1px solid var(--gold-line); transition: background .25s;
      }
      .th-lyric-card:hover { background: rgba(212,175,55,.12); }
      .th-lyric-icon { color: var(--gold); display: inline-flex; }
      .th-lyric-title { font-size: 1rem; font-weight: 600; color: var(--text); margin: 8px 0 4px; }
      .th-lyric-desc { color: var(--muted); font-size: .76rem; line-height: 1.5; }

      /* ── YOUTUBE ── */
      .th-yt { padding: 26px; }
      .th-yt-head { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 18px; }
      .th-yt-icon { flex-shrink: 0; margin-top: 4px; }
      .th-yt-title { font-size: 1.15rem; font-weight: 700; letter-spacing: .06em; color: var(--text); }
      .th-yt-sub { color: var(--muted); font-size: .9rem; margin: 2px 0 12px; }
      .th-yt-btn { background: var(--gold); color: #1a1200; border-color: var(--gold); }
      .th-yt-vid { flex: 0 0 min(180px,55vw); scroll-snap-align: start; text-decoration: none; text-align: center; }
      .th-yt-vid .th-video-thumb { height: 100px; }

      /* ── RESPONSIVE ── */
      @media (max-width: 900px) {
        .th-hero { grid-template-columns: 1fr; }
        .th-hero-art { display: none; }
        .th-about { grid-template-columns: 1fr; text-align: center; }
        .th-about-portrait { margin: 0 auto; }
        .th-features { max-width: 460px; margin: 0 auto; }
        .th-vl { grid-template-columns: 1fr; }
      }
      @media (max-width: 560px) {
        .th-features { grid-template-columns: 1fr; }
        .th-video-grid, .th-lyric-grid { grid-template-columns: 1fr; }
        .th-bell { display: none; }
      }
    `}</style>
  );
}
