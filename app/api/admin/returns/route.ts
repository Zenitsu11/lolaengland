import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

const RETURN_STATUSES=['requested','approved','pickup_scheduled','received','refund_pending','refunded','rejected','cancelled'];
const REFUND_STATUSES=['not_requested','pending','approved','refunded','rejected'];

export async function GET(){
  if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('return_requests').select('id,order_id,customer_id,customer_name,customer_phone,customer_email,reason,details,status,admin_note,refund_amount,refund_status,refund_method,refund_reference,requested_at,resolved_at,refunded_at,orders(id,status,total_amount,subtotal,created_at,paid_at,items)').order('requested_at',{ascending:false}).limit(200);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({returns:data||[]});
}

export async function PUT(request:Request){
  if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const id=String(body.id||'');
  if(!id)return NextResponse.json({error:'Return request ID is required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data:current,error:readError}=await db.from('return_requests').select('id,order_id,status,refund_status,orders(total_amount)').eq('id',id).single();
  if(readError||!current)return NextResponse.json({error:'Return request not found.'},{status:404});
  const status=RETURN_STATUSES.includes(body.status)?body.status:null;
  const refundStatus=REFUND_STATUSES.includes(body.refund_status)?body.refund_status:null;
  if(!status||!refundStatus)return NextResponse.json({error:'Invalid return or refund status.'},{status:400});
  const patch:any={status,refund_status:refundStatus,admin_note:String(body.admin_note||'').trim().slice(0,2000)};
  if(body.refund_amount!==undefined)patch.refund_amount=Math.max(0,Number(body.refund_amount)||0);
  if(refundStatus==='refunded' && Number(patch.refund_amount||0)<=0)return NextResponse.json({error:'Enter a refund amount before marking the refund as completed.'},{status:400});
  const orderTotal=Number((current as any).orders?.total_amount||0);
  if(Number(patch.refund_amount||0)>orderTotal)return NextResponse.json({error:'Refund amount cannot exceed the order total.'},{status:400});
  if(body.refund_method!==undefined)patch.refund_method=String(body.refund_method||'').trim().slice(0,60);
  if(body.refund_reference!==undefined)patch.refund_reference=String(body.refund_reference||'').trim().slice(0,120);
  if(['rejected','cancelled','refunded'].includes(status))patch.resolved_at=new Date().toISOString();
  if(refundStatus==='refunded')patch.refunded_at=new Date().toISOString();
  const {data, error}=await db.from('return_requests').update(patch).eq('id',id).select('*').single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  const orderPatch:any={return_status:status,refund_status:refundStatus};
  if(patch.refund_amount!==undefined)orderPatch.refund_amount=patch.refund_amount;
  if(patch.refund_method!==undefined)orderPatch.refund_method=patch.refund_method;
  if(patch.refund_reference!==undefined)orderPatch.refund_reference=patch.refund_reference;
  if(refundStatus==='refunded'){orderPatch.refunded_at=patch.refunded_at;orderPatch.return_status='refunded';}
  await db.from('orders').update(orderPatch).eq('id',current.order_id);
  return NextResponse.json({return:data});
}

export const runtime='nodejs';
