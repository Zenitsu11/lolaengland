import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { decryptSecret } from '@/lib/payment-crypto';
export const runtime='nodejs';

export async function POST(request:Request){
 try{
  const {orderRecordId,razorpay_payment_id,razorpay_order_id,razorpay_signature}=await request.json();
  if(!orderRecordId||!razorpay_payment_id||!razorpay_order_id||!razorpay_signature)return NextResponse.json({error:'Incomplete payment response.'},{status:400});
  const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const {data:order,error}=await db.from('orders').select('id,status,total_amount,payment_account_id,payment_gateway_order_id').eq('id',orderRecordId).single();
  if(error||!order)return NextResponse.json({error:'Order not found.'},{status:404});
  if(order.payment_gateway_order_id!==razorpay_order_id)return NextResponse.json({error:'Payment order mismatch.'},{status:400});
  const {data:account}=await db.from('payment_accounts').select('key_id,secret_key_encrypted').eq('id',order.payment_account_id).single();
  if(!account?.key_id||!account.secret_key_encrypted)return NextResponse.json({error:'Payment account is unavailable.'},{status:503});
  const secret=decryptSecret(account.secret_key_encrypted);
  const expected=createHmac('sha256',secret).update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
  const valid=expected.length===String(razorpay_signature).length&&timingSafeEqual(Buffer.from(expected),Buffer.from(String(razorpay_signature)));
  if(!valid)return NextResponse.json({error:'Payment signature verification failed.'},{status:400});
  const paymentRes=await fetch('https://api.razorpay.com/v1/payments/'+encodeURIComponent(razorpay_payment_id),{headers:{Authorization:'Basic '+Buffer.from(String(account.key_id)+':'+secret).toString('base64')}});
  const payment=await paymentRes.json().catch(()=>null);
  if(!paymentRes.ok||payment?.order_id!==razorpay_order_id)return NextResponse.json({error:'Could not verify payment with Razorpay.'},{status:502});
  if(Number(payment.amount)!==Math.round(Number(order.total_amount)*100))return NextResponse.json({error:'Payment amount mismatch.'},{status:400});
  const captured=payment.status==='captured'||payment.captured===true;
  const patch:any={razorpay_payment_id,payment_gateway_payment_id:razorpay_payment_id,razorpay_signature, payment_gateway_signature:razorpay_signature,status:captured?'paid':'payment_submitted'};
  if(captured)patch.paid_at=new Date().toISOString();
  const {error:updateError}=await db.from('orders').update(patch).eq('id',order.id);
  if(updateError)return NextResponse.json({error:updateError.message},{status:500});
  return NextResponse.json({ok:true,captured,status:patch.status,paymentId:razorpay_payment_id});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Could not verify payment.'},{status:500});}
}
