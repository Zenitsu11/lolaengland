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
    legal_name: String(body.legal_name ?? body.brand_name ?? 'LOLA ENGLAND').trim().slice(0, 160),
    gstin: String(body.gstin ?? '').trim().toUpperCase().slice(0, 15),
    business_address: String(body.business_address ?? '').trim().slice(0, 1000),
    business_state: String(body.business_state ?? 'Rajasthan').trim().slice(0, 80),
    business_state_code: String(body.business_state_code ?? '08').trim().slice(0, 2),
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
    upi_enabled: body.upi_enabled !== false,
    card_enabled: Boolean(body.card_enabled),
    cod_enabled: Boolean(body.cod_enabled),
    cod_fee: num(body.cod_fee,0),
    hero_image_urls: Array.isArray(body.hero_image_urls) ? body.hero_image_urls.filter((x:any)=>typeof x==='string' && x.trim()).slice(0,4) : [],
    hero_video_urls: Array.isArray(body.hero_video_urls) ? body.hero_video_urls.filter((x:any)=>typeof x==='string' && x.trim()).slice(0,2) : [],
  };
  const { data, error } = await db.from('store_settings').upsert({ id: true, ...payload }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath('/');
  return NextResponse.json({ settings: data });
}
