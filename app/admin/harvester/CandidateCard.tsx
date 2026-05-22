'use client';

import { useState } from 'react';
import { approveCandidate, rejectCandidate } from './actions';

interface Candidate {
  id: string;
  cleanTitle: string;
  rawTitle: string;
  singerGuess: string | null;
  releaseYear: number | null;
  viewCount: number | null;
  thumbnailUrl: string | null;
  youtubeId: string;
  channelTitle: string | null;
}

export default function CandidateCard({ c }: { c: Candidate }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const [title, setTitle] = useState(c.cleanTitle);
  const [singers, setSingers] = useState(c.singerGuess ?? '');
  const [year, setYear] = useState(c.releaseYear?.toString() ?? '');
  const [ytId, setYtId] = useState(c.youtubeId);

  if (dismissed) return null;

  async function handleApprove() {
    setBusy(true);
    await approveCandidate(c.id, { title, singerNames: singers, releaseYear: year, youtubeId: ytId });
    setDismissed(true);
  }

  async function handleReject() {
    setBusy(true);
    await rejectCandidate(c.id);
    setDismissed(true);
  }

  const inputCls = 'w-full px-2 py-1 text-sm bg-neutral-950 border border-neutral-700 rounded focus:outline-none focus:border-amber-500';

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
      {/* Main row */}
      <div className="flex items-start gap-4 p-4">
        {c.thumbnailUrl && (
          <img
            src={c.thumbnailUrl}
            alt=""
            className="w-28 h-16 object-cover rounded flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{c.cleanTitle}</div>
          <div className="text-xs text-neutral-400 mt-0.5 truncate">
            {c.channelTitle && <span className="mr-2">📺 {c.channelTitle}</span>}
            {c.singerGuess && <span className="mr-2">🎤 {c.singerGuess}</span>}
            {c.releaseYear && <span className="mr-2">📅 {c.releaseYear}</span>}
            {c.viewCount != null && (
              <span>{c.viewCount.toLocaleString()} views</span>
            )}
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${c.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:underline mt-1 inline-block"
          >
            youtube.com/watch?v={c.youtubeId} ↗
          </a>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-1.5 text-xs border border-neutral-700 rounded-md hover:bg-neutral-800 transition"
          >
            {open ? 'Collapse' : 'Edit & Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={busy}
            className="px-3 py-1.5 text-xs text-red-400 border border-red-900/60 rounded-md hover:bg-red-950/40 transition disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Edit form */}
      {open && (
        <div className="border-t border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Song title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Performing singers (comma separated)</label>
              <input value={singers} onChange={(e) => setSingers(e.target.value)} className={inputCls} placeholder="e.g. Geeta Rabari, Kinjal Dave" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Release year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} placeholder="2023" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">YouTube video ID</label>
              <input value={ytId} onChange={(e) => setYtId(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
              disabled={busy}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition disabled:opacity-50"
            >
              Approve — Add to Songs
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm border border-neutral-700 rounded-md hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-neutral-500 italic">
            Original title: {c.rawTitle}
          </p>
        </div>
      )}
    </div>
  );
}
