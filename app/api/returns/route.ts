import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const REASONS = ['Size / fit','Changed my mind','Damaged / defective','Wrong item received','Other'] as const;
const ACTIVE_STATUSES = ['requested','approved','pickup_scheduled','received','refund_pending'];

function cleanPhone(value:string){return String(value||'').replace(/\\D/g,'').slice(-15);}

export async function GET(request:Request){
  const {searchParams}=new URL(request.url);
  const orderId=String(searchParams.get('orderId')||'').trim();
  const phone=cleanPhone(searchParams.get('phone')||'');
  if(!orderId||!phone)return NextResponse.json({error:'Order number and phone number are required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Return service is not configured.'},{status:503});
  const {data:order,error}=await db.from('orders').select('id,customer_name,customer_phone,status,total_amount,created_at,paid_at').eq('id',orderId).maybeSingle();
  if(error||!order)return NextResponse.json({error:'We could not find that order.'},{status:404});
  if(cleanPhone(order.customer_phone)!==phone)return NextResponse.json({error:'The phone number does not match this order.'},{status:403});
  const {data:requestRow}=await db.from('return_requests').select('id,order_id,reason,details,status,admin_note,refund_amount,refund_status,refund_method,refund_reference,requested_at,resolved_at,refunded_at').eq('order_id',orderId).order('requested_at',{ascending:false}).limit(1).maybeSingle();
  return NextResponse.json({order,request:requestRow||null});
}

export async function POST(request:Request){
  try{
    const body=await request.json();
    const orderId=String(body.orderId||'').trim();
    const phone=cleanPhone(body.phone||'');
    const reason=String(body.reason||'').trim();
    const details=String(body.details||'').trim().slice(0,1500);
    if(!orderId||!phone||!reason)return NextResponse.json({error:'Please enter your order number, phone number and return reason.'},{status:400});
    if(!REASONS.includes(reason as typeof REASONS[number]))return NextResponse.json({error:'Please choose a valid return reason.'},{status:400});
    const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Return service is not configured.'},{status:503});
    const {data:order,error:orderError}=await db.from('orders').select('id,status,total_amount,customer_id,customer_name,customer_phone,customer_email,paid_at').eq('id',orderId).maybeSingle();
    if(orderError||!order)return NextResponse.json({error:'We could not find that order.'},{status:404});
    if(cleanPhone(order.customer_phone)!==phone)return NextResponse.json({error:'The phone number does not match this order.'},{status:403});
    if(order.status!=='paid')return NextResponse.json({error:'Returns can be requested after the order has been payment-verified.'},{status:400});
    const {data:existing}=await db.from('return_requests').select('id,status').eq('order_id',orderId).order('requested_at',{ascending:false}).limit(1).maybeSingle();
    if(existing && !['rejected','cancelled'].includes(existing.status))return NextResponse.json({error:'A return request already exists for this order.',requestId:existing.id,status:existing.status},{status:409});
    const {data:created,error}=await db.from('return_requests').insert({
      order_id:order.id,customer_id:order.customer_id,customer_name:order.customer_name,customer_phone:order.customer_phone,
      customer_email:order.customer_email||'',reason,details,status:'requested',requested_at:new Date().toISOString()
    }).select('id,order_id,reason,details,status,refund_status,requested_at').single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    await db.from('orders').update({return_status:'requested',return_requested_at:new Date().toISOString(),refund_status:'not_requested'}).eq('id',order.id);
    return NextResponse.json({ok:true,request:created});
  }catch{return NextResponse.json({error:'Could not submit your return request.'},{status:500});}
}

export const runtime='nodejs';
