'use client';

import { useTransition, useState } from 'react';
import { updateRequestStatus, deleteRequest } from './actions';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'bg-amber-900/40',  text: 'text-amber-300',  dot: 'bg-amber-400'  },
  noted:    { label: 'Noted',    bg: 'bg-blue-900/40',   text: 'text-blue-300',   dot: 'bg-blue-400'   },
  added:    { label: 'Added ✓',  bg: 'bg-green-900/40',  text: 'text-green-300',  dot: 'bg-green-400'  },
  rejected: { label: 'Rejected', bg: 'bg-neutral-800',   text: 'text-neutral-400', dot: 'bg-neutral-500' },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export default function RequestCard({ req }: {
  req: {
    id: string;
    name: string | null;
    songName: string;
    singerName: string | null;
    youtubeUrl: string | null;
    notes: string | null;
    status: string;
    adminNote: string | null;
    read: boolean;
    createdAt: Date;
  };
}) {
  const [, startTransition] = useTransition();
  const [adminNote, setAdminNote] = useState(req.adminNote ?? '');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const cfg = STATUS_CONFIG[req.status as Status] ?? STATUS_CONFIG.pending;

  function setStatus(status: Status) {
    startTransition(() => updateRequestStatus(req.id, status));
  }

  function saveNoteAndStatus(status: Status) {
    startTransition(() => updateRequestStatus(req.id, status, adminNote));
    setShowNoteInput(false);
  }

  function handleDelete() {
    if (!confirm('Delete this request?')) return;
    startTransition(() => deleteRequest(req.id));
  }

  return (
    <div className={`rounded-xl border transition-colors ${
      req.read ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-900 border-neutral-700'
    }`}>
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 flex-wrap">
          {!req.read && (
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-neutral-100 text-base leading-snug">{req.songName}</div>
            {req.singerName && (
              <div className="text-sm text-violet-400 mt-0.5 flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M12 2a3 3 0 013 3v7a3 3 0 11-6 0V5a3 3 0 013-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                </svg>
                {req.singerName}
              </div>
            )}
          </div>
          {/* Status badge */}
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-neutral-500">
          {req.name && <span>From: <span className="text-neutral-300">{req.name}</span></span>}
          <span>{new Date(req.createdAt).toLocaleString()}</span>
          {req.youtubeUrl && (
            <a
              href={req.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zm-9 13l-5-3 5-3v6z"/>
              </svg>
              YouTube ↗
            </a>
          )}
        </div>

        {/* Notes */}
        {req.notes && (
          <div className="mt-3 px-3 py-2.5 bg-neutral-950/50 rounded-lg text-sm text-neutral-300 leading-relaxed border border-neutral-800">
            {req.notes}
          </div>
        )}

        {/* Admin note */}
        {req.adminNote && !showNoteInput && (
          <div className="mt-2 text-xs text-neutral-500 italic">
            Note: {req.adminNote}
          </div>
        )}

        {/* Note input */}
        {showNoteInput && (
          <div className="mt-3 space-y-2">
            <input
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a private note (optional)…"
              className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-amber-500 text-neutral-200 placeholder-neutral-500"
            />
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => saveNoteAndStatus('noted')} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition">
                Save as Noted
              </button>
              <button onClick={() => saveNoteAndStatus('added')} className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition">
                Save as Added
              </button>
              <button onClick={() => setShowNoteInput(false)} className="px-3 py-1.5 text-xs border border-neutral-700 rounded-lg hover:bg-neutral-800 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!showNoteInput && (
          <div className="flex flex-wrap gap-2 mt-4">
            {req.status !== 'noted' && (
              <button onClick={() => setStatus('noted')} className="px-3 py-1.5 text-xs border border-blue-800/60 text-blue-400 rounded-lg hover:bg-blue-950/40 transition">
                Mark noted
              </button>
            )}
            {req.status !== 'added' && (
              <button onClick={() => setStatus('added')} className="px-3 py-1.5 text-xs border border-green-800/60 text-green-400 rounded-lg hover:bg-green-950/40 transition">
                Mark added
              </button>
            )}
            {req.status !== 'rejected' && (
              <button onClick={() => setStatus('rejected')} className="px-3 py-1.5 text-xs border border-neutral-700 text-neutral-500 rounded-lg hover:bg-neutral-800 transition">
                Reject
              </button>
            )}
            {req.status === 'pending' && (
              <button onClick={() => setShowNoteInput(true)} className="px-3 py-1.5 text-xs border border-neutral-700 text-neutral-400 rounded-lg hover:bg-neutral-800 transition">
                + Note
              </button>
            )}
            <button
              onClick={handleDelete}
              className="ml-auto px-3 py-1.5 text-xs text-red-500 hover:text-red-400 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
