import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';
import { encryptSecret } from '@/lib/payment-crypto';

export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('payment_accounts').select('id,name,provider,key_id,upi_id,active,sort_order,created_at').order('sort_order').order('created_at');
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({accounts:data||[]});
}

async function keepOnlyActiveProvider(db:any, provider:string, id:string){
  const {error}=await db.from('payment_accounts').update({active:false}).eq('provider',provider).neq('id',id);
  return error;
}

export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json();
  const provider=body.provider==='upi'?'upi':'razorpay';
  if(!body.name) return NextResponse.json({error:'Account name is required.'},{status:400});
  if(provider==='upi'&&!body.upi_id) return NextResponse.json({error:'UPI ID is required.'},{status:400});
  if(provider==='razorpay'&&(!body.key_id||!body.secret_key)) return NextResponse.json({error:'Razorpay Key ID and Secret Key are required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  let encrypted=null;
  if(body.secret_key){try{encrypted=encryptSecret(String(body.secret_key));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Encryption is not configured.'},{status:500});}}
  const {data,error}=await db.from('payment_accounts').insert({name:String(body.name).slice(0,100),provider,key_id:provider==='razorpay'?String(body.key_id):null,secret_key_encrypted:encrypted,upi_id:String(body.upi_id||'').slice(0,120),active:Boolean(body.active),sort_order:Number(body.sort_order||0)}).select('id,name,provider,key_id,upi_id,active,sort_order,created_at').single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  if(data?.active){
    const deactivationError=await keepOnlyActiveProvider(db,provider,data.id);
    if(deactivationError) return NextResponse.json({error:deactivationError.message},{status:500});
  }
  return NextResponse.json({account:data});
}

export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id)return NextResponse.json({error:'Account ID required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const patch:any={name:String(body.name||'').slice(0,100),provider:body.provider==='upi'?'upi':'razorpay',key_id:body.provider==='upi'?null:String(body.key_id||''),upi_id:String(body.upi_id||'').slice(0,120),active:Boolean(body.active),sort_order:Number(body.sort_order||0)};
  if(body.secret_key) patch.secret_key_encrypted=encryptSecret(String(body.secret_key));
  const {data,error}=await db.from('payment_accounts').update(patch).eq('id',body.id).select('id,name,provider,key_id,upi_id,active,sort_order,created_at').single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  if(data?.active){
    const deactivationError=await keepOnlyActiveProvider(db,data.provider,data.id);
    if(deactivationError) return NextResponse.json({error:deactivationError.message},{status:500});
  }
  return NextResponse.json({account:data});
}

export async function DELETE(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {error}=await db.from('payment_accounts').delete().eq('id',body.id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
