import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs';

export async function POST(request:Request){
 try{
  const {orderRecordId}=await request.json();
  if(!orderRecordId)return NextResponse.json({error:'Order ID is required.'},{status:400});
  const db=getSupabaseAdmin();
  if(!db)return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const {data:order,error:readError}=await db.from('orders').select('id,status').eq('id',orderRecordId).maybeSingle();
  if(readError||!order)return NextResponse.json({error:'Order not found.'},{status:404});
  if(order.status==='payment_submitted'||order.status==='paid')return NextResponse.json({ok:true,status:order.status});
  if(order.status!=='awaiting_payment')return NextResponse.json({error:'This order is no longer awaiting payment.'},{status:409});
  const {data:updated,error}=await db.from('orders').update({status:'payment_submitted'}).eq('id',orderRecordId).eq('status','awaiting_payment').select('id,status').maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:500});
  if(!updated)return NextResponse.json({ok:true,status:'payment_submitted'});
  return NextResponse.json({ok:true,status:updated.status});
 }catch{return NextResponse.json({error:'Could not submit order.'},{status:500});}
}
