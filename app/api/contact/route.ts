import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeText, isAlphaOnly, rateLimit, clientIp } from '@/lib/security';

export const runtime = 'nodejs';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  // ── Rate limit: max 5 submissions / minute per IP ──
  const ip = clientIp(req);
  const { ok: allowed, retryAfter } = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${retryAfter}s and try again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  // ── Reject oversized payloads (cheap DoS guard) ──
  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > 20_000) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── Sanitize every field (strips tags / control chars) ──
  const name    = sanitizeText(body.name);
  const email   = sanitizeText(body.email);
  const subject = sanitizeText(body.subject);
  const message = sanitizeText(body.message);

  // ── Name: min 5 chars, alphabets only ──
  if (name.length < 5) {
    return NextResponse.json({ error: 'Name must be at least 5 characters.' }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or fewer.' }, { status: 400 });
  }
  if (!isAlphaOnly(name)) {
    return NextResponse.json({ error: 'Name must contain letters only.' }, { status: 400 });
  }

  // ── Email ──
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }
  if (email.length > 254) {
    return NextResponse.json({ error: 'Email address is too long.' }, { status: 400 });
  }

  // ── Subject: min 5 chars, alphabets only ──
  if (subject.length < 5) {
    return NextResponse.json({ error: 'Subject must be at least 5 characters.' }, { status: 400 });
  }
  if (subject.length > 200) {
    return NextResponse.json({ error: 'Subject must be 200 characters or fewer.' }, { status: 400 });
  }
  if (!isAlphaOnly(subject)) {
    return NextResponse.json({ error: 'Subject must contain letters only.' }, { status: 400 });
  }

  // ── Message ──
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message must be 5000 characters or fewer.' }, { status: 400 });
  }

  try {
    await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, message },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to save message. Please try again.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
