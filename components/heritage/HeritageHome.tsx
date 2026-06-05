import Link from 'next/link';
import { getLyricist, getAllSongs, getJourney, getSocial, type HeritageSettings } from '@/lib/data';

function safeUrl(u?: string | null): string | null {
  if (!u) return null;
  try { const p = new URL(u).protocol; return p === 'https:' || p === 'http:' ? u : null; }
  catch { return null; }
}

function SectionHead({ tag, title, link, linkLabel }: { tag: string; title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="her-sechead">
      <div>
        <span className="her-eyebrow">{tag}</span>
        <h2 className="font-serif her-gold-text her-sectitle">{title}</h2>
      </div>
      {link && <Link href={link} className="her-seclink">{linkLabel ?? 'View all'} →</Link>}
    </div>
  );
}

export default async function HeritageHome({ settings }: { settings: HeritageSettings }) {
  const [l, songs, journey, social] = await Promise.all([
    getLyricist(),
    getAllSongs(),
    getJourney(),
    getSocial(),
  ]);

  const heroPhoto = safeUrl(settings.heroPhoto);
  const heroVideo = safeUrl(settings.heroVideo);

  const bhajans = songs.slice(0, 8);
  const lyricSongs = songs.filter((s) => s.lyrics && s.lyrics.trim()).slice(0, 6);
  const videoSongs = songs.filter((s) => s.embed?.youtubeId).slice(0, 4);
  const gallery = (settings.gallery ?? []).map(safeUrl).filter(Boolean) as string[];
  const youtubeUrl = social.youtube || 'https://www.youtube.com';

  return (
    <div className="her-root">
      <div className="her-frame" aria-hidden />

      {/* ════════ HERO ════════ */}
      <header className="her-hero">
        {heroVideo ? (
          <video className="her-hero-media" src={heroVideo} autoPlay muted loop playsInline />
        ) : heroPhoto ? (
          <div className="her-hero-media" style={{ backgroundImage: `url(${heroPhoto})` }} />
        ) : null}
        <div className="her-hero-veil" />

        <div className="her-hero-inner">
          <span className="her-hero-eyebrow">❖ {settings.eyebrow} ❖</span>
          <h1 className="font-serif her-hero-title">
            <span className="her-gold-text">{settings.title}</span>
          </h1>
          <p className="her-hero-sub">{settings.subtitle}</p>
          {settings.quote && <p className="her-hero-quote">&ldquo;{settings.quote}&rdquo;</p>}
          <div className="her-hero-ctas">
            <Link href="/explore?tab=songs" className="her-btn-gold">Enter the Library</Link>
            <Link href="/about" className="her-btn-ghost">About the Poet</Link>
          </div>
          <div className="her-hero-stats">
            <span><strong>{songs.length}</strong> works</span>
            <span className="her-dot" />
            <span><strong>{lyricSongs.length ? songs.filter((s)=>s.lyrics?.trim()).length : 0}</strong> with lyrics</span>
            {l.careerStartYear && <><span className="her-dot" /><span>since <strong>{l.careerStartYear}</strong></span></>}
          </div>
        </div>
        <div className="her-hero-fade" />
      </header>

      {/* ════════ BHAJANS ════════ */}
      {settings.show.bhajans && bhajans.length > 0 && (
        <section className="her-section">
          <SectionHead tag="The Collection" title="Bhajans &amp; Songs" link="/explore?tab=songs" linkLabel="Full catalogue" />
          <div className="her-grid her-grid-songs">
            {bhajans.map((s) => (
              <Link key={s.id} href={`/songs/${s.slug}`} className="her-card">
                <div className="her-card-art" style={safeUrl(s.artworkUrl) ? { backgroundImage: `url(${s.artworkUrl})` } : undefined}>
                  {!safeUrl(s.artworkUrl) && <span className="her-card-art-ph">❖</span>}
                </div>
                <div className="her-card-body">
                  <h3 className="font-serif her-card-title">{s.title}</h3>
                  {s.performingSingers?.length > 0 && (
                    <p className="her-card-sub">{s.performingSingers.join(', ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════ POETRY / LYRICS ════════ */}
      {settings.show.poetry && lyricSongs.length > 0 && (
        <section className="her-section her-section-alt">
          <SectionHead tag="In His Words" title="Poetry &amp; Lyrics" link="/lyrics" linkLabel="The lyric library" />
          <div className="her-poetry">
            {lyricSongs.map((s) => (
              <Link key={s.id} href={`/songs/${s.slug}`} className="her-poem">
                <span className="her-poem-quote">❝</span>
                <h3 className="font-serif her-poem-title">{s.title}</h3>
                <p className="her-poem-excerpt" data-i18n>
                  {s.lyrics.split('\n').filter((x) => x.trim()).slice(0, 3).join(' · ')}
                </p>
                <span className="her-poem-read">Read lyric →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════ VIDEOS ════════ */}
      {settings.show.videos && videoSongs.length > 0 && (
        <section className="her-section">
          <SectionHead tag="Watch & Listen" title="Films &amp; Performances" link={youtubeUrl} linkLabel="YouTube" />
          <div className="her-grid her-grid-video">
            {videoSongs.map((s) => (
              <div key={s.id} className="her-video">
                <div className="her-video-frame">
                  <iframe
                    src={`https://www.youtube.com/embed/${s.embed!.youtubeId}`}
                    title={s.title} allowFullScreen loading="lazy"
                  />
                </div>
                <p className="font-serif her-video-title">{s.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════ GALLERY ════════ */}
      {settings.show.gallery && gallery.length > 0 && (
        <section className="her-section her-section-alt">
          <SectionHead tag="The Archive" title="Gallery" />
          <div className="her-gallery">
            {gallery.map((src, i) => (
              <div key={i} className="her-gallery-item" style={{ backgroundImage: `url(${src})` }} />
            ))}
          </div>
        </section>
      )}

      {/* ════════ LEGACY ════════ */}
      {settings.show.legacy && (journey.length > 0 || settings.legacyBody) && (
        <section className="her-section">
          <SectionHead tag="A Life in Letters" title={settings.legacyTitle} link="/journey" linkLabel="Full journey" />
          {settings.legacyBody && <p className="her-legacy-body">{settings.legacyBody}</p>}
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

      {/* ════════ EVENTS ════════ */}
      {settings.show.events && settings.events.length > 0 && (
        <section className="her-section her-section-alt">
          <SectionHead tag="Gatherings" title="Events" />
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

      {/* ════════ CONTACT CTA ════════ */}
      <section className="her-cta">
        <h2 className="font-serif her-gold-text her-cta-title">Continue the conversation</h2>
        <p className="her-cta-sub">For bookings, collaborations or a word of appreciation.</p>
        <Link href="/contact" className="her-btn-gold">Get in touch</Link>
      </section>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .her-root { position: relative; }

  /* HERO */
  .her-hero {
    position: relative; min-height: 100svh; display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 120px 6vw 90px; overflow: hidden;
  }
  .her-hero-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    background-size: cover; background-position: center; filter: brightness(.5) saturate(1.05); }
  .her-hero-veil { position: absolute; inset: 0;
    background:
      radial-gradient(60% 60% at 50% 30%, transparent 0%, rgba(8,5,0,.55) 100%),
      linear-gradient(180deg, rgba(8,5,0,.4) 0%, rgba(8,5,0,.2) 40%, var(--bg) 100%); }
  [data-theme='light'] .her-hero-veil {
    background:
      radial-gradient(60% 60% at 50% 30%, transparent 0%, rgba(250,243,231,.35) 100%),
      linear-gradient(180deg, rgba(250,243,231,.25) 0%, transparent 40%, var(--bg) 100%); }
  .her-hero-inner { position: relative; z-index: 2; max-width: 880px; }
  .her-hero-eyebrow { display: inline-block; letter-spacing: .34em; text-transform: uppercase;
    font-size: .72rem; font-weight: 600; color: var(--gold); margin-bottom: 26px; }
  .her-hero-title { font-size: clamp(2.8rem, 9vw, 7rem); font-weight: 700; line-height: 1; margin: 0; letter-spacing: -.02em; }
  .her-hero-sub { font-size: clamp(1rem, 2vw, 1.35rem); margin: 24px auto 0; max-width: 40ch; line-height: 1.7; color: var(--text); opacity: .9; }
  .her-hero-quote { font-style: italic; font-family: var(--font-fraunces), Georgia, serif;
    font-size: clamp(1.05rem,2vw,1.5rem); margin: 22px auto 0; max-width: 38ch; color: var(--gold-soft); opacity: .92; }
  .her-hero-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 40px; }
  .her-hero-stats { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;
    margin-top: 40px; font-size: .9rem; color: var(--muted); }
  .her-hero-stats strong { color: var(--text); font-weight: 700; }
  .her-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); opacity: .6; }
  .her-hero-fade { position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
    background: linear-gradient(transparent, var(--bg)); z-index: 1; }

  /* Buttons */
  .her-btn-gold, .her-btn-ghost {
    display: inline-flex; align-items: center; padding: 14px 30px; border-radius: 4px;
    font-weight: 600; font-size: .92rem; text-decoration: none; letter-spacing: .02em;
    transition: transform .25s, box-shadow .25s, background .25s; white-space: nowrap;
  }
  .her-btn-gold { background: linear-gradient(120deg, var(--gold-soft), var(--gold)); color: #1a1200;
    box-shadow: 0 8px 26px rgba(212,175,55,.28); }
  .her-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(212,175,55,.42); }
  .her-btn-ghost { border: 1px solid var(--gold); color: var(--gold); background: transparent; }
  .her-btn-ghost:hover { background: color-mix(in srgb, var(--gold) 12%, transparent); transform: translateY(-2px); }

  /* Sections */
  .her-section { max-width: 1200px; margin: 0 auto; padding: clamp(60px,9vh,110px) clamp(20px,6vw,80px); }
  .her-section-alt { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--gold) 5%, transparent), transparent); }
  .her-sechead { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 38px; }
  .her-eyebrow { display: block; text-transform: uppercase; letter-spacing: .28em; font-size: .68rem; font-weight: 700; color: var(--gold); margin-bottom: 10px; }
  .her-sectitle { font-size: clamp(1.8rem,4vw,3rem); font-weight: 700; margin: 0; letter-spacing: -.01em; }
  .her-seclink { color: var(--gold); text-decoration: none; font-size: .9rem; font-weight: 600; white-space: nowrap;
    border-bottom: 1px solid transparent; transition: border-color .2s; }
  .her-seclink:hover { border-color: var(--gold); }

  /* Song grid */
  .her-grid { display: grid; gap: 22px; }
  .her-grid-songs { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
  .her-card { text-decoration: none; color: var(--text); background: var(--panel); border: 1px solid var(--line);
    border-radius: 12px; overflow: hidden; transition: transform .25s, box-shadow .25s, border-color .25s; }
  .her-card:hover { transform: translateY(-6px); border-color: var(--gold); box-shadow: 0 18px 44px rgba(0,0,0,.32); }
  .her-card-art { aspect-ratio: 1; background-size: cover; background-position: center; background-color: var(--panel-solid);
    display: flex; align-items: center; justify-content: center; }
  .her-card-art-ph { font-size: 2.2rem; color: var(--gold); opacity: .45; }
  .her-card-body { padding: 14px 16px 16px; }
  .her-card-title { font-size: 1.1rem; font-weight: 600; margin: 0 0 4px; line-height: 1.25; }
  .her-card-sub { font-size: .8rem; color: var(--muted); margin: 0;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

  /* Poetry */
  .her-poetry { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .her-poem { position: relative; text-decoration: none; color: var(--text);
    background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 26px 24px 22px;
    transition: transform .25s, border-color .25s; overflow: hidden; }
  .her-poem:hover { transform: translateY(-4px); border-color: var(--gold); }
  .her-poem-quote { position: absolute; top: 8px; right: 16px; font-size: 4rem; color: var(--gold); opacity: .12; font-family: Georgia, serif; }
  .her-poem-title { font-size: 1.25rem; font-weight: 600; margin: 0 0 12px; font-style: italic; }
  .her-poem-excerpt { font-size: .92rem; line-height: 1.7; color: var(--muted); margin: 0 0 16px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .her-poem-read { font-size: .82rem; font-weight: 600; color: var(--gold); }

  /* Videos */
  .her-grid-video { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .her-video-frame { position: relative; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); }
  .her-video-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .her-video-title { font-size: 1rem; font-weight: 600; margin: 12px 2px 0; }

  /* Gallery */
  .her-gallery { columns: 4 200px; column-gap: 14px; }
  .her-gallery-item { break-inside: avoid; margin-bottom: 14px; border-radius: 12px; border: 1px solid var(--line);
    background-size: cover; background-position: center; height: 200px;
    transition: transform .3s, box-shadow .3s; }
  .her-gallery-item:nth-child(3n) { height: 260px; }
  .her-gallery-item:nth-child(4n) { height: 170px; }
  .her-gallery-item:hover { transform: scale(1.02); box-shadow: 0 14px 36px rgba(0,0,0,.32); }

  /* Legacy timeline */
  .her-legacy-body { max-width: 760px; font-size: 1.05rem; line-height: 1.9; color: var(--text); opacity: .9; margin: 0 0 36px; }
  .her-timeline { max-width: 820px; }
  .her-tl-row { display: grid; grid-template-columns: 80px 24px 1fr; gap: 8px; }
  .her-tl-year { font-size: 1.3rem; font-weight: 700; padding-top: 2px; }
  .her-tl-line { position: relative; display: flex; justify-content: center; }
  .her-tl-line::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: var(--gold); margin-top: 8px; flex-shrink: 0; }
  .her-tl-line::after { content: ""; position: absolute; top: 17px; bottom: -8px; width: 1px; background: var(--line); }
  .her-tl-row:last-child .her-tl-line::after { display: none; }
  .her-tl-content { padding: 0 0 30px 6px; }
  .her-tl-title { font-size: 1.2rem; font-weight: 600; margin: 0 0 6px; }
  .her-tl-desc { font-size: .95rem; line-height: 1.7; color: var(--muted); margin: 0; }

  /* Events */
  .her-events { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .her-event { display: flex; gap: 16px; align-items: flex-start; padding: 20px; border: 1px solid var(--line);
    border-radius: 12px; background: var(--panel); }
  .her-event-date { font-size: 1.05rem; font-weight: 700; white-space: nowrap; }
  .her-event-title { font-size: 1.08rem; font-weight: 600; margin: 0 0 4px; }
  .her-event-place { font-size: .85rem; color: var(--muted); margin: 0; }

  /* CTA */
  .her-cta { text-align: center; padding: clamp(70px,11vh,130px) 6vw;
    background: radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--gold) 10%, transparent), transparent); }
  .her-cta-title { font-size: clamp(1.9rem,5vw,3.2rem); font-weight: 700; margin: 0 0 12px; }
  .her-cta-sub { color: var(--muted); font-size: 1.05rem; margin: 0 0 28px; }

  @media (max-width: 640px) {
    .her-sechead { align-items: flex-start; }
    .her-grid-songs { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
    .her-tl-row { grid-template-columns: 60px 20px 1fr; }
    .her-tl-year { font-size: 1.05rem; }
    .her-gallery { columns: 2 140px; }
  }
`;
