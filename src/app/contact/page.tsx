import type { Metadata } from 'next';
import { PageLayout } from '@/components/templates/PageLayout';
import { ContactPage } from '@/components/sections/contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach out for collaborations, press, bookings, and general inquiries.',
};

export default function Contact() {
  return (
    <PageLayout>
      <ContactPage />
    </PageLayout>
  );
}
