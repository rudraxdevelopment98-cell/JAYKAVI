'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CandidateCard from './CandidateCard';
import { bulkRejectCandidates, bulkApproveSimple } from './actions';

interface Candidate {
  id: string;
  cleanTitle: string;
  rawTitle: string;
  singerGuess: string | null;
  releaseYear: number | null;
  viewCount: number | null;
  thumbnailUrl: string | null;
  youtubeId: string;
  channelTitle: string | null;
  description: string | null;
}

type SortKey = 'newest' | 'oldest' | 'views_high' | 'views_low';

export default function HarvesterQueue({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSinger, setFilterSinger] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const active_candidates = candidates.filter((c) => !dismissed.has(c.id));

  // Distinct years and singers for filter dropdowns
  const years = useMemo(() => {
    const s = new Set(active_candidates.map((c) => c.releaseYear).filter(Boolean) as number[]);
    return Array.from(s).sort((a, b) => b - a);
  }, [active_candidates]);

  const singerOptions = useMemo(() => {
    const s = new Set(active_candidates.map((c) => c.singerGuess).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [active_candidates]);

  // Filtered + sorted
  const visible = useMemo(() => {
    let list = active_candidates;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.rawTitle.toLowerCase().includes(q) ||
          c.cleanTitle.toLowerCase().includes(q) ||
          (c.singerGuess ?? '').toLowerCase().includes(q) ||
          (c.channelTitle ?? '').toLowerCase().includes(q),
      );
    }
    if (filterSinger) list = list.filter((c) => c.singerGuess === filterSinger);
    if (filterYear) list = list.filter((c) => String(c.releaseYear) === filterYear);

    list = [...list];
    if (sort === 'newest') list.sort((a, b) => (b.releaseYear ?? 0) - (a.releaseYear ?? 0));
    else if (sort === 'oldest') list.sort((a, b) => (a.releaseYear ?? 0) - (b.releaseYear ?? 0));
    else if (sort === 'views_high') list.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    else if (sort === 'views_low') list.sort((a, b) => (a.viewCount ?? 0) - (b.viewCount ?? 0));
    return list;
  }, [active_candidates, search, filterSinger, filterYear, sort]);

  const allSelected = visible.length > 0 && selected.size === visible.length;
  const someSelected = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), 5000);
    return () => clearTimeout(t);
  }, [result]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 7000);
    return () => clearTimeout(t);
  }, [error]);

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visible.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function dismissOne(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleBulkApprove() {
    const n = selected.size;
    if (
      !confirm(
        `Quick-approve ${n} candidate${n !== 1 ? 's' : ''} using their existing titles and singer guesses? Duplicates will be skipped.`,
      )
    )
      return;
    setBusy('approve');
    setError(null);
    try {
      const r = await bulkApproveSimple(Array.from(selected));
      selected.forEach((id) => setDismissed((prev) => new Set([...prev, id])));
      setSelected(new Set());
      const msg =
        r.approved === 0 && r.skipped > 0
          ? `All ${r.skipped} were duplicates — nothing added.`
          : `✓ ${r.approved} approved${r.skipped > 0 ? ` · ${r.skipped} skipped (duplicates)` : ''}`;
      setResult(msg);
      router.refresh();
    } catch (e: any) {
      setError(`Approve failed: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setBusy(null);
    }
  }

  async function handleBulkReject() {
    const n = selected.size;
    if (!confirm(`Reject ${n} candidate${n !== 1 ? 's' : ''}?`)) return;
    setBusy('reject');
    setError(null);
    try {
      const r = await bulkRejectCandidates(Array.from(selected));
      selected.forEach((id) => setDismissed((prev) => new Set([...prev, id])));
      setSelected(new Set());
      setResult(`✕ ${r.rejected} rejected`);
      router.refresh();
    } catch (e: any) {
      setError(`Reject failed: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setBusy(null);
    }
  }

  // Stats
  const withSinger = active_candidates.filter((c) => c.singerGuess).length;
  const withViews = active_candidates.filter((c) => (c.viewCount ?? 0) > 0);
  const topViews = withViews.length > 0 ? Math.max(...withViews.map((c) => c.viewCount!)) : 0;

  const hasFilter = !!(search.trim() || filterSinger || filterYear);

  if (active_candidates.length === 0) {
    return (
      <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
        No songs waiting for review. Run the harvester to find new songs.
      </div>
    );
  }

  const selectCls =
    'text-sm bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500 cursor-pointer';

  return (
    <div>
      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatChip label="Total" value={active_candidates.length} color="text-neutral-300" />
        <StatChip label="Singer detected" value={withSinger} color="text-violet-400" />
        <StatChip label="No singer" value={active_candidates.length - withSinger} color="text-amber-400" />
        <StatChip
          label="Top views"
          value={topViews >= 1_000_000
            ? `${(topViews / 1_000_000).toFixed(1)}M`
            : topViews >= 1_000
            ? `${(topViews / 1_000).toFixed(0)}K`
            : String(topViews)}
          color="text-sky-400"
        />
      </div>

      {/* ── Filter / sort bar ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden
          >
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title, singer…"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800
              rounded-lg text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Singer filter */}
        {singerOptions.length > 0 && (
          <select value={filterSinger} onChange={(e) => setFilterSinger(e.target.value)} className={selectCls}>
            <option value="">All singers</option>
            {singerOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {/* Year filter */}
        {years.length > 0 && (
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={selectCls}>
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="views_high">Most viewed</option>
          <option value="views_low">Least viewed</option>
        </select>

        {/* Clear filters */}
        {hasFilter && (
          <button
            onClick={() => { setSearch(''); setFilterSinger(''); setFilterYear(''); }}
            className="text-xs text-amber-500 hover:text-amber-400 transition whitespace-nowrap"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* ── Filter result count ── */}
      {hasFilter && (
        <p className="text-xs text-neutral-500 mb-3">
          Showing {visible.length} of {active_candidates.length} candidates
        </p>
      )}

      {/* ── Select-all row ── */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <input
          ref={selectAllRef}
          type="checkbox"
          id="hq-select-all"
          checked={allSelected}
          onChange={toggleAll}
          aria-label="Select all candidates"
          className="rounded border-neutral-600 accent-amber-500 cursor-pointer w-4 h-4"
        />
        <label htmlFor="hq-select-all" className="text-sm text-neutral-400 cursor-pointer select-none">
          {allSelected ? 'Deselect all' : `Select all ${visible.length}`}
        </label>
        {selected.size > 0 && (
          <span className="ml-auto text-xs text-neutral-500">
            {selected.size} of {visible.length} selected
          </span>
        )}
      </div>

      {/* ── No filter results ── */}
      {visible.length === 0 && (
        <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400 text-sm">
          No candidates match your filters.
        </div>
      )}

      {/* ── Candidate cards ── */}
      <div className="space-y-3">
        {visible.map((c) => {
          const isSelected = selected.has(c.id);
          return (
            <div key={c.id} className="relative flex gap-3 items-start">
              {/* Checkbox column */}
              <div className="flex-shrink-0 pt-4 pl-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOne(c.id)}
                  aria-label={`Select ${c.cleanTitle}`}
                  className="rounded border-neutral-600 accent-amber-500 cursor-pointer w-4 h-4"
                />
              </div>
              {/* Card */}
              <div
                className={`flex-1 min-w-0 rounded-xl transition-shadow ${
                  isSelected ? 'ring-1 ring-amber-600/50 shadow-lg shadow-amber-950/20' : ''
                }`}
              >
                <CandidateCard c={c} onDismiss={() => dismissOne(c.id)} />
              </div>
            </div>
          );
        })}
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
          onClick={handleBulkApprove}
          disabled={busy !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-400
            border border-green-900/60 rounded-lg hover:bg-green-950/50 transition disabled:opacity-50 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {busy === 'approve' ? 'Approving…' : `Approve ${selected.size}`}
        </button>
        <button
          onClick={handleBulkReject}
          disabled={busy !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400
            border border-red-900/60 rounded-lg hover:bg-red-950/50 transition disabled:opacity-50 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {busy === 'reject' ? 'Rejecting…' : `Reject ${selected.size}`}
        </button>
      </div>

      {/* ── Toasts ── */}
      {result && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
          px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl
          text-sm text-neutral-200 shadow-xl whitespace-nowrap animate-fade-in">
          {result}
        </div>
      )}
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
          px-4 py-2 bg-red-950 border border-red-700 rounded-xl
          text-sm text-red-300 shadow-xl whitespace-nowrap animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className={`text-xl font-bold tabular-nums leading-tight ${color}`}>{value}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}
