'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RunButton({ hasApiKey }: { hasApiKey: boolean }) {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleRun() {
    if (!hasApiKey) {
      setResult('YOUTUBE_API_KEY is not set. Add it to your .env file.');
      setState('error');
      return;
    }
    setState('running');
    setResult(null);
    try {
      const res = await fetch('/api/harvest', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setResult(data.error);
        setState('error');
      } else {
        setResult(
          `Scanned ${data.scanned} videos — ${data.newFound} new songs added to review queue.`
        );
        setState('done');
        router.refresh();
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Unknown error');
      setState('error');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRun}
        disabled={state === 'running'}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-wait text-neutral-950 font-semibold rounded-lg transition"
      >
        {state === 'running' ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Searching YouTube…
          </>
        ) : (
          'Run Harvest Now'
        )}
      </button>

      {result && (
        <p
          className={`text-sm px-3 py-2 rounded-md ${
            state === 'error'
              ? 'bg-red-950/60 border border-red-800 text-red-300'
              : 'bg-green-950/60 border border-green-800 text-green-300'
          }`}
        >
          {result}
        </p>
      )}
    </div>
  );
}
