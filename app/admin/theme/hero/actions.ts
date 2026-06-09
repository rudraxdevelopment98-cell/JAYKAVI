'use server';
import { revalidatePath } from 'next/cache';
import { setHeroSettings } from '@/lib/data';

export async function saveHeroSettings(formData: FormData) {
  const variant     = (formData.get('variant') as string) || 'cinematic';
  const portraitUrl = (formData.get('portraitUrl') as string)?.trim() || null;
  const bgImageUrl  = (formData.get('bgImageUrl')  as string)?.trim() || null;
  const bgVideoUrl  = (formData.get('bgVideoUrl')  as string)?.trim() || null;

  await setHeroSettings({ variant, portraitUrl, bgImageUrl, bgVideoUrl });
  revalidatePath('/');
  revalidatePath('/admin/theme/hero');
}
