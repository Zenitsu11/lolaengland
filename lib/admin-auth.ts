import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'lola_admin_session';
const OWNER_USERNAME = 'admin@lolaengland.com';
const OWNER_HASH = Buffer.from('6RLj3lxja2tGb1RmK89O50/UScRFpP8+09Td3RcpElCCd+w7jaW5BTvNTORGnXiUlKx2cwGCH9IfpYsHyJ0+uA==', 'base64');

export async function isAdminRequest() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [username, expiresText, nonce, signature] = parts;
  if (username !== OWNER_USERNAME || !/^\\d+$/.test(expiresText) || !nonce || !signature) return false;

  const expiresAt = Number(expiresText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const payload = `${username}.${expiresText}.${nonce}`;
  const expected = createHmac('sha256', OWNER_HASH).update(payload).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
