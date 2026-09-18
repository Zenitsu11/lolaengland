import { NextResponse } from 'next/server';
import { createHash, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { COOKIE_NAME } from '@/lib/admin-auth';

const scryptAsync = promisify(scrypt);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    if (!db) return NextResponse.json({ ok: false, error: 'Admin authentication is not configured.' }, { status: 503 });

    const { data: account } = await db
      .from('admin_accounts')
      .select('id,username,password_salt,password_hash,active')
      .eq('username', username.trim().toLowerCase())
      .eq('active', true)
      .maybeSingle();

    if (!account) return NextResponse.json({ ok: false }, { status: 401 });

    const salt = Buffer.from(account.password_salt, 'base64');
    const derived = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 }) as Buffer;
    const expected = Buffer.from(account.password_hash, 'base64');
    if (derived.length !== expected.length || !derived.equals(expected)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await db.from('admin_sessions').delete().lt('expires_at', new Date().toISOString());
    const { error } = await db.from('admin_sessions').insert({
      account_id: account.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    if (error) return NextResponse.json({ ok: false, error: 'Could not create admin session.' }, { status: 500 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
