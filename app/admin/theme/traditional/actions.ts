'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { setTraditionalSettings, type TraditionalSettings } from '@/lib/data';

export async function saveTraditionalSettings(formData: FormData) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');

  function str(key: string, fallback = ''): string {
    return ((formData.get(key) as string) ?? '').trim() || fallback;
  }
  function nullable(key: string): string | null {
    const v = (formData.get(key) as string ?? '').trim();
    if (!v) return null;
    try {
      const p = new URL(v).protocol;
      return p === 'https:' || p === 'http:' ? v : null;
    } catch { return null; }
  }
  function num(key: string, fallback: number, min: number, max: number): number {
    const v = Number(formData.get(key));
    if (!Number.isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, Math.round(v)));
  }

  const settings: TraditionalSettings = {
    mantra: str('mantra', '॥ જય શ્રી કૃષ્ણ ॥'),
    heroPortrait: nullable('heroPortrait'),
    heroDeity:    nullable('heroDeity'),
    heroBg:       nullable('heroBg'),
    heroBgVideo:  nullable('heroBgVideo'),
    heroBgOpacity: num('heroBgOpacity', 100, 0, 100),
    heroBgBlur:    num('heroBgBlur', 0, 0, 20),
    heroBgBright:  num('heroBgBright', 100, 30, 150),
    heroOverlay:   num('heroOverlay', 80, 0, 100),
    features: [
      { title: str('f1title', 'ભક્તિ'),    desc: str('f1desc', 'શુદ્ધ ભાવ અને શ્રદ્ધા') },
      { title: str('f2title', 'સંગીત'),    desc: str('f2desc', 'સુરોથી સર્જાયેલ ભક્તિ') },
      { title: str('f3title', 'સંસ્કૃતિ'), desc: str('f3desc', 'ગુજરાતી સંસ્કૃતિનો સંગમ') },
      { title: str('f4title', 'સેવા'),     desc: str('f4desc', 'સંગીત દ્વારા સેવા અને સમર્પણ') },
    ],
  };

  await setTraditionalSettings(settings);
  revalidatePath('/', 'layout');
}
