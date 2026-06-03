'use client';

import { useState } from 'react';

interface SyncResult {
  ok: boolean;
  total?: number;
  updated?: number;
  unchanged?: number;
  errors?: number;
  error?: string;
}

export default function SyncViewsButton({ lastSynced }: { lastSynced: Date | null }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleSync() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/sync-views', { method: 'POST' });
      const data: SyncResult = await res.json();
      setResult(data);
    } catch {
      setResult({ ok: false, error: 'Network error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <button
        onClick={handleSync}
        disabled={busy}
        className="px-4 py-2 text-sm font-medium bg-neutral-800 border border-neutral-700
          rounded-lg hover:bg-neutral-700 transition disabled:opacity-50 whitespace-nowrap"
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
            Syncing…
          </span>
        ) : (
          'Sync Views Now'
        )}
      </button>

      {lastSynced && !result && (
        <span className="text-xs text-neutral-500">
          Last synced {new Date(lastSynced).toLocaleString()}
        </span>
      )}

      {result && (
        <span
          className={`text-sm ${result.ok ? 'text-green-400' : 'text-red-400'}`}
        >
          {result.ok
            ? `✓ ${result.updated} updated · ${result.unchanged} unchanged${result.errors ? ` · ${result.errors} errors` : ''} (${result.total} total)`
            : `✗ ${result.error}`}
        </span>
      )}
    </div>
  );
}
