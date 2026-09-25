import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { decryptSecret } from '@/lib/payment-crypto';

export const runtime='nodejs';

export async function POST(request:Request){
  const body=await request.json();
  const items=Array.isArray(body.items)?body.items:[]; const customer=body.customer||{};
  if(!items.length||!customer.name||!customer.phone||!customer.address) return NextResponse.json({error:'Please complete your cart and delivery details.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Payment backend is not configured.'},{status:503});
  const {data:account,error:accountError}=await db.from('payment_accounts').select('*').eq('active',true).order('sort_order').limit(1).maybeSingle();
  if(accountError||!account) return NextResponse.json({error:'Online payment is not configured yet. Enable a payment account in Admin.'},{status:503});
  let secret; try{secret=decryptSecret(account.secret_key_encrypted);}catch{return NextResponse.json({error:'Payment encryption key is missing on the server.'},{status:503});}
  const safeItems=items.map((i:any)=>({id:String(i.id),name:String(i.name).slice(0,200),price:Number(i.price),quantity:Math.max(1,Math.min(20,Number(i.quantity)||1))}));
  const amount=safeItems.reduce((sum:number,i:any)=>sum+i.price*i.quantity,0);
  if(!Number.isFinite(amount)||amount<=0) return NextResponse.json({error:'Invalid order amount.'},{status:400});
  const auth=Buffer.from(account.key_id+':'+secret).toString('base64');
  const r=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:'Basic '+auth,'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(amount*100),currency:'INR',receipt:'LOLA-'+Date.now(),notes:{brand:'LOLA ENGLAND'}})});
  const order=await r.json(); if(!r.ok) return NextResponse.json({error:order?.error?.description||'Could not create payment order.'},{status:502});
  const {data:saved,error}=await db.from('orders').insert({razorpay_order_id:order.id,amount,currency:'INR',status:'created',payment_account_id:account.id,customer_name:String(customer.name).slice(0,120),customer_phone:String(customer.phone).slice(0,30),customer_email:String(customer.email||'').slice(0,160),shipping_address:String(customer.address).slice(0,1000),items:safeItems,payment_method:'razorpay'}).select('id').single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({keyId:account.key_id,orderId:order.id,amount:order.amount,currency:order.currency,orderRecordId:saved?.id});
}