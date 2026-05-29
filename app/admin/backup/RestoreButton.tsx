'use client';

import { useState } from 'react';

export default function RestoreButton() {
  const [step, setStep] = useState<'idle' | 'confirm' | 'running' | 'done' | 'error'>('idle');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ songs: number; singers: number } | null>(null);
  const [error, setError] = useState('');

  async function doRestore() {
    setStep('running');
    setError('');
    try {
      const res = await fetch('/api/admin/backup-restore', { method: 'POST' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? 'Unknown error');
      setResult({ songs: json.songs, singers: json.singers });
      setStep('done');
    } catch (e: any) {
      setError(e.message ?? 'Restore failed');
      setStep('error');
    }
  }

  if (step === 'done') {
    return (
      <div className="px-4 py-3 rounded-lg border border-green-900/60 bg-green-950/30 text-green-300 text-sm">
        Restore complete — {result?.songs} songs and {result?.singers} singers recovered.
        <button
          className="ml-4 underline hover:text-white"
          onClick={() => { setStep('idle'); setInput(''); setResult(null); }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="px-4 py-3 rounded-lg border border-red-900/60 bg-red-950/30 text-red-300 text-sm">
        {error}
        <button
          className="ml-4 underline hover:text-white"
          onClick={() => { setStep('idle'); setInput(''); }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === 'running') {
    return (
      <div className="px-4 py-3 rounded-lg border border-amber-900/60 bg-amber-950/30 text-amber-200 text-sm animate-pulse">
        Restoring — please wait, do not close this page…
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="p-5 rounded-xl border border-red-900/60 bg-red-950/20 space-y-3">
        <p className="text-sm text-red-200 font-medium">
          This will <strong>replace all current content</strong> with the snapshot from the backup.
          Songs, singers, collections, journey, profile and contact will be overwritten.
          Admin accounts are NOT changed.
        </p>
        <p className="text-sm text-red-300">
          Type <strong>RESTORE</strong> to confirm:
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="RESTORE"
          className="w-48 px-3 py-2 bg-neutral-900 border border-red-800 rounded-md text-sm focus:outline-none focus:border-red-500"
        />
        <div className="flex gap-3">
          <button
            disabled={input !== 'RESTORE'}
            onClick={doRestore}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition"
          >
            Yes, restore now
          </button>
          <button
            onClick={() => { setStep('idle'); setInput(''); }}
            className="px-4 py-2 border border-neutral-700 rounded-md text-sm hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      className="px-5 py-2.5 border border-red-900/60 text-red-400 rounded-md font-medium hover:bg-red-950/40 transition"
    >
      ↩ Restore from backup
    </button>
  );
}
