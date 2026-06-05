'use client';

import { useState } from 'react';
import ImageField from '../traditional/ImageField';
import VideoField from '../traditional/VideoField';
import type { HeritageSettings } from '@/lib/data';

const inputCls = 'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';
const labelCls = 'block text-xs font-medium text-neutral-400 mb-1';

export default function HeritageForm({
  settings,
  action,
}: {
  settings: HeritageSettings;
  action: (formData: FormData) => Promise<void>;
}) {
  const [gallery, setGallery] = useState<string[]>(settings.gallery ?? []);
  const [galleryInput, setGalleryInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState(settings.events ?? []);
  const [stats, setStats] = useState(settings.stats ?? []);

  async function uploadGallery(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'misc');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setGallery((g) => [...g, data.url]);
    } finally {
      setUploading(false);
    }
  }

  function addGalleryUrl() {
    const v = galleryInput.trim();
    if (v) { setGallery((g) => [...g, v]); setGalleryInput(''); }
  }

  return (
    <form action={action} className="space-y-8">
      {/* ── Hero ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-5">
        <h2 className="font-semibold text-base">Hero Banner</h2>
        <ImageField name="heroPhoto" label="Artist Photo (hero banner)" defaultValue={settings.heroPhoto}
          note="Grand full-bleed banner photo of the artist. Ideal: wide, high-resolution." />
        <VideoField name="heroVideo" label="Hero Video (optional)" defaultValue={settings.heroVideo}
          note="Optional looping background video. Takes priority over the photo." />
        <div>
          <label className={labelCls}>Eyebrow</label>
          <input name="eyebrow" defaultValue={settings.eyebrow} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Title (artist name)</label>
          <input name="title" defaultValue={settings.title} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Subtitle</label>
          <input name="subtitle" defaultValue={settings.subtitle} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Featured Quote (optional)</label>
          <input name="quote" defaultValue={settings.quote ?? ''} className={inputCls}
            placeholder="A line of verse to feature in the hero" />
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Stat Strip</h2>
          <button type="button" onClick={() => setStats((s) => [...s, { value: '', label: '' }])}
            className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">+ Add stat</button>
        </div>
        <p className="text-xs text-neutral-500">The four-up counter strip below the hero (e.g. <span className="text-neutral-300">25+ · વર્ષોની પરંપરા</span>).</p>
        <div className="space-y-3">
          {stats.map((st, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-2 items-center">
              <input value={st.value} placeholder="25+"
                onChange={(e) => setStats((arr) => arr.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                className={inputCls} />
              <input value={st.label} placeholder="વર્ષોની પરંપરા"
                onChange={(e) => setStats((arr) => arr.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                className={inputCls} />
              <button type="button" onClick={() => setStats((arr) => arr.filter((_, j) => j !== i))}
                className="px-3 py-2 text-sm text-red-400 border border-red-900/50 rounded-md hover:bg-red-950/40 transition">✕</button>
            </div>
          ))}
        </div>
        <input type="hidden" name="statsJson" value={JSON.stringify(stats)} />
      </section>

      {/* ── About + Vintage Player ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-5">
        <h2 className="font-semibold text-base">About &amp; Vintage Player</h2>
        <ImageField name="aboutPhoto" label="About Photo (optional)" defaultValue={settings.aboutPhoto}
          note="Small portrait shown inside the About card. Falls back to the hero photo." />
        <div>
          <label className={labelCls}>About Paragraph (optional)</label>
          <textarea name="aboutBody" defaultValue={settings.aboutBody ?? ''} rows={4} className={inputCls}
            placeholder="Defaults to the artist bio if left blank." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Player Heading</label>
            <input name="audioTitle" defaultValue={settings.audioTitle} className={inputCls} placeholder="હાલ સાંભળો" />
          </div>
          <div>
            <label className={labelCls}>Featured Track</label>
            <input name="audioTrack" defaultValue={settings.audioTrack ?? ''} className={inputCls} placeholder="રામ નામ નો સરગમ" />
          </div>
        </div>
      </section>

      {/* ── Closing quote ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-4">
        <h2 className="font-semibold text-base">Closing Quote</h2>
        <div>
          <label className={labelCls}>Footer Devotional Quote (optional)</label>
          <input name="footerQuote" defaultValue={settings.footerQuote ?? ''} className={inputCls}
            placeholder="॥ સંગીત એ સાધના છે, અને ભજન એ આત્માની ભાષા છે ॥" />
        </div>
      </section>

      {/* ── Sections visibility ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
        <h2 className="font-semibold text-base mb-3">Homepage Sections</h2>
        <p className="text-xs text-neutral-500 mb-4">Toggle which sections appear on the Heritage homepage.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            ['showStats', 'Stat Strip', settings.show.stats],
            ['showBhajans', 'Bhajan Collections', settings.show.bhajans],
            ['showAudio', 'About & Player', settings.show.audio],
            ['showVideos', 'Video Gallery', settings.show.videos],
            ['showGallery', 'Photo Gallery', settings.show.gallery],
            ['showLegacy', 'Legacy Timeline', settings.show.legacy],
            ['showEvents', 'Events', settings.show.events],
            ['showPoetry', 'Poetry & Lyrics', settings.show.poetry],
          ] as const).map(([name, label, on]) => (
            <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name={name} defaultChecked={on} className="w-4 h-4 accent-amber-500" />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-4">
        <h2 className="font-semibold text-base">Gallery Images</h2>
        {gallery.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {gallery.map((src, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-20 object-cover rounded-lg border border-neutral-800" />
                <button type="button" onClick={() => setGallery((g) => g.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-red-300 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-center flex-wrap">
          <input value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)}
            placeholder="Paste image URL" className={`${inputCls} flex-1 min-w-[180px]`} />
          <button type="button" onClick={addGalleryUrl}
            className="px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">Add URL</button>
          <label className="px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition cursor-pointer whitespace-nowrap">
            {uploading ? 'Uploading…' : '⬆ Upload'}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadGallery(f); e.target.value = ''; }} />
          </label>
        </div>
        <input type="hidden" name="galleryJson" value={JSON.stringify(gallery)} />
      </section>

      {/* ── Legacy ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-4">
        <h2 className="font-semibold text-base">Legacy</h2>
        <div>
          <label className={labelCls}>Legacy Section Title</label>
          <input name="legacyTitle" defaultValue={settings.legacyTitle} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Legacy Paragraph (optional)</label>
          <textarea name="legacyBody" defaultValue={settings.legacyBody ?? ''} rows={4} className={inputCls} />
        </div>
      </section>

      {/* ── Events ── */}
      <section className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Events</h2>
          <button type="button" onClick={() => setEvents((e) => [...e, { date: '', title: '', place: '' }])}
            className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition">+ Add event</button>
        </div>
        {events.length === 0 && <p className="text-xs text-neutral-500">No events yet.</p>}
        <div className="space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_auto] gap-2 items-center">
              <input value={ev.date} placeholder="Date"
                onChange={(e) => setEvents((arr) => arr.map((x, j) => j === i ? { ...x, date: e.target.value } : x))}
                className={inputCls} />
              <input value={ev.title} placeholder="Title"
                onChange={(e) => setEvents((arr) => arr.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                className={inputCls} />
              <input value={ev.place} placeholder="Place"
                onChange={(e) => setEvents((arr) => arr.map((x, j) => j === i ? { ...x, place: e.target.value } : x))}
                className={inputCls} />
              <button type="button" onClick={() => setEvents((arr) => arr.filter((_, j) => j !== i))}
                className="px-3 py-2 text-sm text-red-400 border border-red-900/50 rounded-md hover:bg-red-950/40 transition">✕</button>
            </div>
          ))}
        </div>
        <input type="hidden" name="eventsJson" value={JSON.stringify(events)} />
      </section>

      <button type="submit"
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-semibold text-sm transition">
        Save Heritage Settings
      </button>
    </form>
  );
}
