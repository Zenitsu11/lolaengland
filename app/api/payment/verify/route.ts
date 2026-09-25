import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { decryptSecret } from '@/lib/payment-crypto';

export const runtime='nodejs';

export async function POST(request:Request){
  const body=await request.json();
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature,orderRecordId}=body;
  if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature||!orderRecordId) return NextResponse.json({error:'Missing payment verification details.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Payment backend is not configured.'},{status:503});
  const {data:row}=await db.from('orders').select('id,payment_account_id,razorpay_order_id').eq('id',orderRecordId).single();
  if(!row||row.razorpay_order_id!==razorpay_order_id) return NextResponse.json({error:'Order verification failed.'},{status:400});
  const {data:account}=await db.from('payment_accounts').select('*').eq('id',row.payment_account_id).single();
  if(!account) return NextResponse.json({error:'Payment account not found.'},{status:400});
  let secret; try{secret=decryptSecret(account.secret_key_encrypted);}catch{return NextResponse.json({error:'Payment security configuration is missing.'},{status:503});}
  const expected=createHmac('sha256',secret).update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
  if(expected!==razorpay_signature) return NextResponse.json({error:'Payment signature mismatch.'},{status:400});
  const {error}=await db.from('orders').update({status:'paid',razorpay_payment_id,razorpay_signature,paid_at:new Date().toISOString()}).eq('id',orderRecordId);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}