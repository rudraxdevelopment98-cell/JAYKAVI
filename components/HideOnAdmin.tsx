'use client';
import { usePathname } from 'next/navigation';

// Hides public-site chrome (e.g. the Footer) on /admin routes.
// Receives server-rendered children and simply gates their visibility.
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
