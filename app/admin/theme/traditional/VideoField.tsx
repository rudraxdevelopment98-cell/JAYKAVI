'use client';

import { useRef, useState } from 'react';

const MAX_MB = 100;

/** Force a web-ready MP4 delivery URL so every input format plays in <video>. */
function toWebMp4(secureUrl: string): string {
  try {
    const u = new URL(secureUrl);
    const lower = u.pathname.toLowerCase();
    const alreadyWeb = lower.endsWith('.mp4') || lower.endsWith('.webm');
    // Add q_auto compression; convert non-web formats (mov/mkv/avi…) to .mp4.
    u.pathname = u.pathname.replace('/upload/', '/upload/q_auto/');
    if (!alreadyWeb) u.pathname = u.pathname.replace(/\.[^/.]+$/, '.mp4');
    return u.toString();
  } catch {
    return secureUrl;
  }
}

export default function VideoField({
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
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');

    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That video is ${(file.size / 1024 / 1024).toFixed(0)} MB — the limit is ${MAX_MB} MB. Please trim or compress it first.`);
      return;
    }

    setUploading(true);
    setProgress('Preparing…');
    try {
      // 1) Ask our server for a signed upload (admin-only).
      const sigRes = await fetch('/api/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'misc' }),
      });
      const sig = await sigRes.json();
      if (!sigRes.ok) {
        setError(sig.error ?? 'Upload is not available right now.');
        setUploading(false);
        setProgress('');
        return;
      }

      // 2) Upload the file straight to Cloudinary (no Vercel size limit).
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);

      const secureUrl: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct < 100 ? `Uploading ${pct}%` : 'Processing…');
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText).secure_url); }
            catch { reject(new Error('Unexpected response from media host.')); }
          } else {
            let msg = `Upload failed (${xhr.status}).`;
            try { msg = JSON.parse(xhr.responseText).error?.message || msg; } catch { /* ignore */ }
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(fd);
      });

      // 3) Store a web-ready MP4 URL (Cloudinary transcodes any source format).
      setUrl(toWebMp4(secureUrl));
      setProgress('');
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed.');
      setProgress('');
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
          <video
            src={url}
            muted
            loop
            autoPlay
            playsInline
            style={{
              width: 160, height: 90, objectFit: 'cover',
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
          placeholder="Paste video URL or click Upload →"
          className={inputCls}
        />
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
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
          {progress || '🎬 Upload'}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => { setUrl(''); setError(''); }}
            className="px-3 py-2 text-sm text-red-400 border border-red-900/50 rounded-md hover:bg-red-950/40 transition"
            title="Remove video"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-500 mt-1">
        Any format works (MP4, MOV, MKV, WebM…) — it’s uploaded directly and auto-converted to web-ready MP4. Max {MAX_MB} MB.
      </p>
      {note && <p className="text-xs text-neutral-500 mt-1">{note}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
