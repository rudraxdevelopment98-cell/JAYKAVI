'use client';

import { useRef, useState } from 'react';

export default function ImageField({
  name,
  label,
  defaultValue,
  note,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  note?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'misc');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
      } else {
        setError(data.error ?? 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const inputCls = 'flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm focus:outline-none focus:border-amber-500';

  return (
    <div>
      <label className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>

      {url && (
        <div style={{ marginBottom: 8 }}>
          <img
            src={url}
            alt={label}
            style={{
              width: 88, height: 88, objectFit: 'cover',
              borderRadius: 10, border: '1px solid rgba(212,175,55,.3)',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="url"
          name={name}
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="Paste image URL or click Upload →"
          className={inputCls}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {uploading ? 'Uploading…' : '⬆ Upload'}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl('')}
            className="px-3 py-2 text-sm text-red-400 border border-red-900/50 rounded-md hover:bg-red-950/40 transition"
            title="Remove image"
          >
            ✕
          </button>
        )}
      </div>

      {note && <p className="text-xs text-neutral-500 mt-1">{note}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
