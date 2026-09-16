import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = request.cookies.get('lola_admin_session')?.value;
  if (!secret || !session || session !== secret) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
