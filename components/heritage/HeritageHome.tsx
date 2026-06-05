import Link from 'next/link';
import {
  getLyricist, getAllSongs, getAllCollections, getJourney, getSocial,
  type HeritageSettings,
} from '@/lib/data';

function safeUrl(u?: string | null): string | null {
  if (!u) return null;
  try { const p = new URL(u).protocol; return p === 'https:' || p === 'http:' ? u : null; }
  catch { return null; }
}

/* Warm leather spine colours, cycled across the collection "books". */
const SPINES = ['#7A2E22', '#2C4A36', '#8A6A2E', '#9B5A20', '#4A2438', '#5A3A1E'];

function SectionHead({ title, link, linkLabel }: { title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="her-sechead">
      <span className="her-orn" aria-hidden>❖</span>
      <h2 className="font-serif her-gold-text her-sectitle">{title}</h2>
      <span className="her-orn" aria-hidden>❖</span>
      {link && <Link href={link} className="her-seclink">{linkLabel ?? 'VIEW ALL'}</Link>}
    </div>
  );
}

export default async function HeritageHome({ settings }: { settings: HeritageSettings }) {
  const [l, songs, collections, journey, social] = await Promise.all([
    getLyricist(),
    getAllSongs(),
    getAllCollections(),
    getJourney(),
    getSocial(),
  ]);

  const heroPhoto = safeUrl(settings.heroPhoto);
  const heroVideo = safeUrl(settings.heroVideo);
  const aboutPhoto = safeUrl(settings.aboutPhoto) ?? heroPhoto;

  const books = collections.slice(0, 5);
  const videoSongs = songs.filter((s) => s.embed?.youtubeId).slice(0, 5);
  const gallery = (settings.gallery ?? []).map(safeUrl).filter(Boolean) as string[];
  const aboutBody = settings.aboutBody || l.bio;
  const youtubeUrl = social.youtube || 'https://www.youtube.com';

  return (
    <div className="her-root">
      <div className="her-frame" aria-hidden />

      {/* ════════ HERO — split: portrait left, words right ════════ */}
      <header className="her-hero">
        {heroVideo ? (
          <video className="her-hero-bg" src={heroVideo} autoPlay muted loop playsInline />
        ) : (
          <div className="her-hero-bg her-hero-bg--img" style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : undefined} />
        )}
        <div className="her-hero-veil" />

        <div className="her-hero-inner">
          <div className="her-hero-portrait">
            {heroPhoto
              ? <div className="her-hero-portrait-img" style={{ backgroundImage: `url(${heroPhoto})` }} />
              : <div className="her-hero-portrait-img her-hero-portrait-ph"><span>📖</span></div>}
          </div>

          <div className="her-hero-copy">
            <p className="her-hero-eyebrow">{settings.eyebrow}</p>
            <h1 className="font-serif her-hero-title her-gold-text">{settings.title}</h1>
            <p className="her-hero-sub">{settings.subtitle}</p>
            {settings.quote && <p className="her-hero-quote">“{settings.quote}”</p>}
            <div className="her-hero-ctas">
              <Link href="/lyrics" className="her-btn-gold">
                <span className="her-btn-icon" aria-hidden>▶</span> LISTEN BHAJANS
              </Link>
              <Link href="/explore?tab=songs" className="her-btn-ghost">EXPLORE LIBRARY</Link>
            </div>
          </div>

          <div className="her-hero-quill" aria-hidden>🪶</div>
        </div>
      </header>

      {/* ════════ STATS STRIP ════════ */}
      {settings.show.stats && settings.stats.length > 0 && (
        <section className="her-stats-wrap">
          <div className="her-stats">
            {settings.stats.map((st, i) => (
              <div key={i} className="her-stat">
                <span className="her-stat-orn" aria-hidden>❖</span>
                <div>
                  <span className="font-serif her-stat-value her-gold-text">{st.value}</span>
                  <span className="her-stat-label">{st.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════ BHAJAN SANGRAH — book collections ════════ */}
      {settings.show.bhajans && books.length > 0 && (
        <section className="her-section">
          <SectionHead title="ભજન સંગ્રહ" link="/explore?tab=collections" linkLabel="VIEW ALL" />
          <div className="her-books">
            {books.map((c, i) => (
              <Link key={c.id} href={`/collections/${c.slug}`} className="her-book">
                <span className="her-book-spine" style={{ background: SPINES[i % SPINES.length] }} />
                <div
                  className="her-book-face"
                  style={{
                    background: safeUrl(c.coverUrl)
                      ? `linear-gradient(160deg, rgba(0,0,0,.18), rgba(0,0,0,.42)), url(${c.coverUrl})`
                      : `linear-gradient(160deg, ${SPINES[i % SPINES.length]}, color-mix(in srgb, ${SPINES[i % SPINES.length]} 60%, #000))`,
                  }}
                >
                  <h3 className="font-serif her-book-title">{c.title}</h3>
                </div>
                <span className="her-book-cta">VIEW COLLECTION</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════ ABOUT + VINTAGE PLAYER ════════ */}
      {settings.show.audio && (
        <section className="her-section">
          <div className="her-about">
            <article className="her-paper">
              <p className="her-paper-eyebrow">{settings.legacyTitle}</p>
              <h2 className="font-serif her-paper-name her-gold-text">{settings.title}</h2>
              {aboutPhoto && <div className="her-paper-photo" style={{ backgroundImage: `url(${aboutPhoto})` }} />}
              <p className="her-paper-body">{aboutBody}</p>
              <Link href="/about" className="her-btn-gold her-paper-btn">ABOUT {settings.title}</Link>
            </article>

            <aside className="her-player">
              <p className="her-player-label font-serif">{settings.audioTitle}</p>
              <p className="her-player-track her-gold-text font-serif">{settings.audioTrack}</p>
              <div className="her-player-controls">
                <button className="her-player-btn" aria-label="Previous" type="button">⏮</button>
                <Link href="/lyrics" className="her-player-play" aria-label="Play">▶</Link>
                <button className="her-player-btn" aria-label="Next" type="button">⏭</button>
              </div>
              <div className="her-player-bar"><span /></div>
              <div className="her-player-time"><span>00:00</span><span className="her-gramophone" aria-hidden>📯</span></div>
            </aside>
          </div>
        </section>
      )}

      {/* ════════ VIDEO GALLERY ════════ */}
      {settings.show.videos && videoSongs.length > 0 && (
        <section className="her-section">
          <SectionHead title="વિડિયો ગેલેરી" link={youtubeUrl} linkLabel="VIEW ALL" />
          <div className="her-videos">
            {videoSongs.map((s) => (
              <Link
                key={s.id}
                href={`/songs/${s.slug}`}
                className="her-vid"
                style={{ backgroundImage: `url(https://i.ytimg.com/vi/${s.embed!.youtubeId}/hqdefault.jpg)` }}
              >
                <span className="her-vid-scrim" />
                <span className="her-vid-play" aria-hidden>▶</span>
                <span className="her-vid-title">{s.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════ GALLERY (optional) ════════ */}
      {settings.show.gallery && gallery.length > 0 && (
        <section className="her-section">
          <SectionHead title="ગેલેરી" />
          <div className="her-gallery">
            {gallery.map((src, i) => (
              <div key={i} className="her-gallery-item" style={{ backgroundImage: `url(${src})` }} />
            ))}
          </div>
        </section>
      )}

      {/* ════════ EVENTS / LEGACY TIMELINE (optional) ════════ */}
      {settings.show.legacy && journey.length > 0 && (
        <section className="her-section">
          <SectionHead title="વારસો" link="/journey" linkLabel="VIEW ALL" />
          <div className="her-timeline">
            {journey.slice(0, 5).map((m) => (
              <div key={m.id} className="her-tl-row">
                <span className="font-serif her-tl-year her-gold-text">{m.year ?? '—'}</span>
                <div className="her-tl-line" aria-hidden />
                <div className="her-tl-content">
                  <h4 className="font-serif her-tl-title">{m.title}</h4>
                  <p className="her-tl-desc">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {settings.show.events && settings.events.length > 0 && (
        <section className="her-section">
          <SectionHead title="કાર્યક્રમો" />
          <div className="her-events">
            {settings.events.map((e, i) => (
              <div key={i} className="her-event">
                <span className="her-event-date her-gold-text font-serif">{e.date}</span>
                <div>
                  <h4 className="font-serif her-event-title">{e.title}</h4>
                  {e.place && <p className="her-event-place">{e.place}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════ CLOSING QUOTE BAND ════════ */}
      {settings.footerQuote && (
        <section className="her-quoteband">
          <span className="her-diya" aria-hidden>🪔</span>
          <p className="font-serif her-quoteband-text">{settings.footerQuote}</p>
          <p className="her-quoteband-by">— {settings.title}</p>
        </section>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .her-root { position: relative; }

  /* ── HERO ── */
  .her-hero {
    position: relative; min-height: 92svh; display: flex; align-items: center;
    padding: clamp(110px,16vh,170px) clamp(20px,6vw,80px) clamp(50px,7vh,90px); overflow: hidden;
  }
  .her-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .her-hero-bg--img { background-size: cover; background-position: center; }
  .her-hero-bg, .her-hero-bg--img { filter: brightness(.42) saturate(1.05); }
  [data-theme='light'] .her-hero-bg { filter: brightness(.92) saturate(1.02); }
  .her-hero-veil { position: absolute; inset: 0; z-index: 1;
    background:
      linear-gradient(90deg, rgba(8,5,2,.78) 0%, rgba(8,5,2,.35) 45%, rgba(8,5,2,.6) 100%),
      linear-gradient(180deg, transparent 60%, var(--bg) 100%); }
  [data-theme='light'] .her-hero-veil {
    background:
      linear-gradient(90deg, rgba(250,246,236,.55) 0%, rgba(250,246,236,.15) 45%, rgba(250,246,236,.4) 100%),
      linear-gradient(180deg, transparent 60%, var(--bg) 100%); }

  .her-hero-inner {
    position: relative; z-index: 2; width: 100%; max-width: 1240px; margin: 0 auto;
    display: grid; grid-template-columns: 0.9fr 1.1fr; align-items: center; gap: clamp(24px,5vw,70px);
  }
  .her-hero-portrait { position: relative; }
  .her-hero-portrait-img {
    position: relative; aspect-ratio: 4/5; border-radius: 14px; background-size: cover; background-position: center top;
    border: 1px solid var(--gold); box-shadow: 0 26px 70px rgba(0,0,0,.5), inset 0 0 0 6px rgba(212,175,55,.12);
  }
  .her-hero-portrait-ph { display: flex; align-items: center; justify-content: center; font-size: 4rem;
    background: var(--panel-solid); }

  .her-hero-copy { text-align: center; }
  .her-hero-eyebrow { letter-spacing: .12em; font-size: clamp(.85rem,1.6vw,1.1rem); font-weight: 600;
    color: var(--gold); margin: 0 0 14px; }
  .her-hero-title { font-size: clamp(2.6rem,7vw,5.4rem); font-weight: 800; line-height: 1.04; margin: 0;
    letter-spacing: -.01em; }
  .her-hero-sub { font-size: clamp(1rem,2vw,1.45rem); margin: 16px auto 0; color: var(--text); opacity: .9; }
  .her-hero-quote { font-style: italic; font-size: clamp(1rem,1.8vw,1.3rem); color: var(--gold-soft);
    margin: 14px auto 0; max-width: 40ch; }
  .her-hero-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 34px; }
  .her-hero-quill { position: absolute; right: -6px; bottom: 4px; font-size: 2.6rem; opacity: .7;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,.4)); }

  /* ── Buttons ── */
  .her-btn-gold, .her-btn-ghost {
    display: inline-flex; align-items: center; gap: 9px; padding: 14px 28px; border-radius: 12px;
    font-weight: 700; font-size: .86rem; letter-spacing: .06em; text-decoration: none; white-space: nowrap;
    transition: transform .22s, box-shadow .22s, background .22s; text-transform: uppercase;
  }
  .her-btn-gold { background: linear-gradient(120deg, var(--gold-soft), var(--gold)); color: #1a1200;
    box-shadow: 0 10px 26px rgba(212,175,55,.32); }
  .her-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(212,175,55,.46); }
  .her-btn-icon { font-size: .72rem; }
  .her-btn-ghost { border: 1.5px solid var(--gold); color: var(--gold); background: color-mix(in srgb, var(--bg) 70%, transparent); }
  .her-btn-ghost:hover { background: color-mix(in srgb, var(--gold) 14%, transparent); transform: translateY(-2px); }

  /* ── Stats strip ── */
  .her-stats-wrap { max-width: 1180px; margin: -40px auto 0; padding: 0 clamp(20px,6vw,80px); position: relative; z-index: 5; }
  .her-stats { display: grid; grid-template-columns: repeat(4, 1fr);
    background: var(--panel-solid); border: 1px solid var(--gold); border-radius: 16px;
    padding: 24px 10px; box-shadow: var(--glow); }
  .her-stat { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 6px 10px;
    border-right: 1px solid var(--line); }
  .her-stat:last-child { border-right: none; }
  .her-stat-orn { color: var(--gold); font-size: 1.1rem; opacity: .6; }
  .her-stat-value { display: block; font-size: clamp(1.4rem,3vw,2.1rem); font-weight: 800; line-height: 1; }
  .her-stat-label { display: block; font-size: clamp(.66rem,1.3vw,.82rem); color: var(--muted); margin-top: 5px; }

  /* ── Sections ── */
  .her-section { max-width: 1200px; margin: 0 auto; padding: clamp(56px,8vh,100px) clamp(20px,6vw,80px) 0; }
  .her-sechead { position: relative; display: flex; align-items: center; justify-content: center; gap: 14px;
    flex-wrap: wrap; margin-bottom: 40px; }
  .her-orn { color: var(--gold); opacity: .55; font-size: 1rem; }
  .her-sectitle { font-size: clamp(1.7rem,4vw,2.8rem); font-weight: 800; margin: 0; text-align: center; }
  .her-seclink { position: absolute; right: 0; top: 50%; transform: translateY(-50%);
    border: 1px solid var(--gold); color: var(--gold); text-decoration: none; font-size: .72rem; font-weight: 700;
    letter-spacing: .08em; padding: 7px 16px; border-radius: 8px; transition: background .2s; }
  .her-seclink:hover { background: color-mix(in srgb, var(--gold) 14%, transparent); }

  /* ── Book collections ── */
  .her-books { display: grid; grid-template-columns: repeat(5, 1fr); gap: clamp(14px,2vw,26px); }
  .her-book { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px;
    text-decoration: none; color: var(--text); transition: transform .28s; }
  .her-book:hover { transform: translateY(-8px); }
  .her-book-spine { position: absolute; left: 50%; top: 0; transform: translateX(calc(-50% - 50%)); width: 14px;
    height: calc(100% - 36px); border-radius: 3px 0 0 3px; box-shadow: inset -3px 0 6px rgba(0,0,0,.4); display: none; }
  .her-book-face { position: relative; width: 100%; aspect-ratio: 3/4; border-radius: 6px 10px 10px 6px;
    background-size: cover !important; background-position: center !important;
    border: 1px solid var(--gold); border-left: 6px solid color-mix(in srgb, var(--gold) 60%, #000);
    display: flex; align-items: center; justify-content: center; padding: 16px 14px; text-align: center;
    box-shadow: 0 16px 38px rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.06);
    transition: box-shadow .28s, border-color .28s; }
  .her-book:hover .her-book-face { box-shadow: 0 24px 54px rgba(0,0,0,.55); }
  .her-book-title { color: #fff; font-size: clamp(.95rem,1.5vw,1.25rem); font-weight: 700; line-height: 1.25;
    text-shadow: 0 2px 8px rgba(0,0,0,.7); margin: 0; }
  .her-book-cta { font-size: .64rem; font-weight: 700; letter-spacing: .08em; color: var(--gold);
    border: 1px solid var(--line); border-radius: 6px; padding: 6px 10px; }

  /* ── About + player ── */
  .her-about { display: grid; grid-template-columns: 1.6fr 1fr; gap: clamp(20px,3vw,34px); align-items: stretch; }
  .her-paper { position: relative; background: var(--paper); border: 1px solid var(--gold); border-radius: 14px;
    padding: clamp(26px,4vw,42px); box-shadow: inset 0 0 60px rgba(0,0,0,.18); overflow: hidden; }
  .her-paper-eyebrow { text-transform: uppercase; letter-spacing: .16em; font-size: .72rem; font-weight: 700;
    color: var(--muted); margin: 0 0 6px; }
  .her-paper-name { font-size: clamp(1.6rem,3.4vw,2.4rem); font-weight: 800; margin: 0 0 18px; }
  .her-paper-photo { float: left; width: 120px; height: 150px; margin: 0 20px 12px 0; border-radius: 10px;
    background-size: cover; background-position: center; border: 1px solid var(--gold); }
  .her-paper-body { font-size: .98rem; line-height: 1.85; color: var(--text); opacity: .92; margin: 0 0 22px; }
  .her-paper-btn { font-size: .76rem; }

  .her-player { background: var(--panel-solid); border: 1px solid var(--gold); border-radius: 14px;
    padding: clamp(24px,3vw,34px); display: flex; flex-direction: column; justify-content: center; text-align: center;
    box-shadow: var(--glow); }
  .her-player-label { font-size: .9rem; color: var(--muted); margin: 0 0 6px; }
  .her-player-track { font-size: clamp(1.2rem,2.4vw,1.7rem); font-weight: 800; margin: 0 0 22px; }
  .her-player-controls { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 22px; }
  .her-player-btn { background: none; border: none; color: var(--gold); font-size: 1.4rem; cursor: pointer; opacity: .8; transition: opacity .2s; }
  .her-player-btn:hover { opacity: 1; }
  .her-player-play { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px;
    border-radius: 50%; background: linear-gradient(120deg, var(--gold-soft), var(--gold)); color: #1a1200;
    font-size: 1.3rem; text-decoration: none; box-shadow: 0 8px 22px rgba(212,175,55,.4); transition: transform .2s; }
  .her-player-play:hover { transform: scale(1.07); }
  .her-player-bar { height: 5px; border-radius: 100px; background: var(--line); overflow: hidden; margin-bottom: 10px; }
  .her-player-bar span { display: block; width: 32%; height: 100%; background: linear-gradient(90deg, var(--gold-soft), var(--gold)); }
  .her-player-time { display: flex; justify-content: space-between; align-items: center; font-size: .78rem; color: var(--muted); }
  .her-gramophone { font-size: 1.4rem; }

  /* ── Videos ── */
  .her-videos { display: grid; grid-template-columns: repeat(5, 1fr); gap: clamp(12px,1.6vw,18px); }
  .her-vid { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; text-decoration: none;
    background-size: cover; background-position: center; border: 1px solid var(--gold);
    display: flex; align-items: flex-end; transition: transform .25s, box-shadow .25s; }
  .her-vid:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(0,0,0,.45); }
  .her-vid-scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.82), transparent 65%); }
  .her-vid-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 44px; height: 44px; border-radius: 50%; background: rgba(212,175,55,.92); color: #1a1200;
    display: flex; align-items: center; justify-content: center; font-size: 1rem; padding-left: 3px; }
  .her-vid-title { position: relative; z-index: 1; color: #fff; font-size: .8rem; font-weight: 600; padding: 12px;
    line-height: 1.3; text-shadow: 0 2px 6px rgba(0,0,0,.8); }

  /* ── Gallery ── */
  .her-gallery { columns: 4 200px; column-gap: 14px; }
  .her-gallery-item { break-inside: avoid; margin-bottom: 14px; border-radius: 12px; border: 1px solid var(--line);
    background-size: cover; background-position: center; height: 200px; transition: transform .3s; }
  .her-gallery-item:nth-child(3n) { height: 260px; }
  .her-gallery-item:hover { transform: scale(1.02); }

  /* ── Timeline / Events ── */
  .her-timeline { max-width: 820px; margin: 0 auto; }
  .her-tl-row { display: grid; grid-template-columns: 80px 24px 1fr; gap: 8px; }
  .her-tl-year { font-size: 1.3rem; font-weight: 800; padding-top: 2px; }
  .her-tl-line { position: relative; display: flex; justify-content: center; }
  .her-tl-line::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: var(--gold); margin-top: 8px; }
  .her-tl-line::after { content: ""; position: absolute; top: 17px; bottom: -8px; width: 1px; background: var(--line); }
  .her-tl-row:last-child .her-tl-line::after { display: none; }
  .her-tl-content { padding: 0 0 30px 6px; }
  .her-tl-title { font-size: 1.2rem; font-weight: 700; margin: 0 0 6px; }
  .her-tl-desc { font-size: .95rem; line-height: 1.7; color: var(--muted); margin: 0; }
  .her-events { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .her-event { display: flex; gap: 16px; padding: 20px; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); }
  .her-event-date { font-size: 1.05rem; font-weight: 800; white-space: nowrap; }
  .her-event-title { font-size: 1.08rem; font-weight: 700; margin: 0 0 4px; }
  .her-event-place { font-size: .85rem; color: var(--muted); margin: 0; }

  /* ── Closing quote band ── */
  .her-quoteband { text-align: center; margin-top: clamp(60px,9vh,110px);
    padding: clamp(50px,8vh,90px) 6vw; border-top: 1px solid var(--line);
    background: radial-gradient(60% 130% at 50% 0%, color-mix(in srgb, var(--gold) 10%, transparent), transparent); }
  .her-diya { font-size: 2.4rem; display: block; margin-bottom: 16px; }
  .her-quoteband-text { font-size: clamp(1.3rem,3vw,2rem); font-style: italic; font-weight: 700; color: var(--gold-soft); margin: 0 auto; max-width: 30ch; line-height: 1.5; }
  .her-quoteband-by { color: var(--muted); margin: 14px 0 0; font-size: .95rem; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .her-hero-inner { grid-template-columns: 1fr; gap: 30px; }
    .her-hero-portrait { max-width: 320px; margin: 0 auto; }
    .her-stats { grid-template-columns: repeat(2, 1fr); }
    .her-stat:nth-child(2) { border-right: none; }
    .her-stat:nth-child(1), .her-stat:nth-child(2) { border-bottom: 1px solid var(--line); padding-bottom: 16px; }
    .her-stat:nth-child(3), .her-stat:nth-child(4) { padding-top: 16px; }
    .her-books { grid-template-columns: repeat(3, 1fr); }
    .her-about { grid-template-columns: 1fr; }
    .her-videos { grid-template-columns: repeat(3, 1fr); }
    .her-seclink { position: static; transform: none; margin-top: 6px; }
  }
  @media (max-width: 560px) {
    .her-books { grid-template-columns: repeat(2, 1fr); }
    .her-videos { grid-template-columns: repeat(2, 1fr); }
    .her-gallery { columns: 2 140px; }
    .her-tl-row { grid-template-columns: 56px 20px 1fr; }
    .her-paper-photo { float: none; width: 100%; height: 200px; margin: 0 0 16px; }
  }
`;
