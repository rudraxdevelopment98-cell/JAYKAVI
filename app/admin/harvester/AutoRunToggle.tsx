'use client';

import { useState, useTransition } from 'react';
import { setAutoRun } from './actions';

export default function AutoRunToggle({ initial, compact = false }: { initial: boolean; compact?: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try {
        await setAutoRun(next);
      } catch {
        setOn(!next);
      }
    });
  }

  const switchEl = (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Toggle weekly auto-harvest"
      onClick={toggle}
      disabled={pending}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        on ? 'bg-green-500' : 'bg-neutral-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Auto</span>
        {switchEl}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div className="font-medium mb-1">Weekly auto-harvest</div>
        <div className="text-sm text-neutral-400 max-w-md">
          When ON, the harvester runs automatically once a week and queues any new
          songs it finds for your review. You&apos;ll still approve each one manually.
        </div>
      </div>
      {switchEl}
    </div>
  );
}
