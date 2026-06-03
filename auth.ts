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

// Resolve the permission set for an email. Env owners get full access ('all').
// Node-runtime only — queries Prisma.
export async function getPermissionsForEmail(email?: string | null): Promise<string[]> {
  if (!email) return [];
  if (isEnvAdmin(email)) return ['all'];
  try {
    const { prisma } = await import('@/lib/prisma');
    const found = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      select: { permissions: true },
    });
    return found?.permissions ?? [];
  } catch {
    return [];
  }
}

const JWT_RECHECK_INTERVAL = 60 * 60; // re-validate DB admin status every 1 hour

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = await isAllowedAdmin(user.email);
      if (allowed) {
        try {
          const { logActivity } = await import('@/lib/activity');
          await logActivity({
            actorEmail: user.email,
            action: 'login',
            entity: 'Auth',
            label: user.name ?? user.email,
          });
        } catch { /* never block sign-in on logging */ }
      }
      return allowed;
    },
    async jwt({ token, user }) {
      const nowSec = Math.floor(Date.now() / 1000);

      if (user) {
        // Initial sign-in — user already passed the signIn() gate.
        token.isAdmin = true;
        token.permissions = await getPermissionsForEmail(token.email as string | undefined);
        (token as any).checkedAt = nowSec;
      } else {
        // Subsequent JWT refreshes — re-validate DB admin status periodically
        // so a removed admin loses access within one hour, not one session.
        const checkedAt = (token as any).checkedAt as number | undefined;
        if (!checkedAt || nowSec - checkedAt > JWT_RECHECK_INTERVAL) {
          const still = await isAllowedAdmin(token.email as string | undefined);
          if (!still) {
            token.isAdmin = false;
            token.permissions = [];
          } else {
            token.permissions = await getPermissionsForEmail(token.email as string | undefined);
          }
          (token as any).checkedAt = nowSec;
        }
      }

      // Env owners always get full access regardless of DB state.
      if (isEnvAdmin(token.email as string | undefined)) {
        token.isAdmin = true;
        token.permissions = ['all'];
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).isAdmin = token.isAdmin ?? false;
      (session as any).permissions = (token as any).permissions ?? [];
      return session;
    },
  },
});
