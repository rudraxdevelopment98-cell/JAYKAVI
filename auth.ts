import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      return isAdminEmail(user.email);
    },
    async jwt({ token }) {
      token.isAdmin = isAdminEmail(token.email as string | undefined);
      return token;
    },
    async session({ session, token }) {
      (session as any).isAdmin = token.isAdmin ?? false;
      return session;
    },
  },
});
