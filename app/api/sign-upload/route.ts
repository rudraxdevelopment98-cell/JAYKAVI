import { auth } from '@/auth';
import { cloudinary } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const VALID_FOLDERS = ['singers', 'songs', 'journey', 'blog', 'misc'];

/**
 * Returns a short-lived signature so the browser can upload a (large) video
 * straight to Cloudinary — bypassing Vercel's 4.5 MB serverless body limit.
 * Cloudinary then transcodes whatever was uploaded into web-ready MP4 on
 * delivery, so any input format (mov / mkv / avi / webm …) works.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          'Video uploads are not set up yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment variables, then redeploy.',
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({} as any));
  const folderInput = typeof body.folder === 'string' ? body.folder : 'misc';
  const folder = `jaykavi/${VALID_FOLDERS.includes(folderInput) ? folderInput : 'misc'}`;
  const timestamp = Math.round(Date.now() / 1000);

  // Params must be signed alphabetically: folder, timestamp
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
