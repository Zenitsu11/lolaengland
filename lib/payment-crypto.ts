import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function key() {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!raw) throw new Error('PAYMENT_ENCRYPTION_KEY is not configured');
  return createHash('sha256').update(raw).digest();
}
export function encryptSecret(value:string){
  const iv=randomBytes(12); const cipher=createCipheriv('aes-256-gcm',key(),iv);
  const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return [iv.toString('base64'),cipher.getAuthTag().toString('base64'),encrypted.toString('base64')].join('.');
}
export function decryptSecret(value:string){
  const [ivB64,tagB64,dataB64]=value.split('.');
  if(!ivB64||!tagB64||!dataB64) throw new Error('Invalid encrypted payment secret');
  const decipher=createDecipheriv('aes-256-gcm',key(),Buffer.from(ivB64,'base64'));
  decipher.setAuthTag(Buffer.from(tagB64,'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64,'base64')),decipher.final()]).toString('utf8');
}