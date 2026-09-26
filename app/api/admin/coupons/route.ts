import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

const clean=(body:any)=>({
  code:String(body.code||'').trim().toUpperCase().replace(/\\s+/g,''),
  description:String(body.description||'').trim(),
  discount_type:body.discount_type==='fixed'?'fixed':'percent',
  discount_value:Math.max(0,Number(body.discount_value)||0),
  minimum_order_value:Math.max(0,Number(body.minimum_order_value)||0),
  maximum_discount:body.maximum_discount===''||body.maximum_discount==null?null:Math.max(0,Number(body.maximum_discount)||0),
  usage_limit:body.usage_limit===''||body.usage_limit==null?null:Math.max(1,Math.floor(Number(body.usage_limit)||1)),
  starts_at:body.starts_at||null,
  expires_at:body.expires_at||null,
  active:body.active!==false
});

export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('coupons').select('*').order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({coupons:data||[]});
}
export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const payload=clean(body);
  if(!payload.code||!payload.discount_value) return NextResponse.json({error:'Coupon code and discount value are required.'},{status:400});
  if(payload.discount_type==='percent'&&payload.discount_value>100) return NextResponse.json({error:'Percentage discount cannot exceed 100%.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('coupons').insert(payload).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({coupon:data},{status:201});
}
export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id) return NextResponse.json({error:'Coupon ID required.'},{status:400});
  const payload=clean(body);
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('coupons').update(payload).eq('id',body.id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({coupon:data});
}
export async function DELETE(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id) return NextResponse.json({error:'Coupon ID required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {error}=await db.from('coupons').delete().eq('id',body.id);
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}