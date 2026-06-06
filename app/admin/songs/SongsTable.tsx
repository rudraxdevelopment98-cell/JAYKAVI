'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bulkDeleteSongs, bulkEditSongs } from './actions';

interface Song {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  releaseYear: number | null;
  viewCount: number;
  isTrending: boolean;
  language: string;
  genre: string[];
  collectionId: string | null;
  artworkUrl: string | null;
  singers: { singer: { name: string } }[];
  _count: { platformLinks: number };
}

interface Collection { id: string; title: string }
interface Facets { languages: string[]; genres: string[]; moods: string[] }

/* ── tiny inline select ── */
function Sel({
  label, value, options, onChange, nullable,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  nullable?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 text-neutral-100 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <option value="">— no change —</option>
        {nullable && <option value="__clear__">Clear / none</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function SongsTable({
  songs,
  collections,
  facets,
}: {
  songs: Song[];
  collections: Collection[];
  facets: Facets;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  /* bulk-edit field state — empty string means "don't touch" */
  const [editCollection, setEditCollection] = useState('');
  const [editLanguage, setEditLanguage]     = useState('');
  const [editGenre, setEditGenre]           = useState('');
  const [editTrending, setEditTrending]     = useState('');
  const [editYear, setEditYear]             = useState('');

  const allSelected  = songs.length > 0 && selected.size === songs.length;
  const someSelected = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  function toggleAll()        { setSelected(allSelected ? new Set() : new Set(songs.map((s) => s.id))); }
  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function resetEditFields() {
    setEditCollection(''); setEditLanguage(''); setEditGenre('');
    setEditTrending(''); setEditYear('');
  }

  async function handleBulkEdit() {
    const patch: Parameters<typeof bulkEditSongs>[1] = {};

    if (editCollection === '__clear__') patch.collectionId = null;
    else if (editCollection)            patch.collectionId = editCollection;

    if (editLanguage) patch.language = editLanguage;
    if (editGenre)    patch.genre    = [editGenre];
    if (editTrending === 'true')  patch.isTrending = true;
    if (editTrending === 'false') patch.isTrending = false;
    if (editYear) {
      const y = parseInt(editYear, 10);
      patch.releaseYear = Number.isFinite(y) ? y : null;
    }

    if (!Object.keys(patch).length) { showToast('Choose at least one field to change.'); return; }

    setBusy(true);
    const { updated } = await bulkEditSongs(Array.from(selected), patch);
    setBusy(false);
    resetEditFields();
    setSelected(new Set());
    router.refresh();
    showToast(`Updated ${updated} song${updated !== 1 ? 's' : ''}.`);
  }

  async function handleBulkDelete() {
    const n = selected.size;
    if (!confirm(`Permanently delete ${n} song${n !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    setBusy(true);
    await bulkDeleteSongs(Array.from(selected));
    setSelected(new Set());
    setBusy(false);
    router.refresh();
  }

  const collectionOpts = collections.map((c) => ({ value: c.id, label: c.title }));
  const languageOpts   = facets.languages.map((l) => ({ value: l, label: l }));
  const genreOpts      = facets.genres.map((g)   => ({ value: g, label: g }));
  const trendingOpts   = [{ value: 'true', label: '✅ Trending' }, { value: 'false', label: '✗ Not trending' }];

  if (songs.length === 0) {
    return (
      <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
        No songs yet.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-left">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all songs"
                  className="rounded border-neutral-600 accent-amber-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 w-12" />
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Singers</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Collection</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Year</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Views</th>
              <th className="px-4 py-3 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {songs.map((s) => {
              const isSelected = selected.has(s.id);
              const coll = collections.find((c) => c.id === s.collectionId);
              return (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-amber-950/25 hover:bg-amber-950/30' : 'hover:bg-neutral-900/60'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(s.id)}
                      aria-label={`Select ${s.title}`}
                      className="rounded border-neutral-600 accent-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    {s.artworkUrl
                      ? <img src={s.artworkUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      : <div className="w-10 h-10 rounded bg-neutral-800" />}
                  </td>
                  <td className="px-4 py-2.5 max-w-[320px]">
                    <Link href={`/admin/songs/${s.id}`} className="font-medium hover:underline line-clamp-2">{s.title}</Link>
                    {s.subtitle && s.subtitle !== s.title && (
                      <div className="text-xs text-amber-600/80 dark:text-amber-400/70 truncate">{s.subtitle}</div>
                    )}
                    <div className="text-xs text-neutral-500 truncate">{s.slug}</div>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-300 max-w-[160px] truncate hidden sm:table-cell">
                    {s.singers.map((sg) => sg.singer.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs hidden md:table-cell">
                    {coll ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                        {coll.title}
                      </span>
                    ) : <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-300 hidden md:table-cell">{s.releaseYear ?? '—'}</td>
                  <td className="px-4 py-2.5 text-neutral-300 hidden md:table-cell">{s.viewCount?.toLocaleString() ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {s.isTrending && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-900/60 text-amber-300 whitespace-nowrap">
                          trending
                        </span>
                      )}
                      {s.genre?.[0] && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-400 whitespace-nowrap hidden lg:inline">
                          {s.genre[0]}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════
          FLOATING BULK-ACTION BAR
      ══════════════════════════════════════════════════ */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,860px)]
          bg-neutral-950 border border-neutral-700 rounded-2xl shadow-2xl shadow-black/70
          transition-all duration-200 ${
            selected.size > 0
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-5 pointer-events-none'
          }`}
      >
        {/* Top row: count + quick actions */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-800">
          <span className="text-sm font-bold text-amber-400 tabular-nums whitespace-nowrap">
            {selected.size} selected
          </span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition whitespace-nowrap"
          >
            Deselect all
          </button>
          <div className="flex-1" />
          <button
            onClick={handleBulkEdit}
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold
              bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition disabled:opacity-50 whitespace-nowrap"
          >
            {busy ? 'Saving…' : 'Apply changes'}
          </button>
          <div className="w-px h-5 bg-neutral-700 shrink-0" />
          <button
            onClick={handleBulkDelete}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400
              border border-red-900/60 rounded-lg hover:bg-red-950/50 transition disabled:opacity-50 whitespace-nowrap"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Delete
          </button>
        </div>

        {/* Bottom row: field editors */}
        <div className="flex items-end gap-4 px-5 py-3 flex-wrap">
          <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest self-center whitespace-nowrap">
            Bulk edit:
          </p>

          <Sel
            label="Collection"
            value={editCollection}
            options={collectionOpts}
            onChange={setEditCollection}
            nullable
          />

          <Sel
            label="Language"
            value={editLanguage}
            options={languageOpts}
            onChange={setEditLanguage}
          />

          <Sel
            label="Genre"
            value={editGenre}
            options={genreOpts}
            onChange={setEditGenre}
          />

          <Sel
            label="Trending"
            value={editTrending}
            options={trendingOpts}
            onChange={setEditTrending}
          />

          {/* Year: free-text since it's numeric */}
          <div className="flex flex-col gap-1 min-w-[80px]">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">Year</span>
            <input
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              placeholder="e.g. 2023"
              className="bg-neutral-800 border border-neutral-700 text-neutral-100 text-xs rounded-lg
                px-2 py-1.5 w-24 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={resetEditFields}
            className="text-[10px] text-neutral-600 hover:text-neutral-400 transition self-end mb-0.5 whitespace-nowrap"
          >
            Reset fields
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-neutral-800 border border-neutral-700
          rounded-xl text-sm text-neutral-100 shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
