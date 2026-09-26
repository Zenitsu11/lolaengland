import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const videoTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const allowed = new Set([...imageTypes, ...videoTypes]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
  if (!allowed.has(file.type)) return NextResponse.json({ error: 'Use JPG, PNG, WebP or MP4/WebM video' }, { status: 400 });
  const isVideo = videoTypes.has(file.type);
  const maxSize = isVideo ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) return NextResponse.json({ error: isVideo ? 'Video must be 30 MB or smaller' : 'Image must be 5 MB or smaller' }, { status: 400 });

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : file.type === 'video/mp4' ? 'mp4' : file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'jpg';
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await db.storage.from('product-images').upload(path, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: '31536000',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = db.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
