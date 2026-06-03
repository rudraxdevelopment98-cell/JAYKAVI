'use client';

import { useState, useRef, useEffect } from 'react';
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

export default function HarvesterQueue({ candidates }: { candidates: Candidate[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const visible = candidates.filter((c) => !dismissed.has(c.id));
  const allSelected = visible.length > 0 && selected.size === visible.length;
  const someSelected = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  // Auto-clear result banner after 4 s
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setResult(null), 4000);
    return () => clearTimeout(t);
  }, [result]);

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
    if (!confirm(`Quick-approve ${n} candidate${n !== 1 ? 's' : ''} using their existing titles and singer guesses? Duplicates will be skipped.`)) return;
    setBusy('approve');
    const r = await bulkApproveSimple(Array.from(selected));
    // Dismiss approved ones (skipped stay — admin can review manually)
    const toKeep = new Set(selected);
    // We don't know which specific IDs were skipped vs approved, so dismiss all selected
    selected.forEach((id) => {
      setDismissed((prev) => new Set([...prev, id]));
    });
    setSelected(new Set());
    setBusy(null);
    const msg = r.approved === 0 && r.skipped > 0
      ? `All ${r.skipped} were duplicates — nothing added.`
      : `✓ ${r.approved} approved${r.skipped > 0 ? ` · ${r.skipped} skipped (duplicates)` : ''}`;
    setResult(msg);
  }

  async function handleBulkReject() {
    const n = selected.size;
    if (!confirm(`Reject ${n} candidate${n !== 1 ? 's' : ''}?`)) return;
    setBusy('reject');
    const r = await bulkRejectCandidates(Array.from(selected));
    selected.forEach((id) => {
      setDismissed((prev) => new Set([...prev, id]));
    });
    setSelected(new Set());
    setBusy(null);
    setResult(`✕ ${r.rejected} rejected`);
  }

  if (visible.length === 0) {
    return (
      <div className="px-5 py-8 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center text-neutral-400">
        No songs waiting for review. Run the harvester to find new songs.
      </div>
    );
  }

  return (
    <div>
      {/* Select-all row */}
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

      {/* Candidate cards */}
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
              <div className={`flex-1 min-w-0 rounded-xl transition-shadow ${
                isSelected ? 'ring-1 ring-amber-600/50 shadow-lg shadow-amber-950/20' : ''
              }`}>
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
        {/* Approve */}
        <button
          onClick={handleBulkApprove}
          disabled={busy !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-400
            border border-green-900/60 rounded-lg hover:bg-green-950/50 transition disabled:opacity-50 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
          {busy === 'approve' ? 'Approving…' : `Approve ${selected.size}`}
        </button>
        {/* Reject */}
        <button
          onClick={handleBulkReject}
          disabled={busy !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400
            border border-red-900/60 rounded-lg hover:bg-red-950/50 transition disabled:opacity-50 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          {busy === 'reject' ? 'Rejecting…' : `Reject ${selected.size}`}
        </button>
      </div>

      {/* Result toast */}
      {result && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
          px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl
          text-sm text-neutral-200 shadow-xl animate-fade-in whitespace-nowrap">
          {result}
        </div>
      )}
    </div>
  );
}
