import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';
export async function GET(){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const {data,error}=await db.from('orders').select('id,status,amount,total_amount,subtotal,shipping_fee,platform_fee,gst_rate,gst_amount,customer_name,customer_phone,customer_email,shipping_address,items,upi_transaction_id,created_at,paid_at').order('created_at',{ascending:false}).limit(50);
 if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({orders:data||[]});
}
export async function PUT(request:Request){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await request.json();if(!body.id)return NextResponse.json({error:'Order ID required.'},{status:400});
 const status=['payment_submitted','paid','cancelled','awaiting_payment'].includes(body.status)?body.status:null;
 const patch:any={};if(status)patch.status=status;if(body.utr!==undefined)patch.upi_transaction_id=String(body.utr||'').trim().slice(0,100);if(status==='paid')patch.paid_at=new Date().toISOString();
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const {data,error}=await db.from('orders').update(patch).eq('id',body.id).select('id,status,upi_transaction_id,paid_at').single();
 if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({order:data});
}
