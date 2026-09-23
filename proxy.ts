import { NextResponse, type NextRequest } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loggedIn = await isAdminRequest();

  if (pathname === '/admin/login') {
    if (loggedIn) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!loggedIn) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
