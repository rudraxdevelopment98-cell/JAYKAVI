'use client';
import { useState } from 'react';

function extractPlaylistId(input: string): string | null {
  const s = input.trim();
  // URL with ?list=PLxxxxxxx
  const urlMatch = s.match(/[?&]list=([A-Za-z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  // Bare playlist ID (starts with PL, UU, FL, RD, etc.)
  if (/^[A-Za-z0-9_-]{10,}$/.test(s)) return s;
  return null;
}

export default function PlaylistImportButton() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleImport() {
    const playlistId = extractPlaylistId(input);
    if (!playlistId) {
      setStatus('error');
      setMessage('Could not extract a playlist ID from the input. Paste a YouTube playlist URL or bare playlist ID.');
      return;
    }

    setStatus('loading');
    setMessage('Fetching videos…');

    try {
      const res = await fetch('/api/admin/import-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Import failed.');
      } else {
        setStatus('done');
        const parts: string[] = [];
        if (data.created > 0) parts.push(`${data.created} added to queue`);
        if (data.alreadySong > 0) parts.push(`${data.alreadySong} already in Songs`);
        if (data.alreadyCandidate > 0) parts.push(`${data.alreadyCandidate} already in queue`);
        setMessage(data.message ?? (parts.length ? parts.join(' · ') : 'Nothing new to add.'));
        if (data.created > 0) setInput('');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setStatus('idle'); setMessage(''); }}
          placeholder="YouTube playlist URL or ID (e.g. PLxxxxxxx)"
          className="flex-1 min-w-0 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-sm focus:outline-none focus:border-neutral-500 text-neutral-100 placeholder-neutral-500"
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
        />
        <button
          onClick={handleImport}
          disabled={status === 'loading' || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition whitespace-nowrap"
        >
          {status === 'loading' ? 'Importing…' : 'Import Playlist'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-400' : status === 'done' ? 'text-green-400' : 'text-neutral-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
