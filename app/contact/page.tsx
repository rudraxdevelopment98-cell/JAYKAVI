import { getSocial } from '@/lib/data';
import ContactForm from './ContactForm';

export const metadata = { title: 'Contact — JAYKAVI' };

export default async function ContactPage() {
  const social = await getSocial();

  return (
    <div
      style={{
        padding: '16vh 6vw 9vh',
        maxWidth: 640,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <p
        className="accent"
        style={{
          textTransform: 'uppercase',
          letterSpacing: '.3em',
          fontSize: '.76rem',
          fontWeight: 600,
        }}
      >
        Contact
      </p>
      <h1
        className="font-serif"
        style={{
          fontSize: 'clamp(2.2rem,5vw,3.6rem)',
          fontWeight: 600,
          margin: '12px 0 12px',
        }}
      >
        Get in touch
      </h1>
      <p className="text-muted" style={{ marginBottom: 36 }}>
        For bookings, licensing, or to say hello.
      </p>

      <ContactForm social={social} />
    </div>
  );
}
