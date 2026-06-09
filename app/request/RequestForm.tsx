'use client';
import { useState } from 'react';

interface Fields {
  songName: string;
  singerName: string;
  youtubeUrl: string;
  notes: string;
  name: string;
}

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.82rem',
  fontWeight: 600,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  opacity: 0.55,
  marginBottom: 6,
};

const fieldWrap: React.CSSProperties = { marginBottom: 20 };

export default function RequestForm() {
  const [fields, setFields] = useState<Fields>({
    songName: '',
    singerName: '',
    youtubeUrl: '',
    notes: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  function validate(f: Fields) {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!f.songName.trim() || f.songName.trim().length < 2)
      e.songName = 'Please enter a song name (at least 2 characters).';
    const yt = f.youtubeUrl.trim();
    if (yt && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(yt))
      e.youtubeUrl = 'Must be a youtube.com or youtu.be link, or leave blank.';
    return e;
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const updated = { ...fields, [e.target.name]: e.target.value };
    setFields(updated);
    if (errors[e.target.name as keyof Fields]) setErrors(validate(updated));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/song-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('sent');
        setFields({ songName: '', singerName: '', youtubeUrl: '', notes: '', name: '' });
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

  if (status === 'sent') {
    return (
      <div
        className="glass"
        style={{
          padding: 36,
          borderRadius: 20,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Request received!</h3>
        <p className="text-muted" style={{ margin: 0, maxWidth: 380 }}>
          Thank you for your suggestion. Every request is read personally — I&apos;ll try my best to add it.
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
          Request another song
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass" style={{ padding: '28px 30px', borderRadius: 20 }}>
      {/* Song name — required */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Song name *</label>
        <input
          name="songName"
          value={fields.songName}
          onChange={onChange}
          placeholder="e.g. Tame Aavo Che"
          style={{ ...inputBase, borderColor: errors.songName ? '#e53935' : 'var(--line)' }}
          autoComplete="off"
        />
        {errors.songName && (
          <p style={{ color: '#e53935', fontSize: '.82rem', marginTop: 4 }}>{errors.songName}</p>
        )}
      </div>

      {/* Singer name */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Singer name <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
        <input
          name="singerName"
          value={fields.singerName}
          onChange={onChange}
          placeholder="e.g. Geeta Rabari"
          style={{ ...inputBase }}
          autoComplete="off"
        />
      </div>

      {/* YouTube link */}
      <div style={fieldWrap}>
        <label style={labelStyle}>YouTube link <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional, helps a lot</span></label>
        <input
          name="youtubeUrl"
          value={fields.youtubeUrl}
          onChange={onChange}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{ ...inputBase, borderColor: errors.youtubeUrl ? '#e53935' : 'var(--line)', fontFamily: 'monospace', fontSize: '.9rem' }}
          autoComplete="off"
          inputMode="url"
        />
        {errors.youtubeUrl && (
          <p style={{ color: '#e53935', fontSize: '.82rem', marginTop: 4 }}>{errors.youtubeUrl}</p>
        )}
      </div>

      {/* Notes */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Notes <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
        <textarea
          name="notes"
          value={fields.notes}
          onChange={onChange}
          placeholder="Anything else — why you love it, where you heard it, etc."
          style={{ ...inputBase, minHeight: 100, resize: 'vertical' }}
        />
      </div>

      {/* Your name */}
      <div style={{ ...fieldWrap, marginBottom: 28 }}>
        <label style={labelStyle}>Your name <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
        <input
          name="name"
          value={fields.name}
          onChange={onChange}
          placeholder="So I know who to thank"
          style={{ ...inputBase }}
          autoComplete="name"
        />
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
          background: 'linear-gradient(100deg, #5B2A86, #2D6BFF)',
          color: '#fff',
          fontSize: '.95rem',
          opacity: status === 'sending' ? 0.7 : 1,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {status === 'sending' ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }} aria-hidden>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Sending…
          </>
        ) : 'Submit request'}
      </button>

      {status === 'error' && serverError && (
        <p style={{ marginTop: 16, color: '#e53935', fontSize: '.9rem' }}>{serverError}</p>
      )}
    </form>
  );
}
