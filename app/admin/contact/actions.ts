'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}
function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === '' ? null : s;
}

export async function saveContact(formData: FormData) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) throw new Error('Unauthorized');

  const data = {
    useContactForm: formData.get('useContactForm') === 'on',
    showEmailPublicly: formData.get('showEmailPublicly') === 'on',
    instagram: strOrNull(formData.get('instagram')),
    instagramSecondary: strOrNull(formData.get('instagramSecondary')),
    youtube: strOrNull(formData.get('youtube')),
    spotify: strOrNull(formData.get('spotify')),
    jiosaavn: strOrNull(formData.get('jiosaavn')),
    privateEmail: strOrNull(formData.get('privateEmail')),
    privatePhone: strOrNull(formData.get('privatePhone')),
    privateNote: strOrNull(formData.get('privateNote')),
  };

  await prisma.contact.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  revalidatePath('/admin/contact');
  revalidatePath('/contact');
  revalidatePath('/');
}
