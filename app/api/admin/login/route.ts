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

    // Authenticate against the Supabase Auth user created for the owner.
    // This keeps the password out of the application database and source code.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const authClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: normalized,
        password,
      });

      if (!authError && authData.user?.email?.toLowerCase() === normalized) {
        const db = getSupabaseAdmin();
        if (db) {
          const { data: account } = await db
            .from('admin_accounts')
            .select('id,username,active')
            .eq('username', normalized)
            .eq('active', true)
            .maybeSingle();

          if (account) {
            accountId = account.id;
            valid = true;
          }
        }
      }
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
