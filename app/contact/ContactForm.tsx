'use client';
import { useState, useCallback } from 'react';

interface Fields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

function validateFields(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim() || fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }
  if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!fields.message.trim() || fields.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }
  return errors;
}

export default function ContactForm({ social }: { social: Record<string, string> }) {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...fields, [name]: value };
    setFields(updated);
    if (touched[name as keyof Fields]) {
      setErrors(validateFields(updated));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, touched]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateFields(fields));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    const validationErrors = validateFields(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus('sending');
    setServerError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('sent');
        setFields({ name: '', email: '', subject: '', message: '' });
        setTouched({});
        setErrors({});
      } else {
        setServerError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  const socialEntries = Object.entries(social).filter(([, v]) => v && v.startsWith('http'));

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'var(--panel-solid)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    padding: '14px 16px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const errorStyle: React.CSSProperties = {
    color: '#e53935',
    fontSize: '.82rem',
    marginTop: 4,
    marginBottom: 12,
  };

  if (status === 'sent') {
    return (
      <>
        <div
          className="glass"
          style={{
            padding: 30,
            borderRadius: 20,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Message sent!</h3>
          <p className="text-muted" style={{ margin: 0 }}>
            Thank you — your message has been received. I will get back to you soon.
          </p>
          <button
            onClick={() => setStatus('idle')}
            style={{
              marginTop: 8,
              padding: '10px 24px',
              borderRadius: 100,
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '.9rem',
            }}
          >
            Send another message
          </button>
        </div>
        {socialEntries.length > 0 && (
          <div style={{ marginTop: 36, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {socialEntries.map(([k, v]) => (
              <a
                key={k}
                href={v}
                target="_blank"
                rel="noopener noreferrer"
                className="glass"
                style={{ textDecoration: 'none', padding: '12px 20px', borderRadius: 100, textTransform: 'capitalize' }}
              >
                {k.replace(/Secondary/i, '')}
              </a>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="glass" style={{ padding: 30, borderRadius: 20 }}>
        {/* Name */}
        <div style={{ marginBottom: 4 }}>
          <input
            style={{ ...inputBase, borderColor: touched.name && errors.name ? '#e53935' : 'var(--line)' }}
            name="name"
            placeholder="Your name"
            value={fields.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="name"
          />
          {touched.name && errors.name
            ? <p style={errorStyle}>{errors.name}</p>
            : <div style={{ marginBottom: 16 }} />
          }
        </div>

        {/* Email */}
        <div style={{ marginBottom: 4 }}>
          <input
            style={{ ...inputBase, borderColor: touched.email && errors.email ? '#e53935' : 'var(--line)' }}
            name="email"
            type="email"
            placeholder="Your email"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
          />
          {touched.email && errors.email
            ? <p style={errorStyle}>{errors.email}</p>
            : <div style={{ marginBottom: 16 }} />
          }
        </div>

        {/* Subject (optional) */}
        <div style={{ marginBottom: 16 }}>
          <input
            style={inputBase}
            name="subject"
            placeholder="Subject (optional)"
            value={fields.subject}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: 4 }}>
          <textarea
            style={{
              ...inputBase,
              minHeight: 140,
              resize: 'vertical',
              borderColor: touched.message && errors.message ? '#e53935' : 'var(--line)',
            }}
            name="message"
            placeholder="Your message"
            value={fields.message}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.message && errors.message
            ? <p style={errorStyle}>{errors.message}</p>
            : <div style={{ marginBottom: 16 }} />
          }
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            padding: '14px 30px',
            borderRadius: 100,
            border: 'none',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            background: 'linear-gradient(100deg,#5B2A86,#2D6BFF)',
            color: '#fff',
            fontSize: '.95rem',
            opacity: status === 'sending' ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        {status === 'error' && serverError && (
          <p style={{ marginTop: 16, color: '#e53935', fontSize: '.9rem' }}>{serverError}</p>
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
              style={{ textDecoration: 'none', padding: '12px 20px', borderRadius: 100, textTransform: 'capitalize' }}
            >
              {k.replace(/Secondary/i, '')}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
