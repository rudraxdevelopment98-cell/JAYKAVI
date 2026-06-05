import { redirect } from 'next/navigation';

// Songs, Collections and Singers now live under one unified /explore page.
export default function SongsPage() {
  redirect('/explore?tab=songs');
}
