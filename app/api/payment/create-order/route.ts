import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { decryptSecret } from '@/lib/payment-crypto';
import { calculateCheckout } from '@/lib/checkout-calculator';
import { sendAdminCodOrderAlert } from '@/lib/order-notifications';
export const runtime='nodejs';

async function getAuthenticatedUser(request:Request){
 const auth=request.headers.get('authorization')||'';const token=auth.startsWith('Bearer ')?auth.slice(7):'';if(!token)return null;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY;if(!url||!key)return null;
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data}=await client.auth.getUser(token);return data.user||null;
}

export async function POST(request:Request){
 try{
  const user=await getAuthenticatedUser(request);if(!user)return NextResponse.json({error:'Please sign in before checkout.'},{status:401});
  const body=await request.json();
  const method=body.method==='card'?'card':body.method==='cod'?'cod':'upi';
  const items=Array.isArray(body.items)?body.items:[]; const customer=body.customer||{};
  const idempotencyKey=String(body.idempotencyKey||'').trim().slice(0,120);
  if(!items.length||!customer.name||!customer.phone||!customer.address)return NextResponse.json({error:'Please complete your cart and delivery details.'},{status:400});
  const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const [{data:settings,error:settingsError},{data:upiAccounts,error:upiError},{data:razorpayAccounts,error:razorpayError}]=await Promise.all([
    db.from('store_settings').select('*').eq('id',true).single(),
    db.from('payment_accounts').select('id,name,provider,key_id,secret_key_encrypted,upi_id,active').eq('active',true).order('sort_order').order('created_at'),
    db.from('payment_accounts').select('id,name,provider,key_id,secret_key_encrypted,upi_id,active').eq('active',true).eq('provider','razorpay').order('sort_order').order('created_at')
  ]);
  if(settingsError||!settings)return NextResponse.json({error:'Checkout settings are not configured.'},{status:503});
  if(method==='upi'&&!settings.upi_enabled)return NextResponse.json({error:'UPI payments are currently disabled.'},{status:400});
  if(method==='card'&&!settings.card_enabled)return NextResponse.json({error:'Card payments are currently disabled.'},{status:400});
  if(method==='cod'&&!settings.cod_enabled)return NextResponse.json({error:'Cash on Delivery is currently unavailable.'},{status:400});
  if(upiError||razorpayError)return NextResponse.json({error:'Payment accounts could not be loaded.'},{status:503});

  const paymentAccount=method==='upi'
    ? (upiAccounts||[]).find((a:any)=>a.upi_id)
    : method==='card' ? (razorpayAccounts||[]).find((a:any)=>a.key_id&&a.secret_key_encrypted) : null;
  const envUpi=process.env.LOLA_UPI_ID||'';
  if(method==='upi'&&!paymentAccount&&!envUpi)return NextResponse.json({error:'No active UPI receiver is configured.'},{status:503});
  if(method==='card'&&!paymentAccount)return NextResponse.json({error:'No active Razorpay account is configured for card payments.'},{status:503});

  const couponCode=String(body.couponCode||'').trim().toUpperCase();
  const calc=await calculateCheckout(db,items,couponCode,method==='cod'?Number(settings.cod_fee||0):0);

  // Reusing the same idempotency key returns the original order instead of creating a duplicate.
  if(idempotencyKey){
    const {data:existing}=await db.from('orders').select('*').eq('idempotency_key',idempotencyKey).maybeSingle();
    if(existing){
      const existingUpiAccount=(upiAccounts||[]).find((a:any)=>a.id===existing.payment_account_id);
      if(method==='cod')return NextResponse.json({orderRecordId:existing.id,invoiceNumber:existing.invoice_number||'',method:'cod',...calc});
      if(method==='upi'){
        const upiId=existingUpiAccount?.upi_id||envUpi;
        const upiName=settings.brand_name||existingUpiAccount?.name||'LOLA ENGLAND';
        const transactionNote='LOLA-'+String(existing.id).slice(0,8).toUpperCase();
        const upiUri=`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${Number(existing.total_amount||existing.amount||calc.totalAmount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        return NextResponse.json({orderRecordId:existing.id,invoiceNumber:existing.invoice_number||'',method:'upi',subtotal:Number(existing.subtotal||calc.subtotal),discountAmount:Number(existing.discount_amount||0),couponCode:existing.coupon_code||'',shippingFee:Number(existing.shipping_fee||0),platformFee:Number(existing.platform_fee||0),gstRate:Number(existing.gst_rate||0),gstAmount:Number(existing.gst_amount||0),totalAmount:Number(existing.total_amount||existing.amount||calc.totalAmount),upiId,upiName,transactionNote,upiUri});
      }
      return NextResponse.json({orderRecordId:existing.id,invoiceNumber:existing.invoice_number||'',method:'card',razorpayOrderId:existing.payment_gateway_order_id||existing.razorpay_order_id,keyId:paymentAccount!.key_id,subtotal:Number(existing.subtotal||calc.subtotal),discountAmount:Number(existing.discount_amount||0),couponCode:existing.coupon_code||'',shippingFee:Number(existing.shipping_fee||0),platformFee:Number(existing.platform_fee||0),gstRate:Number(existing.gst_rate||0),gstAmount:Number(existing.gst_amount||0),totalAmount:Number(existing.total_amount||existing.amount||calc.totalAmount)});
    }
  }

  const phone=String(customer.phone).trim().slice(0,30);
  const email=String(user.email||customer.email||'').trim().slice(0,160).toLowerCase();
  const shippingAddress=String(customer.address||'').trim().slice(0,1000);
  let customerRecord:any=null;
  const {data:linkedCustomer,error:linkedError}=await db.from('customers').select('*').eq('auth_user_id',user.id).maybeSingle();if(linkedError)throw linkedError;
  if(linkedCustomer){const {data,error}=await db.from('customers').update({name:String(customer.name).slice(0,120),phone,email,shipping_address:shippingAddress,updated_at:new Date().toISOString()}).eq('id',linkedCustomer.id).select('*').single();if(error)throw error;customerRecord=data;}
  else{
    let guestMatch:any=null;
    if(email){const {data,error}=await db.from('customers').select('*').ilike('email',email).is('auth_user_id',null).limit(1).maybeSingle();if(error)throw error;guestMatch=data;}
    if(!guestMatch&&phone){const {data,error}=await db.from('customers').select('*').eq('phone',phone).is('auth_user_id',null).limit(1).maybeSingle();if(error)throw error;guestMatch=data;}
    if(guestMatch){const {data,error}=await db.from('customers').update({auth_user_id:user.id,name:String(customer.name).slice(0,120),phone,email,shipping_address:shippingAddress,updated_at:new Date().toISOString()}).eq('id',guestMatch.id).select('*').single();if(error)throw error;customerRecord=data;}
    else{const {data,error}=await db.from('customers').insert({auth_user_id:user.id,name:String(customer.name).slice(0,120),phone,email,shipping_address:shippingAddress}).select('*').single();if(error)throw error;customerRecord=data;}
  }

  const {data:saved,error}=await db.from('orders').insert({
    amount:calc.totalAmount,total_amount:calc.totalAmount,subtotal:calc.subtotal,shipping_fee:calc.shippingFee,platform_fee:calc.platformFee,gst_rate:calc.gstRate,gst_amount:calc.gstAmount,coupon_code:couponCode||null,discount_amount:calc.discountAmount,
    currency:'INR',status:method==='cod'?'cod_pending':'awaiting_payment',payment_method:method==='upi'?'upi_qr':method,
    payment_account_id:paymentAccount?.id||null,customer_id:customerRecord?.id||null,customer_name:String(customer.name).slice(0,120),customer_phone:phone,customer_email:email,
    shipping_address:shippingAddress,items:calc.safeItems,idempotency_key:idempotencyKey||null
  }).select('id').single();
  if(error){
    // Two near-simultaneous requests can race the unique index; return the winner.
    if(error.code==='23505'&&idempotencyKey){
      const {data:raceWinner}=await db.from('orders').select('*').eq('idempotency_key',idempotencyKey).maybeSingle();
      if(raceWinner)return NextResponse.json({orderRecordId:raceWinner.id,invoiceNumber:raceWinner.invoice_number||'',method:raceWinner.payment_method==='upi_qr'?'upi':raceWinner.payment_method,razorpayOrderId:raceWinner.payment_gateway_order_id||raceWinner.razorpay_order_id,keyId:paymentAccount?.key_id,subtotal:Number(raceWinner.subtotal||calc.subtotal),discountAmount:Number(raceWinner.discount_amount||0),couponCode:raceWinner.coupon_code||'',shippingFee:Number(raceWinner.shipping_fee||0),platformFee:Number(raceWinner.platform_fee||0),gstRate:Number(raceWinner.gst_rate||0),gstAmount:Number(raceWinner.gst_amount||0),totalAmount:Number(raceWinner.total_amount||raceWinner.amount||calc.totalAmount)});
    }
    return NextResponse.json({error:error.message},{status:500});
  }
  const invoiceNumber=`LE-${new Date().getFullYear()}-${String(saved.id).replace(/-/g,'').slice(0,10).toUpperCase()}`;
  const estimatedDate = new Date(); estimatedDate.setDate(estimatedDate.getDate() + 7);
  await db.from('orders').update({invoice_number:invoiceNumber,estimated_delivery_date:estimatedDate.toISOString().slice(0,10)}).eq('id',saved.id);
  if(customerRecord?.id) await db.from('customers').update({total_orders:Number(customerRecord.total_orders||0)+1,last_order_at:new Date().toISOString()}).eq('id',customerRecord.id);
  if(method==='cod'){
    const alert=await sendAdminCodOrderAlert({orderId:String(saved.id),invoiceNumber,customerName:String(customer.name).slice(0,120),customerEmail:email,customerPhone:phone,shippingAddress,amount:calc.totalAmount,items:calc.safeItems||[]});
    await db.from('orders').update(alert.ok?{admin_notified_at:new Date().toISOString(),admin_notification_error:null}:{admin_notification_error:alert.error||'Admin alert failed.'}).eq('id',saved.id);
    return NextResponse.json({orderRecordId:saved.id,invoiceNumber,method,adminAlertSent:alert.ok,...calc});
  }
  if(method==='upi'){
    const upiId=paymentAccount?.upi_id||envUpi;
    const upiName=settings.brand_name||paymentAccount?.name||'LOLA ENGLAND';
    const transactionNote='LOLA-'+String(saved.id).slice(0,8).toUpperCase();
    const upiUri=`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${calc.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    return NextResponse.json({orderRecordId:saved.id,invoiceNumber,method,subtotal:calc.subtotal,discountAmount:calc.discountAmount,couponCode,shippingFee:calc.shippingFee,platformFee:calc.platformFee,gstRate:calc.gstRate,gstAmount:calc.gstAmount,totalAmount:calc.totalAmount,upiId,upiName,transactionNote,upiUri});
  }
  let secret='';
  try{secret=decryptSecret(String(paymentAccount!.secret_key_encrypted));}catch{return NextResponse.json({error:'Razorpay secret is not configured correctly.'},{status:503});}
  const razorpayRes=await fetch('https://api.razorpay.com/v1/orders',{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':'Basic '+Buffer.from(String(paymentAccount!.key_id)+':'+secret).toString('base64')},
    body:JSON.stringify({amount:Math.round(calc.totalAmount*100),currency:'INR',receipt:String(saved.id),notes:{lola_order_id:String(saved.id),invoice_number:invoiceNumber}})
  });
  const razorpay=await razorpayRes.json().catch(()=>null);
  if(!razorpayRes.ok||!razorpay?.id){
    await db.from('orders').delete().eq('id',saved.id);
    return NextResponse.json({error:razorpay?.error?.description||'Could not create the card payment order.'},{status:502});
  }
  await db.from('orders').update({payment_gateway_order_id:razorpay.id,razorpay_order_id:razorpay.id}).eq('id',saved.id);
  return NextResponse.json({orderRecordId:saved.id,invoiceNumber,method:'card',razorpayOrderId:razorpay.id,keyId:paymentAccount!.key_id,subtotal:calc.subtotal,discountAmount:calc.discountAmount,couponCode,shippingFee:calc.shippingFee,platformFee:calc.platformFee,gstRate:calc.gstRate,gstAmount:calc.gstAmount,totalAmount:calc.totalAmount});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to create your order. Please try again.'},{status:500});}
}
