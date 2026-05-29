'use client';

import { useState, useRef } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: 'singers' | 'songs' | 'journey' | 'blog' | 'misc';
  label?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  label = 'Image',
  aspectRatio = 'square',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const aspectCls =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : '';

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
      <div className="flex items-start gap-4">
        <div
          className={`relative w-32 ${aspectCls} bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex-shrink-0`}
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="block w-full text-sm text-neutral-300
                       file:mr-3 file:px-3 file:py-1.5 file:rounded-md
                       file:border-0 file:text-sm file:font-medium
                       file:bg-neutral-800 file:text-neutral-200
                       hover:file:bg-neutral-700 file:cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste an image URL"
            className="w-full px-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:border-neutral-600"
          />
          {uploading && (
            <p className="text-xs text-neutral-400">Uploading to Cloudinary…</p>
          )}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-neutral-400 hover:text-red-400 transition"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
