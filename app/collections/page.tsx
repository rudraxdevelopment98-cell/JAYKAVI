import { redirect } from 'next/navigation';

// Unified into the /explore page (Collections tab).
export default function CollectionsPage() {
  redirect('/explore?tab=collections');
}
