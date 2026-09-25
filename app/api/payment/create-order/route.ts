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
  const [{data:products,error:productError},{data:settings,error:settingsError}]=await Promise.all([
   db.from('products').select('id,name,price,image_url').in('id',items.map((i:any)=>String(i.id)).filter(Boolean)).eq('active',true),
   db.from('store_settings').select('shipping_fee,free_shipping_threshold,platform_fee,gst_rate').eq('id',true).single()
  ]);
  if(productError||!products?.length)return NextResponse.json({error:'One or more products are no longer available.'},{status:400});
  if(settingsError||!settings)return NextResponse.json({error:'Checkout charges are not configured.'},{status:503});
  const safeItems=items.map((i:any)=>{const product=products.find((p:any)=>String(p.id)===String(i.id));const size=String(i.size||'').toUpperCase();return product&&['XS','S','M','L','XL','XXL','3XL'].includes(size)?{id:String(product.id),name:String(product.name).slice(0,200),price:Number(product.price),quantity:Math.max(1,Math.min(20,Number(i.quantity)||1)),size}:null;}).filter(Boolean);
  if(safeItems.length!==items.length)return NextResponse.json({error:'Please choose a valid size for every product in your bag.'},{status:400});
  const subtotal=Math.round(safeItems.reduce((sum:number,i:any)=>sum+i.price*i.quantity,0)*100)/100;
  const shippingFee=subtotal>=Number(settings.free_shipping_threshold)?0:Number(settings.shipping_fee);
  const platformFee=Number(settings.platform_fee);
  const gstRate=Number(settings.gst_rate);
  const taxable=Math.round((subtotal+shippingFee+platformFee)*100)/100;
  const gstAmount=Math.round(taxable*gstRate)/100;
  const totalAmount=Math.round((taxable+gstAmount)*100)/100;
  if(!Number.isFinite(totalAmount)||totalAmount<=0)return NextResponse.json({error:'Invalid order amount.'},{status:400});
  const {data:saved,error}=await db.from('orders').insert({
   amount:totalAmount,total_amount:totalAmount,subtotal,shipping_fee:shippingFee,platform_fee:platformFee,gst_rate:gstRate,gst_amount:gstAmount,
   currency:'INR',status:'awaiting_payment',payment_method:'upi_qr',
   customer_name:String(customer.name).slice(0,120),customer_phone:String(customer.phone).slice(0,30),customer_email:String(customer.email||'').slice(0,160),
   shipping_address:String(customer.address).slice(0,1000),items:safeItems
  }).select('id').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  const transactionNote='LOLA-'+String(saved.id).slice(0,8).toUpperCase();
  const upiUri=`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  return NextResponse.json({orderRecordId:saved.id,subtotal,shippingFee,platformFee,gstRate,gstAmount,totalAmount,upiId,upiName,transactionNote,upiUri});
 }catch{return NextResponse.json({error:'Unable to create your order. Please try again.'},{status:500});}
}
