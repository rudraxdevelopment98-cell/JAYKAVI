import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

// Simple in-memory rate limit: max 3 requests per IP per hour
const RATE_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT = 3;
const ips = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ips.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  if (hits.length >= RATE_LIMIT) return true;
  ips.set(ip, [...hits, now]);
  return false;
}

function sanitize(s: string): string {
  return s.replace(/[<>]/g, '').trim().slice(0, 500);
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before submitting again.' },
      { status: 429 },
    );
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const songName = sanitize(body.songName ?? '');
  if (!songName || songName.length < 2) {
    return NextResponse.json({ error: 'Song name is required.' }, { status: 400 });
  }

  const youtubeUrl = sanitize(body.youtubeUrl ?? '');
  if (youtubeUrl && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtubeUrl)) {
    return NextResponse.json(
      { error: 'YouTube URL must be a youtube.com or youtu.be link.' },
      { status: 400 },
    );
  }

  await prisma.songRequest.create({
    data: {
      songName,
      singerName: sanitize(body.singerName ?? '') || null,
      youtubeUrl: youtubeUrl || null,
      notes: sanitize(body.notes ?? '') || null,
      name: sanitize(body.name ?? '') || null,
    },
  });

  return NextResponse.json({ ok: true });
}
