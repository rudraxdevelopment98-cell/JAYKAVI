'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
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

export async function createSinger(formData: FormData) {
  const session = await auth();
  assertAdmin(session);
  const name = str(formData.get('name'));
  if (!name) throw new Error('Name is required');

  const singer = await prisma.singer.create({
    data: {
      name,
      photoUrl: strOrNull(formData.get('photoUrl')),
      bio: strOrNull(formData.get('bio')),
    },
  });
  await logActivity({
    actorEmail: session?.user?.email,
    action: 'create',
    entity: 'Singer',
    label: singer.name,
  });
  revalidatePath('/admin/singers');
  redirect(`/admin/singers/${singer.id}`);
}

export async function updateSinger(id: string, formData: FormData) {
  const session = await auth();
  assertAdmin(session);
  const name = str(formData.get('name'));
  if (!name) throw new Error('Name is required');

  await prisma.singer.update({
    where: { id },
    data: {
      name,
      photoUrl: strOrNull(formData.get('photoUrl')),
      bio: strOrNull(formData.get('bio')),
    },
  });
  await logActivity({
    actorEmail: session?.user?.email,
    action: 'update',
    entity: 'Singer',
    label: name,
  });
  revalidatePath('/admin/singers');
  revalidatePath(`/admin/singers/${id}`);
  redirect('/admin/singers');
}

export async function deleteSinger(id: string) {
  const session = await auth();
  assertAdmin(session);
  const existing = await prisma.singer.findUnique({ where: { id }, select: { name: true } });
  await prisma.singer.delete({ where: { id } });
  await logActivity({
    actorEmail: session?.user?.email,
    action: 'delete',
    entity: 'Singer',
    label: existing?.name ?? id,
  });
  revalidatePath('/admin/singers');
  redirect('/admin/singers');
}
