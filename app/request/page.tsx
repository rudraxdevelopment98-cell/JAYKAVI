import RequestForm from './RequestForm';
import Link from 'next/link';

export const metadata = {
  title: 'Request a Song — JAYKAVI',
  description: 'Suggest a Gujarati song you\'d like to see added to the JAYKAVI collection.',
};

export default function RequestPage() {
  return (
    <div className="page-wrap" style={{ maxWidth: 680, margin: '0 auto' }}>
      <p
        className="accent"
        style={{
          textTransform: 'uppercase',
          letterSpacing: '.3em',
          fontSize: '.76rem',
          fontWeight: 600,
        }}
      >
        Suggest a song
      </p>
      <h1
        className="font-serif"
        style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: 600,
          margin: '12px 0 12px',
        }}
      >
        Request a song
      </h1>
      <p className="text-muted" style={{ marginBottom: 36, maxWidth: 520 }}>
        Know a Gujarati song that should be in this collection? Share it here — every suggestion
        is personally reviewed and I&apos;ll do my best to add it.
      </p>

      <RequestForm />

      <p className="text-muted" style={{ marginTop: 28, fontSize: '.88rem' }}>
        Have a different question?{' '}
        <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
          Send a message instead →
        </Link>
      </p>
    </div>
  );
}
