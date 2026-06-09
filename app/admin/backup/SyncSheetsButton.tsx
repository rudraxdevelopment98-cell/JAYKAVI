'use client';
import { useState, useTransition } from 'react';
import { syncSheetsNow } from './actions';

export default function SyncSheetsButton() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setResult(null);
          start(async () => {
            const r = await syncSheetsNow();
            setResult(r);
          });
        }}
        className="px-5 py-2.5 border border-emerald-700/60 bg-emerald-950/30 text-emerald-300 rounded-md font-medium hover:bg-emerald-900/40 disabled:opacity-50 transition"
      >
        {pending ? 'Syncing…' : '📊 Sync to Google Sheets'}
      </button>
      {result && (
        <span className={`text-sm ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.msg}
        </span>
      )}
    </div>
  );
}
