import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const productId=new URL(request.url).searchParams.get('product_id');
  let q=db.from('product_variants').select('*').order('size').order('color');
  if(productId) q=q.eq('product_id',productId);
  const {data,error}=await q;
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({variants:data||[]});
}

export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json();
  if(!body.product_id||!String(body.size||'').trim()||!String(body.color||'').trim()) return NextResponse.json({error:'Product, size and color are required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const payload={product_id:body.product_id,size:String(body.size).trim().toUpperCase(),color:String(body.color).trim(),color_hex:body.color_hex?String(body.color_hex):null,sku:body.sku?String(body.sku).trim():null,stock_qty:Math.max(0,Math.floor(Number(body.stock_qty)||0)),reserved_qty:Math.max(0,Math.floor(Number(body.reserved_qty)||0)),low_stock_threshold:Math.max(0,Math.floor(Number(body.low_stock_threshold)||0)),track_inventory:body.track_inventory!==false,active:body.active!==false,updated_at:new Date().toISOString()};
  const {data,error}=await db.from('product_variants').upsert(payload,{onConflict:'product_id,size,color'}).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({variant:data});
}

export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id) return NextResponse.json({error:'Variant ID required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const payload={size:String(body.size||'').trim().toUpperCase(),color:String(body.color||'').trim(),color_hex:body.color_hex?String(body.color_hex):null,sku:body.sku?String(body.sku).trim():null,stock_qty:Math.max(0,Math.floor(Number(body.stock_qty)||0)),reserved_qty:Math.max(0,Math.floor(Number(body.reserved_qty)||0)),low_stock_threshold:Math.max(0,Math.floor(Number(body.low_stock_threshold)||0)),track_inventory:body.track_inventory!==false,active:body.active!==false,updated_at:new Date().toISOString()};
  const {data,error}=await db.from('product_variants').update(payload).eq('id',body.id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({variant:data});
}

export async function DELETE(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id) return NextResponse.json({error:'Variant ID required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {error}=await db.from('product_variants').delete().eq('id',body.id);
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
