import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs';
export async function POST(request:Request){
 try{
  const body=await request.json(); const {orderRecordId,utr}=body;
  if(!orderRecordId||!utr||String(utr).trim().length<6)return NextResponse.json({error:'Please enter the UTR / transaction ID from your UPI payment.'},{status:400});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const {data:row,error:readError}=await db.from('orders').select('id,status').eq('id',orderRecordId).single();
  if(readError||!row)return NextResponse.json({error:'Order not found.'},{status:404});
  if(row.status==='paid'||row.status==='payment_submitted')return NextResponse.json({ok:true});
  const {error}=await db.from('orders').update({status:'payment_submitted',upi_transaction_id:String(utr).trim().slice(0,100)}).eq('id',orderRecordId);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Could not submit payment details.'},{status:500});}
}
