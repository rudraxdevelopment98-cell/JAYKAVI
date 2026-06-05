import { redirect } from 'next/navigation';

// Unified into the /explore page (Singers tab).
export default function SingersPage() {
  redirect('/explore?tab=singers');
}
