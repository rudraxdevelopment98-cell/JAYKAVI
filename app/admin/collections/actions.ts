'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function assertAdmin(s: any) {
  if (!s || !s.isAdmin) throw new Error('Unauthorized');
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}
function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === '' ? null : s;
}
function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

export async function createCollection(formData: FormData) {
  assertAdmin(await auth());
  const title = str(formData.get('title'));
  if (!title) throw new Error('Title is required');

  const baseSlug = str(formData.get('slug')) || slugify(title);
  let slug = baseSlug;
  let i = 0;
  while (await prisma.collection.findUnique({ where: { slug } })) {
    i++;
    slug = `${baseSlug}-${i}`;
  }

  const c = await prisma.collection.create({
    data: {
      slug,
      title,
      description: str(formData.get('description')),
      coverUrl: strOrNull(formData.get('coverUrl')),
      year: intOrNull(formData.get('year')),
    },
  });
  revalidatePath('/admin/collections');
  redirect(`/admin/collections/${c.id}`);
}

export async function updateCollection(id: string, formData: FormData) {
  assertAdmin(await auth());
  const title = str(formData.get('title'));
  if (!title) throw new Error('Title is required');

  await prisma.collection.update({
    where: { id },
    data: {
      title,
      slug: str(formData.get('slug')) || slugify(title),
      description: str(formData.get('description')),
      coverUrl: strOrNull(formData.get('coverUrl')),
      year: intOrNull(formData.get('year')),
    },
  });
  revalidatePath('/admin/collections');
  revalidatePath(`/admin/collections/${id}`);
  redirect('/admin/collections');
}

export async function deleteCollection(id: string) {
  assertAdmin(await auth());
  await prisma.collection.delete({ where: { id } });
  revalidatePath('/admin/collections');
  redirect('/admin/collections');
}
