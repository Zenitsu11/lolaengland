import {NextResponse} from 'next/server';
import {getSupabaseAdmin} from '@/lib/supabase-admin';
export const runtime='nodejs';
export async function GET(request:Request){
 try{
  const url=new URL(request.url);const id=url.searchParams.get('order')?.trim()||'';const phone=url.searchParams.get('phone')?.replace(/\D/g,'').slice(-10)||'';
  if(!id||phone.length<10)return NextResponse.json({error:'Enter your order number and 10-digit phone number.'},{status:400});
  const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Order tracking is temporarily unavailable.'},{status:503});
  const {data,error}=await db.from('orders').select('id,status,total_amount,payment_method,created_at,paid_at,items,shipping_address,customer_name,customer_phone,shipment_status,courier_name,awb_number,tracking_url,shipped_at,delivered_at').eq('id',id).eq('customer_phone',phone).maybeSingle();
  if(error||!data)return NextResponse.json({error:'We could not find an order matching those details.'},{status:404});
  return NextResponse.json({order:{id:data.id,status:data.status,totalAmount:Number(data.total_amount||0),paymentMethod:data.payment_method,createdAt:data.created_at,paidAt:data.paid_at,items:Array.isArray(data.items)?data.items:[],customerName:data.customer_name,shippingAddress:data.shipping_address,shipmentStatus:data.shipment_status||'unfulfilled',courierName:data.courier_name,awbNumber:data.awb_number,trackingUrl:data.tracking_url,shippedAt:data.shipped_at,deliveredAt:data.delivered_at}});
 }catch{return NextResponse.json({error:'Unable to load order status.'},{status:500});}
}