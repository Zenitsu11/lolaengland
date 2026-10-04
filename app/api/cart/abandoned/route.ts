import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) throw new Error('Supabase server configuration is missing.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function POST(request:Request){
 try{
  const body=await request.json();
  const sessionId=String(body?.session_id||'').trim();
  const cart=Array.isArray(body?.cart_data)?body.cart_data:[];
  if(!sessionId) return NextResponse.json({error:'session_id is required.'},{status:400});
  if(!cart.length) return NextResponse.json({ok:true,cleared:true});
  const subtotal=Number(body?.subtotal||0);
  const payload={session_id:sessionId,customer_email:body?.customer_email||null,customer_phone:body?.customer_phone||null,customer_id:body?.customer_id||null,cart_data:cart,subtotal:Number.isFinite(subtotal)?subtotal:0,last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const {data,error}=await db().from('abandoned_carts').upsert(payload,{onConflict:'session_id'}).select('recovery_token').single();
  if(error) throw error;
  return NextResponse.json({ok:true,recovery_token:data.recovery_token});
 }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:'Could not save cart.'},{status:500}); }
}

export async function GET(request:Request){
 try{
  const token=new URL(request.url).searchParams.get('token');
  if(!token) return NextResponse.json({error:'Recovery token is required.'},{status:400});
  const {data,error}=await db().from('abandoned_carts').select('id,cart_data,subtotal,recovered_at').eq('recovery_token',token).maybeSingle();
  if(error) throw error;
  if(!data) return NextResponse.json({error:'Recovery link is invalid or expired.'},{status:404});
  return NextResponse.json({cart_data:data.cart_data,subtotal:data.subtotal,recovered_at:data.recovered_at});
 }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:'Could not recover cart.'},{status:500}); }
}
