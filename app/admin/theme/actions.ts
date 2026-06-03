'use server';

import { revalidatePath } from 'next/cache';
import { setSiteTheme } from '@/lib/data';
import { SITE_THEMES } from '@/lib/themes';

export async function applyTheme(formData: FormData) {
  const theme = formData.get('theme') as string;
  const valid = SITE_THEMES.map((t) => t.key);
  if (!valid.includes(theme)) throw new Error('Invalid theme');
  await setSiteTheme(theme);
  // Revalidate the whole site so every page picks up the new data-theme-skin.
  revalidatePath('/', 'layout');
}
