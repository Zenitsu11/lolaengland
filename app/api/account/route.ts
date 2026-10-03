import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

async function getUser(request:Request){
  const auth=request.headers.get('authorization')||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token) return null;
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY;
  if(!url||!key) return null;
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data}=await client.auth.getUser(token);
  return data.user||null;
}

async function getCustomer(db:any,user:any){
  const {data,error}=await db.from('customers').select('*').eq('auth_user_id',user.id).maybeSingle();
  if(error) throw error;
  if(data) return data;
  const {data:byEmail}=await db.from('customers').select('*').ilike('email',user.email||'').limit(1).maybeSingle();
  if(byEmail){
    const {data:linked,error:linkError}=await db.from('customers').update({auth_user_id:user.id}).eq('id',byEmail.id).select('*').single();
    if(linkError) throw linkError;
    return linked;
  }
  const {data:created,error:createError}=await db.from('customers').insert({auth_user_id:user.id,email:user.email||'',name:user.user_metadata?.full_name||''}).select('*').single();
  if(createError) throw createError;
  return created;
}

export async function GET(request:Request){
  try{
    const user=await getUser(request); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
    const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
    const customer=await getCustomer(db,user);
    const [orders,addresses,wishlist]=await Promise.all([
      db.from('orders').select('id,status,total_amount,subtotal,shipping_fee,platform_fee,gst_amount,coupon_code,discount_amount,payment_method,customer_name,customer_phone,customer_email,shipping_address,items,created_at,paid_at,return_status,refund_status,refund_amount').eq('customer_id',customer.id).order('created_at',{ascending:false}).limit(100),
      db.from('customer_addresses').select('*').eq('auth_user_id',user.id).order('is_default',{ascending:false}).order('created_at',{ascending:false}),
      db.from('customer_wishlist').select('product_id,created_at').eq('auth_user_id',user.id).order('created_at',{ascending:false})
    ]);
    if(orders.error) throw orders.error; if(addresses.error) throw addresses.error; if(wishlist.error) throw wishlist.error;
    return NextResponse.json({user:{id:user.id,email:user.email||'',name:customer.name||user.user_metadata?.full_name||'',phone:customer.phone||''},orders:orders.data||[],addresses:addresses.data||[],wishlist:wishlist.data||[]});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Could not load account.'},{status:500});}
}

export async function POST(request:Request){
  try{
    const user=await getUser(request); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
    const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
    const body=await request.json(); const action=String(body.action||'');
    if(action==='profile'){
      const name=String(body.name||'').trim().slice(0,120); const phone=String(body.phone||'').trim().slice(0,30);
      const {data,error}=await db.from('customers').update({name,phone}).eq('auth_user_id',user.id).select('*').single(); if(error) throw error;
      return NextResponse.json({customer:data});
    }
    if(action==='address'){
      const payload={label:String(body.label||'Home').slice(0,40),name:String(body.name||'').slice(0,120),phone:String(body.phone||'').slice(0,30),line1:String(body.line1||'').slice(0,200),line2:String(body.line2||'').slice(0,200),city:String(body.city||'').slice(0,80),state:String(body.state||'').slice(0,80),pincode:String(body.pincode||'').replace(/\D/g,'').slice(0,6),is_default:Boolean(body.is_default)};
      const {data,error}=await db.from('customer_addresses').insert({auth_user_id:user.id,...payload}).select('*').single(); if(error) throw error;
      return NextResponse.json({address:data});
    }
    if(action==='delete_address'){
      const {error}=await db.from('customer_addresses').delete().eq('id',String(body.id)).eq('auth_user_id',user.id); if(error) throw error;
      return NextResponse.json({ok:true});
    }
    if(action==='wishlist_add'){
      const {error}=await db.from('customer_wishlist').upsert({auth_user_id:user.id,product_id:String(body.product_id)},{onConflict:'auth_user_id,product_id'}); if(error) throw error;
      return NextResponse.json({ok:true});
    }
    if(action==='wishlist_remove'){
      const {error}=await db.from('customer_wishlist').delete().eq('auth_user_id',user.id).eq('product_id',String(body.product_id)); if(error) throw error;
      return NextResponse.json({ok:true});
    }
    return NextResponse.json({error:'Unknown account action'},{status:400});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Account update failed.'},{status:500});}
}
