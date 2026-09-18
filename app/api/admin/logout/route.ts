import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { COOKIE_NAME } from '@/lib/admin-auth';

export async function POST() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const db = getSupabaseAdmin();
  if (token && db) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await db.from('admin_sessions').delete().eq('token_hash', tokenHash);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
