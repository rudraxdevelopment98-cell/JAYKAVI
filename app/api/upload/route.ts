import { auth } from '@/auth';
import { uploadBuffer, type UploadFolder } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const VALID_FOLDERS: UploadFolder[] = ['singers', 'songs', 'journey', 'blog', 'misc'];

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
  const { url, publicId } = await uploadBuffer(buffer, folder);
  return NextResponse.json({ url, publicId });
}
