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
  const {data:order,error}=await db.from('orders').select('id,status,total_amount,payment_account_id,payment_gateway_order_id,coupon_code,customer_id,items').eq('id',orderRecordId).single();
  if(error||!order)return NextResponse.json({error:'Order not found.'},{status:404});
  if(order.payment_gateway_order_id!==razorpay_order_id)return NextResponse.json({error:'Payment order mismatch.'},{status:400});
  if(order.status==='paid')return NextResponse.json({ok:true,captured:true,status:'paid',paymentId:order.razorpay_payment_id||razorpay_payment_id});
  if(!['awaiting_payment','payment_submitted'].includes(order.status))return NextResponse.json({error:'This order is not eligible for payment verification.'},{status:409});
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
  const nextStatus=captured?'paid':'payment_submitted';
  const patch:any={razorpay_payment_id,payment_gateway_payment_id:razorpay_payment_id,razorpay_signature,payment_gateway_signature:razorpay_signature,status:nextStatus};
  if(captured)patch.paid_at=new Date().toISOString();
  const {data:updated,error:updateError}=await db.from('orders').update(patch).eq('id',order.id).in('status',['awaiting_payment','payment_submitted']).select('id,status').maybeSingle();
  if(updateError)return NextResponse.json({error:updateError.message},{status:500});
  if(!updated){
    const {data:latest}=await db.from('orders').select('status,razorpay_payment_id').eq('id',order.id).maybeSingle();
    if(latest?.status==='paid')return NextResponse.json({ok:true,captured:true,status:'paid',paymentId:latest.razorpay_payment_id||razorpay_payment_id});
    return NextResponse.json({error:'Payment verification is already being processed. Please refresh the order status.'},{status:409});
  }
  if(captured){
    if(order.coupon_code){
      const {data:coupon}=await db.from('coupons').select('id,used_count').eq('code',order.coupon_code).maybeSingle();
      if(coupon)await db.from('coupons').update({used_count:Number(coupon.used_count||0)+1}).eq('id',coupon.id);
    }
    if(order.customer_id){
      const {data:customer}=await db.from('customers').select('total_spent').eq('id',order.customer_id).maybeSingle();
      if(customer)await db.from('customers').update({total_spent:Number(customer.total_spent||0)+Number(order.total_amount||0),last_order_at:new Date().toISOString()}).eq('id',order.customer_id);
    }
    const items=Array.isArray(order.items)?order.items:[];
    for(const item of items){
      const qty=Math.max(1,Math.min(20,Number(item.quantity)||1));
      const variantId=String(item.variantId||'');
      if(variantId){
        const {data:v}=await db.from('product_variants').select('id,stock_qty,reserved_qty,track_inventory').eq('id',variantId).maybeSingle();
        if(v?.track_inventory)await db.from('product_variants').update({stock_qty:Math.max(0,Number(v.stock_qty)-qty),updated_at:new Date().toISOString()}).eq('id',variantId);
        continue;
      }
      const productId=String(item.id||'');if(!productId)continue;
      const {data:inv}=await db.from('product_inventory').select('product_id,stock_qty,reserved_qty,track_inventory').eq('product_id',productId).maybeSingle();
      if(inv?.track_inventory)await db.from('product_inventory').update({stock_qty:Math.max(0,Number(inv.stock_qty)-qty),updated_at:new Date().toISOString()}).eq('product_id',productId);
    }
  }
  return NextResponse.json({ok:true,captured,status:nextStatus,paymentId:razorpay_payment_id});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Could not verify payment.'},{status:500});}
}
