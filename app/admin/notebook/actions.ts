'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function assertAdmin(s: any) {
  if (!s || !s.isAdmin) throw new Error('Unauthorized');
}

// ── Templates ─────────────────────────────────────────────────────────────────

const TEMPLATES: Record<string, { title: string; content: string }> = {
  song: {
    title: 'New Song Draft',
    content:
      '<h1>Title</h1>' +
      '<h3>સ્થાયી / Mukhda</h3><p></p>' +
      '<h3>અંતરા 1 / Antara 1</h3><p></p>' +
      '<h3>અંતરા 2 / Antara 2</h3><p></p>' +
      '<h3>Notes</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Finalise raag / tune</p></div></li></ul>',
  },
  poem: {
    title: 'New Poem',
    content: '<h1>Title</h1><p style="text-align:center"></p>',
  },
};

// ── Notes ────────────────────────────────────────────────────────────────────

export async function createNote(folderId?: string, template?: string) {
  assertAdmin(await auth());
  const tpl = template && TEMPLATES[template] ? TEMPLATES[template] : null;
  const note = await prisma.note.create({
    data: {
      title: tpl?.title ?? 'Untitled',
      content: tpl?.content ?? '',
      folderId: folderId ?? null,
    },
  });
  revalidatePath('/admin/notebook');
  redirect(`/admin/notebook/${note.id}`);
}

export async function saveNote(
  id: string,
  data: { title: string; content: string; published: boolean; folderId: string | null; tags?: string[] },
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
      ...(data.tags ? { tags: data.tags.map((t) => t.trim()).filter(Boolean).slice(0, 12) } : {}),
    },
  });
  revalidatePath('/admin/notebook');
  revalidatePath(`/admin/notebook/${id}`);
}

export async function togglePinNote(id: string, pinned: boolean) {
  assertAdmin(await auth());
  await prisma.note.update({ where: { id }, data: { pinned } });
  revalidatePath('/admin/notebook');
  revalidatePath(`/admin/notebook/${id}`);
}

export async function duplicateNote(id: string) {
  assertAdmin(await auth());
  const src = await prisma.note.findUnique({ where: { id } });
  if (!src) throw new Error('Note not found');
  const copy = await prisma.note.create({
    data: {
      title: `${src.title} (copy)`,
      content: src.content,
      folderId: src.folderId,
      tags: src.tags,
      published: false,
    },
  });
  revalidatePath('/admin/notebook');
  redirect(`/admin/notebook/${copy.id}`);
}

export async function deleteNote(id: string) {
  assertAdmin(await auth());
  await prisma.note.delete({ where: { id } });
  revalidatePath('/admin/notebook');
  redirect('/admin/notebook');
}

// ── Convert a note into a Song draft ──────────────────────────────────────────

function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>(?=)/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80).replace(/^-+|-+$/g, '') || 'song';
}

export async function convertNoteToSong(id: string) {
  assertAdmin(await auth());
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) throw new Error('Note not found');

  const title = (note.title && note.title !== 'Untitled' ? note.title : 'Untitled Song').trim();
  const lyrics = htmlToPlainText(note.content);

  // Unique slug
  let base = slugify(title);
  let slug = base;
  let i = 0;
  while (await prisma.song.findUnique({ where: { slug } })) {
    i++;
    slug = `${base}-${i}`;
  }

  const song = await prisma.song.create({
    data: {
      title,
      slug,
      lyrics,
      lyricistCredit: 'Jayesh Prajapati "JAYKAVI"',
      language: 'Gujarati',
    },
  });

  revalidatePath('/admin/songs');
  redirect(`/admin/songs/${song.id}`);
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
