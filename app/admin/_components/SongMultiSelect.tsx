'use client';

import { useMemo, useState, useTransition } from 'react';

interface SongLite {
  id: string;
  title: string;
  subtitle?: string;
}

export default function SongMultiSelect({
  allSongs,
  selectedIds: initialSelected,
  action,
  label = 'Songs in this group',
  saveLabel = 'Save songs',
}: {
  allSongs: SongLite[];
  selectedIds: string[];
  action: (songIds: string[]) => Promise<{ error?: string } | void>;
  label?: string;
  saveLabel?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [q, setQ] = useState('');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return allSongs;
    return allSongs.filter(
      (s) => s.title.toLowerCase().includes(n) || s.subtitle?.toLowerCase().includes(n),
    );
  }, [allSongs, q]);

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((s) => next.add(s.id));
      return next;
    });
  }
  function clearAll() {
    setSaved(false);
    setSelected(new Set());
  }

  function save() {
    setError('');
    startTransition(async () => {
      const res = await action(Array.from(selected));
      if (res?.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <div className="mt-8 p-4 sm:p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="text-sm font-medium">
          {label} <span className="text-neutral-500">· {selected.size} selected</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button type="button" onClick={selectAllFiltered} className="text-neutral-400 hover:text-white transition">
            Select all{q ? ' (filtered)' : ''}
          </button>
          <button type="button" onClick={clearAll} className="text-neutral-400 hover:text-white transition">
            Clear
          </button>
        </div>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search songs…"
        className="w-full px-3 py-2 mb-3 bg-neutral-950 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-neutral-600"
      />

      <div className="max-h-72 overflow-y-auto rounded-lg border border-neutral-800 divide-y divide-neutral-800/70">
        {filtered.length === 0 ? (
          <p className="text-xs text-neutral-500 p-4">No songs match.</p>
        ) : (
          filtered.map((s) => {
            const on = selected.has(s.id);
            return (
              <label
                key={s.id}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition ${
                  on ? 'bg-amber-500/10' : 'hover:bg-neutral-800/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(s.id)}
                  className="w-4 h-4 accent-amber-500 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm truncate">{s.title}</span>
                  {s.subtitle && <span className="block text-xs text-neutral-500 truncate">{s.subtitle}</span>}
                </span>
              </label>
            );
          })
        )}
      </div>

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="px-4 py-2 bg-white text-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {isPending ? 'Saving…' : saveLabel}
        </button>
        {saved && <span className="text-xs text-green-400">✓ Saved</span>}
      </div>
    </div>
  );
}
