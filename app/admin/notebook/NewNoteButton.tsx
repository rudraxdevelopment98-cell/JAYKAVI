'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { createNote } from './actions';

const TEMPLATES = [
  { key: '', label: '📄 Blank note' },
  { key: 'song', label: '🎵 Song draft' },
  { key: 'poem', label: '✍️ Poem' },
];

export default function NewNoteButton({
  folderId,
  label = '+ New Note',
}: {
  folderId?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  function create(template: string) {
    setOpen(false);
    startTransition(() => createNote(folderId, template || undefined));
  }

  return (
    <div ref={ref} className="relative">
      <button
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className="px-4 py-2 bg-white text-neutral-900 rounded-md font-medium text-sm
          hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-1.5"
      >
        {pending ? 'Creating…' : label}
        {!pending && <span className="text-xs opacity-60">▾</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-20 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl shadow-black/60 overflow-hidden p-1">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => create(t.key)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 transition"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
