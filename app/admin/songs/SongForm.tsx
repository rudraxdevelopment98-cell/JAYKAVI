'use client';

import { useState, useTransition, useRef } from 'react';
import ImageUpload from '../_components/ImageUpload';
import LyricsEditor from './LyricsEditor';
import { fetchSingersAction } from './actions';

const PLATFORMS = [
  'youtube',
  'spotify',
  'amazon_music',
  'apple_music',
  'jiosaavn',
  'gaana',
  'wynk',
  'soundcloud',
  'other',
];

interface PlatformLink {
  platform: string;
  url: string;
  isPrimary: boolean;
}

interface Translation {
  language: string;
  text: string;
}

interface Song {
  title: string;
  subtitle: string | null;
  slug: string;
  altTitles: string[];
  lyricistCredit: string;
  composer: string | null;
  collectionId: string | null;
  language: string;
  genre: string[];
  mood: string[];
  releaseYear: number | null;
  artworkUrl: string | null;
  lyrics: string;
  viewCount: number;
  isTrending: boolean;
  youtubeId: string | null;
  spotifyTrackId: string | null;
  singerIds: string[];
  platformLinks: PlatformLink[];
  lyricsTranslations: Translation[];
}

interface Props {
  initial?: Song;
  action: (formData: FormData) => Promise<{ error: string } | void>;
  singers: { id: string; name: string }[];
  collections: { id: string; title: string }[];
  submitLabel?: string;
}

export default function SongForm({
  initial,
  action,
  singers,
  collections,
  submitLabel = 'Save',
}: Props) {
  const [artworkUrl, setArtworkUrl] = useState(initial?.artworkUrl ?? '');
  const [selectedSingers, setSelectedSingers] = useState<string[]>(initial?.singerIds ?? []);
  const [links, setLinks] = useState<PlatformLink[]>(initial?.platformLinks ?? []);
  const [translations, setTranslations] = useState<Translation[]>(
    initial?.lyricsTranslations ?? []
  );
  const [error, setError] = useState('');
  const [singerFetchMsg, setSingerFetchMsg] = useState('');
  const [isFetchingSingers, startFetchSingers] = useTransition();
  const youtubeIdRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const inputCls =
    'w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600';
  const labelCls = 'block text-sm font-medium text-neutral-300 mb-1';

  function toggleSinger(id: string) {
    setSelectedSingers((cur) =>
      cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]
    );
  }

  function addLink() {
    setLinks([...links, { platform: 'youtube', url: '', isPrimary: links.length === 0 }]);
  }
  function updateLink(i: number, patch: Partial<PlatformLink>) {
    setLinks(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function removeLink(i: number) {
    setLinks(links.filter((_, idx) => idx !== i));
  }

  function addTranslation() {
    setTranslations([...translations, { language: 'English', text: '' }]);
  }
  function updateTranslation(i: number, patch: Partial<Translation>) {
    setTranslations(translations.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function removeTranslation(i: number) {
    setTranslations(translations.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-800 bg-red-950/40 text-red-300 text-sm">
          {error}
        </div>
      )}
      {/* Basics */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-neutral-200">Basics</h2>

        <div>
          <label className={labelCls}>Title</label>
          <input
            name="title"
            defaultValue={initial?.title ?? ''}
            required
            className={inputCls}
          />
          <p className="text-xs text-neutral-500 mt-1">
            For harvested songs this is the exact YouTube title. Keep it as-is; edit the subtitle instead.
          </p>
        </div>

        <div>
          <label className={labelCls}>Subtitle <span className="text-neutral-500">(optional display line)</span></label>
          <input
            name="subtitle"
            defaultValue={initial?.subtitle ?? ''}
            placeholder="Cleaned / readable title shown under the main title"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              name="slug"
              defaultValue={initial?.slug ?? ''}
              placeholder="auto-generated"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Release year</label>
            <input
              name="releaseYear"
              type="number"
              defaultValue={initial?.releaseYear ?? ''}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Alternative titles (comma separated)</label>
          <input
            name="altTitles"
            defaultValue={(initial?.altTitles ?? []).join(', ')}
            className={inputCls}
          />
        </div>

        <ImageUpload
          value={artworkUrl}
          onChange={setArtworkUrl}
          folder="songs"
          label="Artwork"
          aspectRatio="square"
        />
        <input type="hidden" name="artworkUrl" value={artworkUrl} />
      </section>

      {/* Credits */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-neutral-200">Credits</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Lyricist credit</label>
            <input
              name="lyricistCredit"
              defaultValue={initial?.lyricistCredit ?? 'Jayesh Prajapati "JAYKAVI"'}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Composer</label>
            <input
              name="composer"
              defaultValue={initial?.composer ?? ''}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls} style={{ marginBottom: 0 }}>Performing singers</label>
            <button
              type="button"
              disabled={isFetchingSingers}
              onClick={() => {
                setSingerFetchMsg('');
                const ytId = youtubeIdRef.current?.value?.trim();
                if (!ytId) { setSingerFetchMsg('Add a YouTube ID first.'); return; }
                startFetchSingers(async () => {
                  try {
                    const r = await fetchSingersAction(ytId);
                    if (r.error) { setSingerFetchMsg(`Error: ${r.error}`); return; }
                    if (r.found.length === 0) {
                      setSingerFetchMsg('No singers found in video description.');
                      return;
                    }
                    const newIds = r.matched.map((s) => s.id).filter((id) => !selectedSingers.includes(id));
                    if (newIds.length > 0) setSelectedSingers((prev) => [...prev, ...newIds]);
                    const unmatched = r.found.filter((n) => !r.matched.some((m) => m.name.toLowerCase() === n.toLowerCase()));
                    const msg = [
                      r.matched.length > 0 && `Selected: ${r.matched.map((m) => m.name).join(', ')}`,
                      unmatched.length > 0 && `Not in DB yet: ${unmatched.join(', ')}`,
                    ].filter(Boolean).join(' · ');
                    setSingerFetchMsg(msg);
                  } catch (e: any) {
                    setSingerFetchMsg(`Error: ${e?.message ?? 'fetch failed'}`);
                  }
                });
              }}
              className="text-xs px-2.5 py-1 border border-violet-700/50 bg-violet-950/30 text-violet-300 rounded hover:bg-violet-900/40 disabled:opacity-50 transition"
            >
              {isFetchingSingers ? 'Fetching…' : '🎤 Fetch from YouTube'}
            </button>
          </div>
          {singerFetchMsg && (
            <p className="text-xs text-violet-300 mb-2">{singerFetchMsg}</p>
          )}
          {singers.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No singers in database. Add some first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-md">
              {singers.map((s) => {
                const checked = selectedSingers.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSinger(s.id)}
                    data-selected-singer={checked ? s.name : undefined}
                    className={`px-3 py-1.5 text-xs rounded-full border transition ${
                      checked
                        ? 'bg-amber-500 text-neutral-950 border-amber-500 font-medium'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}
          <input type="hidden" name="singerIds" value={selectedSingers.join(',')} />
        </div>

        <div>
          <label className={labelCls}>Collection</label>
          <select
            name="collectionId"
            defaultValue={initial?.collectionId ?? ''}
            className={inputCls}
          >
            <option value="">— none —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Meta */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-neutral-200">Metadata</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Language</label>
            <input
              name="language"
              defaultValue={initial?.language ?? 'Gujarati'}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Genres (comma sep.)</label>
            <input
              name="genre"
              defaultValue={(initial?.genre ?? []).join(', ')}
              placeholder="Lok Geet, Bhajan"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Moods (comma sep.)</label>
            <input
              name="mood"
              defaultValue={(initial?.mood ?? []).join(', ')}
              placeholder="Devotional, Energetic"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>View count</label>
            <input
              name="viewCount"
              type="number"
              defaultValue={initial?.viewCount ?? 0}
              className={inputCls}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isTrending"
                defaultChecked={initial?.isTrending ?? false}
              />
              Mark as trending
            </label>
          </div>
        </div>
      </section>

      {/* Embeds */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-neutral-200">Embeds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>YouTube video ID</label>
            <input
              ref={youtubeIdRef}
              name="youtubeId"
              defaultValue={initial?.youtubeId ?? ''}
              placeholder="dQw4w9WgXcQ"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Spotify track ID</label>
            <input
              name="spotifyTrackId"
              defaultValue={initial?.spotifyTrackId ?? ''}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Platform links */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-200">Streaming links</h2>
          <button
            type="button"
            onClick={addLink}
            className="text-sm px-3 py-1 border border-neutral-700 rounded-md hover:bg-neutral-800"
          >
            + Add link
          </button>
        </div>
        <input
          type="hidden"
          name="platformLinks"
          value={JSON.stringify(links)}
        />
        {links.length === 0 && (
          <p className="text-sm text-neutral-500">No streaming links added yet.</p>
        )}
        <div className="space-y-2">
          {links.map((l, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 bg-neutral-900/60 border border-neutral-800 rounded-md"
            >
              <select
                value={l.platform}
                onChange={(e) => updateLink(i, { platform: e.target.value })}
                className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={l.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-sm"
              />
              <label className="flex items-center gap-1 text-xs text-neutral-400">
                <input
                  type="checkbox"
                  checked={l.isPrimary}
                  onChange={(e) => updateLink(i, { isPrimary: e.target.checked })}
                />
                primary
              </label>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-red-400 text-sm px-2 hover:bg-red-950/40 rounded"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lyrics */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-neutral-200">Lyrics</h2>
        <LyricsEditor defaultValue={initial?.lyrics ?? ''} />
      </section>

      {/* Translations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-200">Translations</h2>
          <button
            type="button"
            onClick={addTranslation}
            className="text-sm px-3 py-1 border border-neutral-700 rounded-md hover:bg-neutral-800"
          >
            + Add translation
          </button>
        </div>
        <input
          type="hidden"
          name="lyricsTranslations"
          value={JSON.stringify(translations)}
        />
        {translations.length === 0 && (
          <p className="text-sm text-neutral-500">No translations yet.</p>
        )}
        <div className="space-y-3">
          {translations.map((t, i) => (
            <div key={i} className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={t.language}
                  onChange={(e) => updateTranslation(i, { language: e.target.value })}
                  placeholder="Language"
                  className="px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeTranslation(i)}
                  className="ml-auto text-red-400 text-sm px-2 hover:bg-red-950/40 rounded"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={t.text}
                onChange={(e) => updateTranslation(i, { text: e.target.value })}
                rows={5}
                className={`${inputCls} font-mono`}
                placeholder="Translation text…"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="pt-2 sticky bottom-0 bg-neutral-950/95 backdrop-blur py-4 border-t border-neutral-800 -mx-4 px-4 md:-mx-8 md:px-8">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
