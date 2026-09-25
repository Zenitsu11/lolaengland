import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const COOKIE_NAME = 'lola_admin_session';

export async function isAdminRequest() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const db = getSupabaseAdmin();
  if (!db) return false;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data } = await db
    .from('admin_sessions')
    .select('id,expires_at,account_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return Boolean(data?.id && data?.account_id);
}

export { COOKIE_NAME };
