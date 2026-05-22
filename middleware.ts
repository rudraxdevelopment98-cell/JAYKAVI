import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const session = req.auth;
  if (!session || !(session as any).isAdmin) {
    const loginUrl = new URL('/admin/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

// Match every /admin route EXCEPT /admin/login and Next.js internals/api.
export const config = {
  matcher: ['/admin((?!/login).*)'],
};
