import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Add contact to Resend audience
    if (process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email: data.email,
        firstName: data.firstName ?? '',
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      });
    }

    // Welcome email
    await resend.emails.send({
      from: `JAYKAVI <${process.env.RESEND_FROM_EMAIL ?? 'hello@jaykavi.com'}>`,
      to: [data.email],
      subject: 'Welcome to the JAYKAVI Journey',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 60px 40px; background: #080809; color: #f0ede8;">
          <h1 style="font-size: 2rem; font-weight: 300; color: #c9a84c; letter-spacing: 0.05em; margin-bottom: 24px;">
            Welcome${data.firstName ? `, ${data.firstName}` : ''}.
          </h1>
          <p style="line-height: 1.8; color: #b0aba3; font-size: 1rem;">
            You're now part of the JAYKAVI journey — an exclusive world of cinematic storytelling,
            artistic installation, and immersive live experiences.
          </p>
          <p style="line-height: 1.8; color: #b0aba3; margin-top: 16px;">
            Expect early access to screenings, behind-the-scenes glimpses, and personal invitations
            to exclusive events. The best chapters are still unwritten.
          </p>
          <div style="margin: 48px 0; height: 1px; background: #333;"></div>
          <p style="font-size: 0.75rem; color: #5c5850; letter-spacing: 0.1em; text-transform: uppercase;">
            JAYKAVI · A Cinematic Journey
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    console.error('[newsletter API]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
