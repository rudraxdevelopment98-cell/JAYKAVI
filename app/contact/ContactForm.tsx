'use client';
import { useState } from 'react';

// STAGE 1: posts to Formspree (free, no backend needed).
// Replace FORM_ENDPOINT with your form ID from formspree.io after signing up.
const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

export default function ContactForm({ social }: { social: Record<string, string> }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;
    if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      setStatus(res.ok ? 'sent' : 'error');
      if (res.ok) form.reset();
    } catch {
      setStatus('error');
    }
  }

  const input: React.CSSProperties = {
    width: '100%',
    background: 'var(--panel-solid)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    padding: '14px 16px',
    fontSize: '1rem',
    marginBottom: 16,
  };
  const socialEntries = Object.entries(social).filter(([, v]) => v && v.startsWith('http'));

  return (
    <>
      <form onSubmit={onSubmit} className="glass" style={{ padding: 30, borderRadius: 20 }}>
        <input style={input} name="name" placeholder="Your name" required />
        <input style={input} name="email" type="email" placeholder="Your email" required />
        <input style={input} name="subject" placeholder="Subject" />
        <textarea
          style={{ ...input, minHeight: 140, resize: 'vertical' }}
          name="message"
          placeholder="Your message"
          required
        />
        <input
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            padding: '14px 30px',
            borderRadius: 100,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            background: 'linear-gradient(100deg,#5B2A86,#2D6BFF)',
            color: '#fff',
            fontSize: '.95rem',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        {status === 'sent' && (
          <p className="accent" style={{ marginTop: 16 }}>
            Thank you — your message has been sent.
          </p>
        )}
        {status === 'error' && (
          <p style={{ marginTop: 16, color: 'var(--crimson, #D7263D)' }}>
            {FORM_ENDPOINT.includes('YOUR_FORM_ID')
              ? 'Form not configured yet — add your Formspree ID in app/contact/ContactForm.tsx.'
              : 'Something went wrong. Please try again or use the social links below.'}
          </p>
        )}
      </form>

      {socialEntries.length > 0 && (
        <div style={{ marginTop: 36, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {socialEntries.map(([k, v]) => (
            <a
              key={k}
              href={v}
              target="_blank"
              rel="noopener noreferrer"
              className="glass"
              style={{
                textDecoration: 'none',
                padding: '12px 20px',
                borderRadius: 100,
                textTransform: 'capitalize',
              }}
            >
              {k.replace(/Secondary/i, '')}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
