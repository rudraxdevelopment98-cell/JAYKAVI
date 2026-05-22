'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function csv(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function lines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function strOrNull(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  return s === '' ? null : s;
}

function intOrNull(value: FormDataEntryValue | null): number | null {
  const s = str(value);
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function saveProfile(formData: FormData) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) {
    throw new Error('Unauthorized');
  }

  const data = {
    name: str(formData.get('name')),
    penName: strOrNull(formData.get('penName')),
    displayName: strOrNull(formData.get('displayName')),
    title: strOrNull(formData.get('title')),
    tagline: str(formData.get('tagline')),
    bornPlace: strOrNull(formData.get('bornPlace')),
    basedIn: strOrNull(formData.get('basedIn')),
    birthDate: strOrNull(formData.get('birthDate')),
    careerStartYear: intOrNull(formData.get('careerStartYear')),
    languages: csv(formData.get('languages')),
    genres: csv(formData.get('genres')),
    creditVariants: csv(formData.get('creditVariants')),
    songsWritten: strOrNull(formData.get('songsWritten')),
    songsPublishedOnStreaming: strOrNull(formData.get('songsPublishedOnStreaming')),
    bio: str(formData.get('bio')),
    philosophy: strOrNull(formData.get('philosophy')),
    awards: lines(formData.get('awards')),
    press: lines(formData.get('press')),
  };

  await prisma.lyricist.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  revalidatePath('/admin/profile');
  revalidatePath('/');
  revalidatePath('/about');
}
