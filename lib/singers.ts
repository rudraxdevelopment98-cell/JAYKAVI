// Shared helpers for parsing singer name strings and finding-or-creating
// Singer records without duplicates.
//
// Singer strings come from many sources (YouTube titles, descriptions,
// admin input) and use inconsistent separators: comma, pipe, slash,
// ampersand, "and", "feat.", "ft.", etc. The parser handles all of these
// and trims/dedups the result so the harvester never inserts two singers
// for what should be one record.

import type { PrismaClient } from '@prisma/client';

// Anything that joins two singer names. Match longest forms first.
const SPLIT_RE = /\s*(?:,|\||\/|&|\bfeaturing\b|\bfeat\.?|\bft\.?|\band\b|\bx\b|\bwith\b)\s*/i;

// Honorifics / qualifiers we want to strip from a name before comparing.
const STRIP_PREFIX_RE = /^(?:shri|shree|sri|smt\.?|mr\.?|ms\.?|mrs\.?|kavi|kaviraj)\s+/i;

/**
 * Split a raw singer string into individual clean names.
 *
 * Examples:
 *   "Alpa Patel | Jayesh Prajapati"   → ["Alpa Patel", "Jayesh Prajapati"]
 *   "Geeta Rabari, Kinjal Dave"       → ["Geeta Rabari", "Kinjal Dave"]
 *   "Arijit Singh feat. Shreya Ghoshal" → ["Arijit Singh", "Shreya Ghoshal"]
 *   "Alpa Patel  "                    → ["Alpa Patel"]
 */
export function parseSingerNames(input: string | null | undefined): string[] {
  if (!input) return [];
  const parts = input
    .split(SPLIT_RE)
    .map((s) => s.trim())
    // Strip trailing/leading punctuation that survived the split
    .map((s) => s.replace(/^[-–—:|/\s]+|[-–—:|/\s]+$/g, ''))
    // Collapse internal whitespace
    .map((s) => s.replace(/\s{2,}/g, ' '))
    .filter((s) => s.length >= 2 && s.length <= 60);

  // Dedupe by normalized key while preserving original display form
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = normalizeSingerKey(p);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

/**
 * Normalize a singer name for equality comparison.
 * Lowercased, whitespace-collapsed, honorific-stripped, punctuation removed.
 */
export function normalizeSingerKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(STRIP_PREFIX_RE, '')
    .replace(/[.\-_]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Find an existing Singer by normalized name, or create a new one.
 * Prevents duplicates from case/whitespace/honorific variants.
 *
 * Loads all singer names once per call — fine for our scale (hundreds).
 */
export async function findOrCreateSinger(
  prisma: PrismaClient,
  rawName: string
): Promise<{ id: string; name: string }> {
  const name = rawName.trim().replace(/\s{2,}/g, ' ');
  const key = normalizeSingerKey(name);

  // Try exact case-insensitive match first (cheap, uses index-ish path)
  const exact = await prisma.singer.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { id: true, name: true },
  });
  if (exact) return exact;

  // Fall back to normalized scan for honorific/punctuation variants
  const all = await prisma.singer.findMany({ select: { id: true, name: true } });
  const match = all.find((s) => normalizeSingerKey(s.name) === key);
  if (match) return match;

  return prisma.singer.create({
    data: {
      legacyId: `auto-${key.replace(/\s+/g, '-')}`.slice(0, 80),
      name,
    },
  });
}
