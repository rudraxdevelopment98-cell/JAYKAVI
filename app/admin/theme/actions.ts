'use server';

import { revalidatePath } from 'next/cache';
import { setSiteTheme } from '@/lib/data';
import { SITE_THEMES } from '@/lib/themes';
import { auth } from '@/auth';

export async function applyTheme(formData: FormData) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');

  const theme = formData.get('theme') as string;
  const valid = SITE_THEMES.map((t) => t.key);
  if (!valid.includes(theme)) throw new Error('Invalid theme');
  await setSiteTheme(theme);
  revalidatePath('/', 'layout');
}
