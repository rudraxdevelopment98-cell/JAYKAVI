'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { setHeritageSettings, type HeritageSettings, type HeritageEvent } from '@/lib/data';
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

  const settings: HeritageSettings = {
    heroPhoto: safeHttp((formData.get('heroPhoto') as string) || ''),
    heroVideo: safeHttp((formData.get('heroVideo') as string) || ''),
    eyebrow: str('eyebrow', 'Digital Heritage Library'),
    title: str('title', 'Jayesh Prajapati'),
    subtitle: str('subtitle', 'A living archive of Gujarati verse, bhajan and lyric.'),
    quote: str('quote') || null,
    gallery,
    events,
    legacyTitle: str('legacyTitle', 'The Legacy'),
    legacyBody: str('legacyBody') || null,
    show: {
      bhajans: bool('showBhajans'),
      poetry: bool('showPoetry'),
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
