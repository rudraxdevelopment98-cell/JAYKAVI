'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportExcelButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState('uploading');
    setResult(null);
    setErrorMsg('');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/admin/import-excel', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      setResult({ created: json.created, skipped: json.skipped });
      setState('done');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Unknown error');
      setState('error');
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={state === 'uploading'}
        className="text-sm px-3 py-1.5 border border-neutral-700 rounded-md hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {state === 'uploading' ? 'Importing…' : 'Import Excel (.xlsx)'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />
      {state === 'done' && result && (
        <span className="text-sm text-green-400">
          ✓ {result.created} candidates added, {result.skipped} skipped
        </span>
      )}
      {state === 'error' && (
        <span className="text-sm text-red-400">{errorMsg}</span>
      )}
    </div>
  );
}
