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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || 'post';
  let i = 0;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i++;
    slug = `${base}-${i}`;
  }
}

function buildData(formData: FormData) {
  const title = str(formData.get('title'));
  const published = formData.get('published') === 'on';
  return {
    title,
    slugInput: str(formData.get('slug')) || slugify(title),
    excerpt: strOrNull(formData.get('excerpt')),
    content: str(formData.get('content')),
    coverUrl: strOrNull(formData.get('coverUrl')),
    published,
  };
}

export async function createPost(formData: FormData) {
  const session = await auth();
  assertAdmin(session);
  const d = buildData(formData);
  if (!d.title) throw new Error('Title is required');

  const slug = await uniqueSlug(d.slugInput);

  const post = await prisma.post.create({
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt,
      content: d.content,
      coverUrl: d.coverUrl,
      published: d.published,
      publishedAt: d.published ? new Date() : null,
    },
  });

  await logActivity({
    actorEmail: session?.user?.email,
    action: 'create',
    entity: 'Post',
    label: post.title,
  });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect(`/admin/blog/${post.id}`);
}

export async function updatePost(id: string, formData: FormData) {
  const session = await auth();
  assertAdmin(session);
  const d = buildData(formData);
  if (!d.title) throw new Error('Title is required');

  const slug = await uniqueSlug(d.slugInput, id);
  const current = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } });

  await prisma.post.update({
    where: { id },
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt,
      content: d.content,
      coverUrl: d.coverUrl,
      published: d.published,
      // set publishedAt on first publish; keep the original date afterwards
      publishedAt: d.published ? current?.publishedAt ?? new Date() : null,
    },
  });

  await logActivity({
    actorEmail: session?.user?.email,
    action: 'update',
    entity: 'Post',
    label: d.title,
  });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  redirect('/admin/blog');
}

export async function deletePost(id: string) {
  const session = await auth();
  assertAdmin(session);
  const existing = await prisma.post.findUnique({ where: { id }, select: { title: true } });
  await prisma.post.delete({ where: { id } });
  await logActivity({
    actorEmail: session?.user?.email,
    action: 'delete',
    entity: 'Post',
    label: existing?.title ?? id,
  });
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}
