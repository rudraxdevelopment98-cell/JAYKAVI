'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllCandidates } from './actions';

export default function ClearAllButton({ count }: { count: number }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (count === 0) return null;

  async function handleClear() {
    setBusy(true);
    setError(null);
    try {
      await clearAllCandidates();
      setConfirm(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to clear');
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <span className="text-xs text-red-400">✗ {error}</span>
    );
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Clear all {count} results?</span>
        <button
          onClick={handleClear}
          disabled={busy}
          className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-md font-medium transition disabled:opacity-50"
        >
          {busy ? 'Clearing…' : 'Yes, clear all'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-3 py-1.5 text-xs border border-neutral-700 rounded-md hover:bg-neutral-800 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="px-3 py-1.5 text-xs text-red-400 border border-red-900/60 rounded-md hover:bg-red-950/40 transition"
    >
      Clear all results
    </button>
  );
}
