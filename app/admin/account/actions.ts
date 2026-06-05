'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { revalidatePath } from 'next/cache';

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}
function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === '' ? null : s;
}
function safeHttp(v: string | null): string | null {
  if (!v) return null;
  try {
    const p = new URL(v).protocol;
    return p === 'https:' || p === 'http:' ? v : null;
  } catch {
    return null;
  }
}

export async function saveMyAccount(formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return { error: 'Unauthorized' };

  const email = session.user?.email?.toLowerCase();
  if (!email) return { error: 'No account email on this session.' };

  const data = {
    name: strOrNull(formData.get('name')),
    title: strOrNull(formData.get('title')),
    phone: strOrNull(formData.get('phone')),
    photoUrl: safeHttp(strOrNull(formData.get('photoUrl'))),
    bio: strOrNull(formData.get('bio')),
  };

  // Upsert by email so env-owner admins (who may have no DB row yet) also get a profile.
  await prisma.adminUser.upsert({
    where: { email },
    update: data,
    create: {
      email,
      role: 'Owner',
      permissions: ['all'],
      ...data,
    },
  });

  await logActivity({
    actorEmail: email,
    action: 'update',
    entity: 'Admin',
    label: `${data.name ?? email} updated their profile`,
  });

  revalidatePath('/admin/account');
  return { ok: true };
}
