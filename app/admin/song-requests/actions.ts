'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');
}

export async function markRequestRead(id: string) {
  await requireAdmin();
  await prisma.songRequest.update({ where: { id }, data: { read: true } });
  revalidatePath('/admin/song-requests');
}

export async function markAllRequestsRead() {
  await requireAdmin();
  await prisma.songRequest.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath('/admin/song-requests');
}

export async function updateRequestStatus(id: string, status: string, adminNote?: string) {
  await requireAdmin();
  await prisma.songRequest.update({
    where: { id },
    data: { status, read: true, ...(adminNote !== undefined ? { adminNote } : {}) },
  });
  revalidatePath('/admin/song-requests');
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  await prisma.songRequest.delete({ where: { id } });
  revalidatePath('/admin/song-requests');
}
