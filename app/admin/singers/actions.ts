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

export async function createSinger(formData: FormData): Promise<{ error: string } | void> {
  const session = await auth();
  assertAdmin(session);
  const name = str(formData.get('name'));
  if (!name) return { error: 'Name is required' };

  const duplicate = await prisma.singer.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { id: true, name: true },
  });
  if (duplicate) {
    return { error: `Singer "${duplicate.name}" already exists.` };
  }

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

// Sync which songs this singer performs on (SongSinger join table).
// Adds newly-selected songs, removes deselected ones.
export async function setSingerSongs(
  singerId: string,
  songIds: string[],
): Promise<{ error?: string } | void> {
  assertAdmin(await auth());
  const ids = Array.from(new Set(songIds.filter((s) => typeof s === 'string' && s)));

  try {
    await prisma.$transaction([
      // remove links no longer selected
      prisma.songSinger.deleteMany({
        where: { singerId, songId: { notIn: ids.length ? ids : ['__none__'] } },
      }),
      // add new links (skip duplicates)
      prisma.songSinger.createMany({
        data: ids.map((songId) => ({ singerId, songId })),
        skipDuplicates: true,
      }),
    ]);
  } catch {
    return { error: 'Could not update songs. Please try again.' };
  }

  revalidatePath(`/admin/singers/${singerId}`);
  revalidatePath('/admin/singers');
  revalidatePath('/explore');
}
