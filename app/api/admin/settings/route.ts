import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getSupabaseAdmin(); if (!db) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const { data, error } = await db.from('store_settings').select('*').eq('id', true).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getSupabaseAdmin(); if (!db) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  const body = await request.json();
  const num=(v:any,d:number)=>Number.isFinite(Number(v))?Math.max(0,Number(v)):d;
  const payload = {
    brand_name: String(body.brand_name ?? 'LOLA ENGLAND').trim().slice(0, 100),
    shipping_message: String(body.shipping_message ?? '').trim().slice(0, 200),
    instagram_url: String(body.instagram_url ?? '').trim().slice(0, 500),
    whatsapp_url: String(body.whatsapp_url ?? '').trim().slice(0, 500),
    contact_email: String(body.contact_email ?? '').trim().slice(0, 320),
    amazon_seller_url: String(body.amazon_seller_url ?? '').trim().slice(0, 500),
    flipkart_seller_url: String(body.flipkart_seller_url ?? '').trim().slice(0, 500),
    shipping_fee: num(body.shipping_fee,40),
    free_shipping_threshold: num(body.free_shipping_threshold,799),
    platform_fee: num(body.platform_fee,10),
    gst_rate: Math.min(100,num(body.gst_rate,5)),
  };
  const { data, error } = await db.from('store_settings').upsert({ id: true, ...payload }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return NextResponse.json({ settings: data });
}
