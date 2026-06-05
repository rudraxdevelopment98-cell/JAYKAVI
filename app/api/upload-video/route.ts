import { auth } from '@/auth';
import { uploadVideoBuffer, type UploadFolder } from '@/lib/cloudinary';
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
  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
  }

  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file. Only MP4, WebM, OGG, and MOV videos are accepted.' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url, publicId } = await uploadVideoBuffer(buffer, folder);
  return NextResponse.json({ url, publicId });
}
