import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  inquiryType: z.enum(['collaboration', 'press', 'booking', 'general']),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  organization: z.string().max(100).optional(),
  message: z.string().min(20).max(5000),
});

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await resend.emails.send({
      from: `JAYKAVI Contact <${process.env.RESEND_FROM_EMAIL ?? 'noreply@jaykavi.com'}>`,
      to: ['hello@jaykavi.com'],
      replyTo: data.email,
      subject: `[${data.inquiryType.toUpperCase()}] Message from ${data.name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #c9a84c; margin-bottom: 8px;">New ${data.inquiryType} inquiry</h2>
          <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.organization ? `<p><strong>Organization:</strong> ${data.organization}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.7;">${data.message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', issues: err.issues }, { status: 400 });
    }
    console.error('[contact API]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
