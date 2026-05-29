import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { permissionForPath, hasPermission } from '@/lib/permissions';

export default auth((req) => {
  const session = req.auth as any;
  if (!session || !session.isAdmin) {
    const loginUrl = new URL('/admin/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Per-section permission check. Owners carry ['all'] and pass everything.
  const perms: string[] = session.permissions ?? [];
  const required = permissionForPath(req.nextUrl.pathname);
  if (required && !hasPermission(perms, required)) {
    // Signed in, but not allowed in this section — send to the dashboard.
    const home = new URL('/admin', req.nextUrl.origin);
    home.searchParams.set('denied', required);
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
});

// Match every /admin route EXCEPT /admin/login and Next.js internals/api.
export const config = {
  matcher: ['/admin((?!/login).*)'],
};
