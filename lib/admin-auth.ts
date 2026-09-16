import { cookies } from 'next/headers';

export async function isAdminRequest(){
  const secret = process.env.ADMIN_SESSION_SECRET;
  if(!secret) return false;
  const store = await cookies();
  return store.get('lola_admin_session')?.value === secret;
}
