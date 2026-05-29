import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Sanity webhook triggers this to revalidate ISR pages on content change
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { _type, slug } = body;

    switch (_type) {
      case 'work':
        revalidatePath('/explore');
        revalidatePath('/');
        if (slug?.current) revalidatePath(`/work/${slug.current}`);
        break;
      case 'event':
        revalidatePath('/events');
        if (slug?.current) revalidatePath(`/events/${slug.current}`);
        break;
      case 'galleryItem':
        revalidatePath('/gallery');
        break;
      case 'siteConfig':
        revalidatePath('/', 'layout');
        break;
    }

    return NextResponse.json({ revalidated: true, type: _type });
  } catch (err) {
    console.error('[revalidate API]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
