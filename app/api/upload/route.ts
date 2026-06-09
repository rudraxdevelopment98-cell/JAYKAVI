import { auth } from '@/auth';
import { uploadBuffer, type UploadFolder } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const VALID_FOLDERS: UploadFolder[] = ['singers', 'songs', 'journey', 'blog', 'misc'];

// Allowed image magic bytes
const MAGIC: Array<{ sig: number[]; label: string }> = [
  { sig: [0xff, 0xd8, 0xff],                   label: 'JPEG' },
  { sig: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a], label: 'PNG'  },
  { sig: [0x47, 0x49, 0x46, 0x38],              label: 'GIF'  },
  { sig: [0x52, 0x49, 0x46, 0x46],              label: 'WebP' }, // RIFF....WEBP verified below
];

function isAllowedImage(buf: Buffer): boolean {
  for (const { sig, label } of MAGIC) {
    if (buf.subarray(0, sig.length).every((b, i) => b === sig[i])) {
      // Extra check: RIFF header must also contain WEBP marker at offset 8
      if (label === 'WebP') {
        return buf.length >= 12 && buf.subarray(8, 12).toString('ascii') === 'WEBP';
      }
      return true;
    }
  }
  return false;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const folderInput = (formData.get('folder') as string) || 'misc';
  const folder: UploadFolder = (VALID_FOLDERS as string[]).includes(folderInput)
    ? (folderInput as UploadFolder)
    : 'misc';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isAllowedImage(buffer)) {
    return NextResponse.json(
      { error: 'Invalid file. Only JPEG, PNG, GIF, and WebP images are accepted.' },
      { status: 400 },
    );
  }

  try {
    const { url, publicId } = await uploadBuffer(buffer, folder);
    return NextResponse.json({ url, publicId });
  } catch (err: any) {
    console.error('[upload] Cloudinary error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Cloudinary upload failed. Check CLOUDINARY_* env vars in Vercel.' },
      { status: 500 },
    );
  }
}
