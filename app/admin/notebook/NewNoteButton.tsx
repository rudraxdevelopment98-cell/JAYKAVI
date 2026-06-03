'use client';

import { useTransition } from 'react';
import { createNote } from './actions';

export default function NewNoteButton({
  folderId,
  label = '+ New Note',
}: {
  folderId?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => createNote(folderId))}
      className="px-4 py-2 bg-white text-neutral-900 rounded-md font-medium text-sm
        hover:bg-neutral-200 transition disabled:opacity-50"
    >
      {pending ? 'Creating…' : label}
    </button>
  );
}
