import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session && (session as any).isAdmin) {
    redirect(searchParams.callbackUrl ?? '/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 p-6">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-8">
        <h1 className="text-2xl font-semibold mb-1">JAYKAVI Admin</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Sign in with your authorized Google account.
        </p>

        {searchParams.error && (
          <div className="mb-4 px-3 py-2 text-sm text-red-400 border border-red-900/60 rounded-md bg-red-950/40">
            {searchParams.error === 'AccessDenied'
              ? 'That account is not authorized.'
              : 'Sign-in failed. Try again.'}
          </div>
        )}

        <form
          action={async () => {
            'use server';
            await signIn('google', {
              redirectTo: searchParams.callbackUrl ?? '/admin',
            });
          }}
        >
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-white text-neutral-900 rounded-md font-medium hover:bg-neutral-200 transition"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
