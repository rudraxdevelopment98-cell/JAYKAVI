'use client';

import { useState, useTransition } from 'react';
import { backfillExactTitles } from './actions';

export default function BackfillTitlesButton() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ updated: number; checked: number } | null>(null);
  const [confirm, setConfirm] = useState(false);

  function run() {
    setConfirm(false);
    setResult(null);
    start(async () => {
      const r = await backfillExactTitles();
      setResult(r);
    });
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          disabled={pending}
          className="px-4 py-2 text-sm font-medium bg-neutral-800 border border-neutral-700
            rounded-lg hover:bg-neutral-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {pending ? 'Restoring…' : 'Restore Exact Titles'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-300">Overwrite titles from YouTube?</span>
          <button
            onClick={run}
            className="px-3 py-1.5 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition"
          >
            Yes, restore
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="px-3 py-1.5 text-sm border border-neutral-700 rounded-lg hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {result && (
        <span className="text-sm text-green-400">
          ✓ Updated {result.updated} of {result.checked} song{result.checked !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
