import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs';
export async function POST(request:Request){
 try{
  const body=await request.json(); const items=Array.isArray(body.items)?body.items:[]; const customer=body.customer||{};
  if(!items.length||!customer.name||!customer.phone||!customer.address) return NextResponse.json({error:'Please complete your cart and delivery details.'},{status:400});
  const upiId=process.env.LOLA_UPI_ID||''; const upiName=process.env.LOLA_UPI_NAME||'LOLA ENGLAND';
  if(!upiId) return NextResponse.json({error:'UPI payment is not configured yet. Add LOLA_UPI_ID in the server environment.'},{status:503});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const ids=items.map((i:any)=>String(i.id)).filter(Boolean);
  const {data:products,error:productError}=await db.from('products').select('id,name,price,image_url').in('id',ids).eq('active',true);
  if(productError||!products?.length) return NextResponse.json({error:'One or more products are no longer available.'},{status:400});
  const safeItems=items.map((i:any)=>{const product=products.find((p:any)=>String(p.id)===String(i.id));const size=String(i.size||'').toUpperCase();return product&&['XS','S','M','L','XL','XXL','3XL'].includes(size)?{id:String(product.id),name:String(product.name).slice(0,200),price:Number(product.price),quantity:Math.max(1,Math.min(20,Number(i.quantity)||1)),size}:null;}).filter(Boolean);
  if(safeItems.length!==ids.length) return NextResponse.json({error:'Please choose a valid size for every product in your bag.'},{status:400});
  const amount=safeItems.reduce((sum:number,i:any)=>sum+i.price*i.quantity,0); if(!Number.isFinite(amount)||amount<=0)return NextResponse.json({error:'Invalid order amount.'},{status:400});
  const {data:saved,error}=await db.from('orders').insert({amount,currency:'INR',status:'awaiting_payment',payment_method:'upi_qr',customer_name:String(customer.name).slice(0,120),customer_phone:String(customer.phone).slice(0,30),customer_email:String(customer.email||'').slice(0,160),shipping_address:String(customer.address).slice(0,1000),items:safeItems}).select('id').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  const transactionNote='LOLA-'+String(saved.id).slice(0,8).toUpperCase();
  const upiUri=`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  return NextResponse.json({orderRecordId:saved.id,amount,upiId,upiName,transactionNote,upiUri});
 }catch{return NextResponse.json({error:'Unable to create your order. Please try again.'},{status:500});}
}
