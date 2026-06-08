'use client';
import { useState, useTransition } from 'react';
import { mergeDuplicateSingers } from './actions';

export default function MergeDuplicatesButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState('');

  function run() {
    if (!confirm('Find singers with matching names (ignoring case/whitespace/honorifics) and merge them into one canonical record? Song links will be preserved.')) return;
    setMsg('');
    start(async () => {
      try {
        const r = await mergeDuplicateSingers();
        if (r.merged === 0) {
          setMsg('No duplicates found.');
        } else {
          setMsg(`Merged ${r.merged} duplicate${r.merged !== 1 ? 's' : ''} across ${r.groups} name group${r.groups !== 1 ? 's' : ''}.`);
        }
      } catch (e: any) {
        setMsg(`Failed: ${e?.message ?? 'unknown error'}`);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-xs text-neutral-300">{msg}</span>}
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="shrink-0 px-3 py-2 text-sm border border-amber-700/60 bg-amber-950/30 text-amber-300 rounded-md hover:bg-amber-900/40 disabled:opacity-50 transition"
      >
        {pending ? 'Merging…' : 'Merge duplicates'}
      </button>
    </div>
  );
}
