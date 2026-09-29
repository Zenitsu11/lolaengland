import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { decryptSecret } from '@/lib/payment-crypto';
import { calculateCheckout } from '@/lib/checkout-calculator';
export const runtime='nodejs';

export async function POST(request:Request){
 try{
  const body=await request.json();
  const method=body.method==='card'?'card':body.method==='cod'?'cod':'upi';
  const items=Array.isArray(body.items)?body.items:[]; const customer=body.customer||{};
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
  const couponCode=String(body.couponCode||'').trim().toUpperCase();
  const calc=await calculateCheckout(db,items,couponCode,method==='cod'?Number(settings.cod_fee||0):0);
  const phone=String(customer.phone).trim().slice(0,30);
  const email=String(customer.email||'').trim().slice(0,160).toLowerCase();
  let customerRecord:any=null;
  const existingCustomer=phone?await db.from('customers').select('*').eq('phone',phone).maybeSingle():{data:null,error:null};
  if(existingCustomer.data){
    const {data}=await db.from('customers').update({name:String(customer.name).slice(0,120),email,shipping_address:String(customer.address).slice(0,1000),updated_at:new Date().toISOString()}).eq('id',existingCustomer.data.id).select('*').single();
    customerRecord=data;
  }else{
    const {data}=await db.from('customers').insert({name:String(customer.name).slice(0,120),phone,email,shipping_address:String(customer.address).slice(0,1000)}).select('*').single();
    customerRecord=data;
  }
  const paymentAccount=method==='upi'
    ? (upiAccounts||[]).find((a:any)=>a.upi_id)
    : method==='card' ? (razorpayAccounts||[]).find((a:any)=>a.key_id&&a.secret_key_encrypted) : null;
  const envUpi=process.env.LOLA_UPI_ID||'';
  if(method==='upi'&&!paymentAccount&&!envUpi)return NextResponse.json({error:'No active UPI receiver is configured.'},{status:503});
  if(method==='card'&&!paymentAccount)return NextResponse.json({error:'No active Razorpay account is configured for card payments.'},{status:503});
  const {data:saved,error}=await db.from('orders').insert({
    amount:calc.totalAmount,total_amount:calc.totalAmount,subtotal:calc.subtotal,shipping_fee:calc.shippingFee,platform_fee:calc.platformFee,gst_rate:calc.gstRate,gst_amount:calc.gstAmount,coupon_code:couponCode||null,discount_amount:calc.discountAmount,
    currency:'INR',status:method==='cod'?'cod_pending':'awaiting_payment',payment_method:method==='upi'?'upi_qr':method,
    payment_account_id:paymentAccount?.id||null,customer_id:customerRecord?.id||null,customer_name:String(customer.name).slice(0,120),customer_phone:phone,customer_email:email,
    shipping_address:String(customer.address).slice(0,1000),items:calc.safeItems
  }).select('id').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  if(customerRecord?.id) await db.from('customers').update({total_orders:Number(customerRecord.total_orders||0)+1,last_order_at:new Date().toISOString()}).eq('id',customerRecord.id);
  if(method==='cod'){
    return NextResponse.json({orderRecordId:saved.id,method, ...calc});
  }
  if(method==='upi'){
    const upiId=paymentAccount?.upi_id||envUpi;
    const upiName=settings.brand_name||paymentAccount?.name||'LOLA ENGLAND';
    const transactionNote='LOLA-'+String(saved.id).slice(0,8).toUpperCase();
    const upiUri=`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${calc.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    return NextResponse.json({orderRecordId:saved.id,method,subtotal:calc.subtotal,discountAmount:calc.discountAmount,couponCode,shippingFee:calc.shippingFee,platformFee:calc.platformFee,gstRate:calc.gstRate,gstAmount:calc.gstAmount,totalAmount:calc.totalAmount,upiId,upiName,transactionNote,upiUri});
  }
  let secret='';
  try{secret=decryptSecret(String(paymentAccount.secret_key_encrypted));}catch{return NextResponse.json({error:'Razorpay secret is not configured correctly.'},{status:503});}
  const razorpayRes=await fetch('https://api.razorpay.com/v1/orders',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Basic '+Buffer.from(String(paymentAccount.key_id)+':'+secret).toString('base64')},
    body:JSON.stringify({amount:Math.round(calc.totalAmount*100),currency:'INR',receipt:String(saved.id),notes:{lola_order_id:String(saved.id)}})
  });
  const razorpay=await razorpayRes.json().catch(()=>null);
  if(!razorpayRes.ok||!razorpay?.id){
    await db.from('orders').delete().eq('id',saved.id);
    return NextResponse.json({error:razorpay?.error?.description||'Could not create the card payment order.'},{status:502});
  }
  await db.from('orders').update({payment_gateway_order_id:razorpay.id,razorpay_order_id:razorpay.id}).eq('id',saved.id);
  return NextResponse.json({orderRecordId:saved.id,method:'card',razorpayOrderId:razorpay.id,keyId:paymentAccount.key_id,subtotal:calc.subtotal,discountAmount:calc.discountAmount,couponCode,shippingFee:calc.shippingFee,platformFee:calc.platformFee,gstRate:calc.gstRate,gstAmount:calc.gstAmount,totalAmount:calc.totalAmount});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to create your order. Please try again.'},{status:500});}
}
