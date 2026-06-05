import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Unified into the /explore page (Collections tab).
export default function CollectionsPage() {
  redirect('/explore?tab=collections');
}
