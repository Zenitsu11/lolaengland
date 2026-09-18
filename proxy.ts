import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next();
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  const session = request.cookies.get('lola_admin_session')?.value;
  if (!session) return NextResponse.redirect(new URL('/admin/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
