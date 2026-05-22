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

export async function createMilestone(formData: FormData) {
  assertAdmin(await auth());
  const title = str(formData.get('title'));
  if (!title) throw new Error('Title is required');

  const max = await prisma.journeyMilestone.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? 0) + 1;

  const m = await prisma.journeyMilestone.create({
    data: {
      title,
      year: intOrNull(formData.get('year')),
      description: str(formData.get('description')),
      imageUrl: strOrNull(formData.get('imageUrl')),
      sortOrder,
    },
  });
  revalidatePath('/admin/journey');
  redirect(`/admin/journey/${m.id}`);
}

export async function updateMilestone(id: string, formData: FormData) {
  assertAdmin(await auth());
  const title = str(formData.get('title'));
  if (!title) throw new Error('Title is required');

  await prisma.journeyMilestone.update({
    where: { id },
    data: {
      title,
      year: intOrNull(formData.get('year')),
      description: str(formData.get('description')),
      imageUrl: strOrNull(formData.get('imageUrl')),
      sortOrder: intOrNull(formData.get('sortOrder')) ?? 0,
    },
  });
  revalidatePath('/admin/journey');
  revalidatePath(`/admin/journey/${id}`);
  revalidatePath('/journey');
}

export async function deleteMilestone(id: string) {
  assertAdmin(await auth());
  await prisma.journeyMilestone.delete({ where: { id } });
  revalidatePath('/admin/journey');
  redirect('/admin/journey');
}
