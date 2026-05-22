'use client';

import { useState, useTransition } from 'react';

interface Props {
  onConfirm: () => Promise<void>;
  label?: string;
  confirmText?: string;
  className?: string;
}

export default function DeleteButton({
  onConfirm,
  label = 'Delete',
  confirmText = 'Are you sure? This cannot be undone.',
  className = '',
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">{confirmText}</span>
        <button
          type="button"
          onClick={() => startTransition(() => onConfirm())}
          disabled={pending}
          className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-md font-medium disabled:opacity-50"
        >
          {pending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="px-3 py-1.5 text-xs border border-neutral-700 rounded-md hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`px-3 py-1.5 text-xs text-red-400 border border-red-900/60 rounded-md hover:bg-red-950/40 transition ${className}`}
    >
      {label}
    </button>
  );
}
