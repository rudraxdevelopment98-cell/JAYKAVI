// Shared security helpers — input sanitization & basic rate limiting.
// These guard public-facing endpoints against XSS payloads and burst/DDoS abuse.

/**
 * Strip HTML tags and dangerous control characters from a string.
 * Prevents stored-XSS: even though React escapes on render, we never want
 * markup or script payloads landing in the database in the first place.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    // remove null bytes & most control chars (keep \n \r \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // strip HTML tags
    .replace(/<[^>]*>/g, '')
    // neutralise stray angle brackets that survived
    .replace(/[<>]/g, '')
    .trim();
}

/** Letters (any language, incl. Gujarati/Devanagari) plus spaces, dots, apostrophes, hyphens. */
const ALPHA_RE = /^[\p{L}\s.'’-]+$/u;

/** True when the value is only alphabetic characters (+ spaces/basic name punctuation). */
export function isAlphaOnly(value: string): boolean {
  return ALPHA_RE.test(value);
}

// ── Rate limiting ─────────────────────────────────────────────────────────
// In-memory sliding window. In serverless this is per-instance (not global),
// but still throttles bursts from a single warm instance — a cheap first line
// of defence against form-spam / DDoS. Pair with platform-level protection.

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || now > hit.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (hit.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }

  hit.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(req: Request): string {
  const h = req.headers;
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h.get('x-real-ip') || 'unknown';
}

// Periodically evict expired buckets so the Map can't grow unbounded.
if (typeof setInterval !== 'undefined') {
  const t = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }, 5 * 60_000);
  // don't keep the event loop alive just for cleanup
  (t as any)?.unref?.();
}
