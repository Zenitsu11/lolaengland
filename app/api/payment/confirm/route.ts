import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
export const runtime='nodejs';
export async function POST(request:Request){
 try{
  const {orderRecordId}=await request.json(); if(!orderRecordId)return NextResponse.json({error:'Order ID is required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Order backend is not configured.'},{status:503});
  const {error}=await db.from('orders').update({status:'payment_submitted'}).eq('id',orderRecordId).in('status',['awaiting_payment','payment_submitted']);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Could not submit order.'},{status:500});}
}
