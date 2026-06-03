'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bulkDeleteSongs } from './actions';

interface Song {
  id: string;
  title: string;
  slug: string;
  releaseYear: number | null;
  viewCount: number;
  isTrending: boolean;
  artworkUrl: string | null;
  singers: { singer: { name: string } }[];
  _count: { platformLinks: number };
}

export default function SongsTable({ songs }: { songs: Song[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = songs.length > 0 && selected.size === songs.length;
  const someSelected = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(songs.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
              <th className="px-4 py-3 font-medium hidden md:table-cell">Year</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Views</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Links</th>
              <th className="px-4 py-3 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {songs.map((s) => {
              const isSelected = selected.has(s.id);
              return (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-amber-950/25 hover:bg-amber-950/30'
                      : 'hover:bg-neutral-900/60'
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
                    {s.artworkUrl ? (
                      <img src={s.artworkUrl} alt="" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-neutral-800" />
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/songs/${s.id}`} className="font-medium hover:underline">
                      {s.title}
                    </Link>
                    <div className="text-xs text-neutral-500">{s.slug}</div>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-300 max-w-[180px] truncate hidden sm:table-cell">
                    {s.singers.map((sg) => sg.singer.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-300 hidden md:table-cell">{s.releaseYear ?? '—'}</td>
                  <td className="px-4 py-2.5 text-neutral-300 hidden md:table-cell">{s.viewCount?.toLocaleString() ?? '—'}</td>
                  <td className="px-4 py-2.5 text-neutral-300 hidden lg:table-cell">{s._count.platformLinks}</td>
                  <td className="px-4 py-2.5">
                    {s.isTrending && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-900/60 text-amber-300 whitespace-nowrap">
                        trending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Floating bulk-action bar ── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
          bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl shadow-black/60
          transition-all duration-200 ${
            selected.size > 0
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <span className="text-sm font-semibold text-neutral-100 tabular-nums">
          {selected.size} selected
        </span>
        <button
          onClick={() => setSelected(new Set())}
          className="text-xs text-neutral-400 hover:text-neutral-200 transition whitespace-nowrap"
        >
          Deselect all
        </button>
        <div className="w-px h-5 bg-neutral-700 shrink-0" />
        <button
          onClick={handleBulkDelete}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400
            border border-red-900/60 rounded-lg hover:bg-red-950/50 transition disabled:opacity-50 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          {busy ? 'Deleting…' : `Delete ${selected.size}`}
        </button>
      </div>
    </div>
  );
}
