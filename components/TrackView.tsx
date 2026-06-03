'use client';

import { useEffect } from 'react';

// Fires a privacy-friendly view ping once per song per browser session.
// No cookies, no personal data — just increments a counter server-side.
export default function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage blocked — still count, just may double-count */
    }
    // Fire and forget; keepalive lets it survive navigation.
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
