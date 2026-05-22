import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/contact', label: 'Contact & Social' },
  { href: '/admin/singers', label: 'Singers' },
  { href: '/admin/collections', label: 'Collections' },
  { href: '/admin/songs', label: 'Songs' },
  { href: '/admin/journey', label: 'Journey' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Login page handles its own auth UI; middleware guards everything else.
  // Render layout for logged-in admins only.
  if (!session) return <>{children}</>;
  if (!(session as any).isAdmin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex">
        <aside className="w-64 min-h-screen border-r border-neutral-800 bg-neutral-900/50 p-6">
          <div className="mb-8">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
              ← View site
            </Link>
            <h2 className="mt-2 text-xl font-semibold">JAYKAVI Admin</h2>
            <p className="text-xs text-neutral-500 mt-1">{session.user?.email}</p>
          </div>

          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm hover:bg-neutral-800 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/admin/login' });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="w-full px-3 py-2 text-left text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition"
            >
              Sign out
            </button>
          </form>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
