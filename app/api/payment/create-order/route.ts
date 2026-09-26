import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs';

export async function POST(request:Request){
 try{
  const body=await request.json(); const items=Array.isArray(body.items)?body.items:[]; const customer=body.customer||{};
  if(!items.length||!customer.name||!customer.phone||!customer.address)return NextResponse.json({error:'Please complete your cart and delivery details.'},{status:400});
  const upiId=process.env.LOLA_UPI_ID||''; const upiName=process.env.LOLA_UPI_NAME||'LOLA ENGLAND';
  if(!upiId)return NextResponse.json({error:'UPI payment is not configured yet. Add LOLA_UPI_ID in Vercel.'},{status:503});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const couponCode=String(body.couponCode||'').trim().toUpperCase();
  const [{data:products,error:productError},{data:settings,error:settingsError},{data:coupon,error:couponError}]=await Promise.all([
   db.from('products').select('id,name,price,image_url').in('id',items.map((i:any)=>String(i.id)).filter(Boolean)).eq('active',true),
   db.from('store_settings').select('shipping_fee,free_shipping_threshold,platform_fee,gst_rate').eq('id',true).single(),
   couponCode?db.from('coupons').select('*').eq('code',couponCode).eq('active',true).maybeSingle():Promise.resolve({data:null,error:null})
  ]);
  if(productError||!products?.length)return NextResponse.json({error:'One or more products are no longer available.'},{status:400});
  if(settingsError||!settings)return NextResponse.json({error:'Checkout charges are not configured.'},{status:503});
  const safeItems=items.map((i:any)=>{const product=products.find((p:any)=>String(p.id)===String(i.id));const size=String(i.size||'').toUpperCase();return product&&['XS','S','M','L','XL','XXL','3XL'].includes(size)?{id:String(product.id),name:String(product.name).slice(0,200),price:Number(product.price),quantity:Math.max(1,Math.min(20,Number(i.quantity)||1)),size}:null;}).filter(Boolean);
  if(safeItems.length!==items.length)return NextResponse.json({error:'Please choose a valid size for every product in your bag.'},{status:400});
  const subtotal=Math.round(safeItems.reduce((sum:number,i:any)=>sum+i.price*i.quantity,0)*100)/100;
  let discountAmount=0;
  if(couponCode){
   if(couponError||!coupon)return NextResponse.json({error:'Invalid or inactive coupon code.'},{status:400});
   const now=Date.now();
   if(coupon.starts_at&&new Date(coupon.starts_at).getTime()>now)return NextResponse.json({error:'This coupon is not active yet.'},{status:400});
   if(coupon.expires_at&&new Date(coupon.expires_at).getTime()<now)return NextResponse.json({error:'This coupon has expired.'},{status:400});
   if(coupon.usage_limit!=null&&Number(coupon.used_count)>=Number(coupon.usage_limit))return NextResponse.json({error:'This coupon has reached its usage limit.'},{status:400});
   if(subtotal<Number(coupon.minimum_order_value||0))return NextResponse.json({error:'This coupon requires a higher order value.'},{status:400});
   discountAmount=coupon.discount_type==='fixed'?Number(coupon.discount_value):subtotal*Number(coupon.discount_value)/100;
   if(coupon.maximum_discount!=null)discountAmount=Math.min(discountAmount,Number(coupon.maximum_discount));
   discountAmount=Math.min(discountAmount,subtotal);
   discountAmount=Math.round(discountAmount*100)/100;
  }
  const discountedSubtotal=Math.max(0,Math.round((subtotal-discountAmount)*100)/100);
  const shippingFee=discountedSubtotal>=Number(settings.free_shipping_threshold)?0:Number(settings.shipping_fee);
  const platformFee=Number(settings.platform_fee);
  const gstRate=Number(settings.gst_rate);
  const taxable=Math.round((discountedSubtotal+shippingFee+platformFee)*100)/100;
  const gstAmount=Math.round(taxable*gstRate)/100;
  const totalAmount=Math.round((taxable+gstAmount)*100)/100;
  if(!Number.isFinite(totalAmount)||totalAmount<=0)return NextResponse.json({error:'Invalid order amount.'},{status:400});
  const {data:saved,error}=await db.from('orders').insert({
   amount:totalAmount,total_amount:totalAmount,subtotal,shipping_fee:shippingFee,platform_fee:platformFee,gst_rate:gstRate,gst_amount:gstAmount,coupon_code:couponCode||null,discount_amount:discountAmount,
   currency:'INR',status:'awaiting_payment',payment_method:'upi_qr',
   customer_name:String(customer.name).slice(0,120),customer_phone:String(customer.phone).slice(0,30),customer_email:String(customer.email||'').slice(0,160),
   shipping_address:String(customer.address).slice(0,1000),items:safeItems
  }).select('id').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  const transactionNote='LOLA-'+String(saved.id).slice(0,8).toUpperCase();
  const upiUri=`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  return NextResponse.json({orderRecordId:saved.id,subtotal,discountAmount,couponCode,shippingFee,platformFee,gstRate,gstAmount,totalAmount,upiId,upiName,transactionNote,upiUri});
 }catch{return NextResponse.json({error:'Unable to create your order. Please try again.'},{status:500});}
}
