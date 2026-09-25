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
      .select('id,username,active,password_salt,password_hash')
      .eq('username', username.trim().toLowerCase())
      .eq('active', true)
      .maybeSingle();

    console.log('[admin-login] account lookup', { found: Boolean(account), username: username.trim().toLowerCase() });
    if (!account) return NextResponse.json({ ok: false }, { status: 401 });

    if (!account.password_salt || !account.password_hash) {
      return NextResponse.json({ ok: false, error: 'Admin password is not configured.' }, { status: 503 });
    }

    const salt = Buffer.from(account.password_salt, 'base64');
    const expectedHash = Buffer.from(account.password_hash, 'base64');
    const derived = await scryptAsync(password, salt, expectedHash.length) as Buffer;
    console.log('[admin-login] password verification', { saltBytes: salt.length, hashBytes: expectedHash.length, match: derived.length === expectedHash.length && derived.equals(expectedHash) });
    if (derived.length !== expectedHash.length || !derived.equals(expectedHash)) {
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
