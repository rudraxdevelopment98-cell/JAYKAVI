import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Unified into the /explore page (Singers tab).
export default function SingersPage() {
  redirect('/explore?tab=singers');
}
