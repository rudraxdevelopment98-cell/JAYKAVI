import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Permanent "owner" admins from the env var — can never be locked out.
export function isEnvAdmin(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

// Kept for backwards compatibility (env-based check, edge-safe).
export function isAdminEmail(email?: string | null): boolean {
  return isEnvAdmin(email);
}

// Full check: env owners OR admins stored in the database.
// Only call this from the Node runtime (e.g. the signIn callback),
// never from edge middleware — it queries Prisma.
export async function isAllowedAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false;
  if (isEnvAdmin(email)) return true;
  try {
    const { prisma } = await import('@/lib/prisma');
    const found = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return !!found;
  } catch {
    return false;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Runs in the Node runtime — safe to query the database here.
      return await isAllowedAdmin(user.email);
    },
    async jwt({ token, user }) {
      // On initial sign-in the user already passed the signIn() gate above,
      // so they are an admin. Persist that on the token (edge-safe: no DB call).
      if (user) token.isAdmin = true;
      // Env owners are always admins, even on older tokens.
      if (isEnvAdmin(token.email as string | undefined)) token.isAdmin = true;
      return token;
    },
    async session({ session, token }) {
      (session as any).isAdmin = token.isAdmin ?? false;
      return session;
    },
  },
});
