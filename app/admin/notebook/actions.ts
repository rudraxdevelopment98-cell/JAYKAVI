'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function assertAdmin(s: any) {
  if (!s || !s.isAdmin) throw new Error('Unauthorized');
}

// ── Notes ────────────────────────────────────────────────────────────────────

export async function createNote(folderId?: string) {
  assertAdmin(await auth());
  const note = await prisma.note.create({
    data: { title: 'Untitled', content: '', folderId: folderId ?? null },
  });
  revalidatePath('/admin/notebook');
  redirect(`/admin/notebook/${note.id}`);
}

export async function saveNote(
  id: string,
  data: { title: string; content: string; published: boolean; folderId: string | null },
) {
  assertAdmin(await auth());
  const now = new Date();
  await prisma.note.update({
    where: { id },
    data: {
      title: data.title || 'Untitled',
      content: data.content,
      published: data.published,
      publishedAt: data.published ? now : null,
      folderId: data.folderId,
    },
  });
  revalidatePath('/admin/notebook');
  revalidatePath(`/admin/notebook/${id}`);
}

export async function deleteNote(id: string) {
  assertAdmin(await auth());
  await prisma.note.delete({ where: { id } });
  revalidatePath('/admin/notebook');
  redirect('/admin/notebook');
}

// ── Folders ──────────────────────────────────────────────────────────────────

export async function createFolder(title: string) {
  assertAdmin(await auth());
  const title_ = title.trim();
  if (!title_) throw new Error('Folder name required');
  const max = await prisma.noteFolder.aggregate({ _max: { sortOrder: true } });
  await prisma.noteFolder.create({
    data: { title: title_, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePath('/admin/notebook');
}

export async function renameFolder(id: string, title: string) {
  assertAdmin(await auth());
  const title_ = title.trim();
  if (!title_) throw new Error('Folder name required');
  await prisma.noteFolder.update({ where: { id }, data: { title: title_ } });
  revalidatePath('/admin/notebook');
}

export async function deleteFolder(id: string) {
  assertAdmin(await auth());
  // Notes in this folder get folderId set to null (via onDelete: SetNull)
  await prisma.noteFolder.delete({ where: { id } });
  revalidatePath('/admin/notebook');
}
