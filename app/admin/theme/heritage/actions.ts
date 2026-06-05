'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { setHeritageSettings, HERITAGE_DEFAULTS, type HeritageSettings, type HeritageEvent, type HeritageStat } from '@/lib/data';
import { sanitizeText } from '@/lib/security';

function safeHttp(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  try {
    const p = new URL(s).protocol;
    return p === 'https:' || p === 'http:' ? s : null;
  } catch { return null; }
}

export async function saveHeritageSettings(formData: FormData) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');

  const str = (k: string, fallback = '') =>
    (sanitizeText(formData.get(k)) || fallback);
  const bool = (k: string) => formData.get(k) === 'on';

  // gallery + events arrive as JSON strings from the client form
  let gallery: string[] = [];
  try {
    const g = JSON.parse((formData.get('galleryJson') as string) || '[]');
    if (Array.isArray(g)) gallery = g.map((x) => safeHttp(String(x))).filter(Boolean) as string[];
  } catch { /* ignore */ }

  let events: HeritageEvent[] = [];
  try {
    const e = JSON.parse((formData.get('eventsJson') as string) || '[]');
    if (Array.isArray(e)) {
      events = e
        .map((ev: any) => ({
          date: sanitizeText(ev?.date),
          title: sanitizeText(ev?.title),
          place: sanitizeText(ev?.place),
        }))
        .filter((ev) => ev.title);
    }
  } catch { /* ignore */ }

  let stats: HeritageStat[] = [];
  try {
    const s = JSON.parse((formData.get('statsJson') as string) || '[]');
    if (Array.isArray(s)) {
      stats = s
        .map((st: any) => ({ value: sanitizeText(st?.value), label: sanitizeText(st?.label) }))
        .filter((st) => st.value || st.label);
    }
  } catch { /* ignore */ }
  if (stats.length === 0) stats = HERITAGE_DEFAULTS.stats;

  const D = HERITAGE_DEFAULTS;
  const settings: HeritageSettings = {
    heroPhoto: safeHttp((formData.get('heroPhoto') as string) || ''),
    heroVideo: safeHttp((formData.get('heroVideo') as string) || ''),
    eyebrow: str('eyebrow', D.eyebrow),
    title: str('title', D.title),
    subtitle: str('subtitle', D.subtitle),
    quote: str('quote') || null,
    stats,
    aboutPhoto: safeHttp((formData.get('aboutPhoto') as string) || ''),
    aboutBody: str('aboutBody') || null,
    audioTitle: str('audioTitle', D.audioTitle),
    audioTrack: str('audioTrack') || null,
    footerQuote: str('footerQuote') || null,
    gallery,
    events,
    legacyTitle: str('legacyTitle', D.legacyTitle),
    legacyBody: str('legacyBody') || null,
    show: {
      stats: bool('showStats'),
      bhajans: bool('showBhajans'),
      poetry: bool('showPoetry'),
      audio: bool('showAudio'),
      videos: bool('showVideos'),
      gallery: bool('showGallery'),
      events: bool('showEvents'),
      legacy: bool('showLegacy'),
    },
  };

  await setHeritageSettings(settings);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/theme/heritage');
}
