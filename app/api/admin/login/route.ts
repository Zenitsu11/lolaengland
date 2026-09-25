import { NextResponse } from 'next/server';
import { createHash, createHmac, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { COOKIE_NAME } from '@/lib/admin-auth';

const scryptAsync = promisify(scrypt);

// Emergency owner credential. Only the derived hash is stored in source.
const OWNER_USERNAME = 'admin@lolaengland.com';
const OWNER_SALT = Buffer.from('AvHJEWCsmQiYKU54ezX+AA==', 'base64');
const OWNER_HASH = Buffer.from('6RLj3lxja2tGb1RmK89O50/UScRFpP8+09Td3RcpElCCd+w7jaW5BTvNTORGnXiUlKx2cwGCH9IfpYsHyJ0+uA==', 'base64');

function signSession(payload: string) {
  return createHmac('sha256', OWNER_HASH).update(payload).digest('hex');
}

function makeSession() {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${OWNER_USERNAME}.${expiresAt}.${randomBytes(16).toString('hex')}`;
  return `${payload}.${signSession(payload)}`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let username: unknown;
    let password: unknown;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body?.username;
      password = body?.password;
    } else {
      const form = await request.formData();
      username = form.get('username');
      password = form.get('password');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      if (contentType.includes('application/json')) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
    }

    const normalized = username.trim().toLowerCase();
    let valid = false;
    let accountId: string | null = null;
    const db = getSupabaseAdmin();

    // Use the database account when the production environment is connected to it.
    if (db) {
      const { data: account } = await db
        .from('admin_accounts')
        .select('id,username,active,password_salt,password_hash')
        .eq('username', normalized)
        .eq('active', true)
        .maybeSingle();

      if (account?.password_salt && account?.password_hash) {
        const salt = Buffer.from(account.password_salt, 'base64');
        const expectedHash = Buffer.from(account.password_hash, 'base64');
        const derived = await scryptAsync(password, salt, expectedHash.length) as Buffer;
        valid = derived.length === expectedHash.length && derived.equals(expectedHash);
        accountId = account.id;
      }
    }

    // Self-contained owner fallback prevents a mismatched/missing production DB
    // from locking the site owner out.
    if (!valid && normalized === OWNER_USERNAME) {
      const derived = await scryptAsync(password, OWNER_SALT, OWNER_HASH.length) as Buffer;
      valid = derived.equals(OWNER_HASH);
    }

    if (!valid) {
      if (contentType.includes('application/json')) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login?error=1', request.url), 303);
    }

    const token = makeSession();

    // Keep the DB session when available, but don't make login depend on it.
    if (db && accountId) {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.from('admin_sessions').delete().lt('expires_at', new Date().toISOString());
      await db.from('admin_sessions').insert({ account_id: accountId, token_hash: tokenHash, expires_at: expiresAt });
    }

    const response = contentType.includes('application/json')
      ? NextResponse.json({ ok: true })
      : NextResponse.redirect(new URL('/admin', request.url), 303);
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
