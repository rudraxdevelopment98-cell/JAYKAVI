'use client';
import { useState } from 'react';
import { reQueueDeletedSongs } from './actions';

export default function ReQueueButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setResult(null);
    try {
      const { requeued } = await reQueueDeletedSongs();
      setResult(
        requeued > 0
          ? `${requeued} candidate${requeued !== 1 ? 's' : ''} moved back to pending queue.`
          : 'No orphaned candidates found — all approved songs still exist.',
      );
    } catch (e: unknown) {
      setResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handle}
        disabled={busy}
        className="self-start px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition"
      >
        {busy ? 'Checking…' : 'Re-queue deleted songs'}
      </button>
      {result && (
        <p className="text-sm text-neutral-400">{result}</p>
      )}
    </div>
  );
}
