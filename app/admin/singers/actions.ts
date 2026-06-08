'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { normalizeSingerKey } from '@/lib/singers';

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

  // Normalized dedup check — catches case, whitespace, and honorific variants
  const key = normalizeSingerKey(name);
  const all = await prisma.singer.findMany({ select: { id: true, name: true } });
  const duplicate = all.find((s) => normalizeSingerKey(s.name) === key);
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

/**
 * Merge singer rows that normalize to the same key into a single canonical
 * record. Re-points all SongSinger joins to the kept singer (dedup'd per
 * song) and deletes the duplicates. Returns a summary for the UI.
 *
 * Canonical = the row with the most existing song links; ties broken by
 * older createdAt so existing URLs/IDs survive when possible.
 */
export async function mergeDuplicateSingers(): Promise<{
  groups: number;
  merged: number;
  joinsRemoved: number;
}> {
  const session = await auth();
  assertAdmin(session);

  const all = await prisma.singer.findMany({
    select: { id: true, name: true, createdAt: true, _count: { select: { songs: true } } },
  });

  // Group by normalized key
  const byKey = new Map<string, typeof all>();
  for (const s of all) {
    const k = normalizeSingerKey(s.name);
    if (!k) continue;
    const arr = byKey.get(k) ?? [];
    arr.push(s);
    byKey.set(k, arr);
  }

  let groups = 0;
  let merged = 0;
  let joinsRemoved = 0;

  for (const [, rows] of byKey) {
    if (rows.length < 2) continue;
    groups++;
    // Pick canonical: most songs, then oldest
    rows.sort((a, b) => b._count.songs - a._count.songs || +a.createdAt - +b.createdAt);
    const keep = rows[0];
    const dupIds = rows.slice(1).map((r) => r.id);

    // Move joins from dupes to canonical, skipping pairs that already exist
    const dupJoins = await prisma.songSinger.findMany({
      where: { singerId: { in: dupIds } },
      select: { songId: true, singerId: true },
    });
    const keepJoins = await prisma.songSinger.findMany({
      where: { singerId: keep.id },
      select: { songId: true },
    });
    const alreadyOnKeep = new Set(keepJoins.map((j) => j.songId));
    const toCreate = dupJoins
      .filter((j) => !alreadyOnKeep.has(j.songId))
      // Dedup within the dupes themselves
      .filter((j, i, arr) => arr.findIndex((x) => x.songId === j.songId) === i)
      .map((j) => ({ songId: j.songId, singerId: keep.id }));

    if (toCreate.length > 0) {
      await prisma.songSinger.createMany({ data: toCreate, skipDuplicates: true });
    }
    const del = await prisma.songSinger.deleteMany({ where: { singerId: { in: dupIds } } });
    joinsRemoved += del.count;
    await prisma.singer.deleteMany({ where: { id: { in: dupIds } } });
    merged += dupIds.length;
  }

  await logActivity({
    actorEmail: session?.user?.email,
    action: 'update',
    entity: 'Singer',
    label: `Merged ${merged} duplicate singer${merged !== 1 ? 's' : ''} across ${groups} group${groups !== 1 ? 's' : ''}`,
  });
  revalidatePath('/admin/singers');
  revalidatePath('/songs');
  return { groups, merged, joinsRemoved };
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
