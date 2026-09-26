import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const {data,error}=await db.from('orders').select('id,status,amount,total_amount,subtotal,shipping_fee,platform_fee,gst_rate,gst_amount,coupon_code,discount_amount,customer_name,customer_phone,customer_email,shipping_address,items,upi_transaction_id,created_at,paid_at').order('created_at',{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({orders:data||[]});
}

export async function PUT(request:Request){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await request.json();if(!body.id)return NextResponse.json({error:'Order ID required.'},{status:400});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const {data:current,error:readError}=await db.from('orders').select('id,status,items,coupon_code,paid_at,customer_id,total_amount').eq('id',body.id).single();
 if(readError||!current)return NextResponse.json({error:'Order not found.'},{status:404});
 const status=['payment_submitted','paid','cancelled','awaiting_payment'].includes(body.status)?body.status:null;
 if(!status)return NextResponse.json({error:'Invalid order status.'},{status:400});
 const patch:any={status};
 if(body.utr!==undefined)patch.upi_transaction_id=String(body.utr||'').trim().slice(0,100);
 if(status==='paid')patch.paid_at=current.paid_at||new Date().toISOString();
 const {data,error}=await db.from('orders').update(patch).eq('id',body.id).select('id,status,upi_transaction_id,paid_at').single();
 if(error)return NextResponse.json({error:error.message},{status:400});

 if(status==='paid'&&current.status!=='paid'){
   if(current.coupon_code){
     const {data:coupon}=await db.from('coupons').select('id,used_count').eq('code',current.coupon_code).maybeSingle();
     if(coupon) await db.from('coupons').update({used_count:Number(coupon.used_count||0)+1}).eq('id',coupon.id);
   }
   if(current.customer_id){ const {data:customer}=await db.from('customers').select('total_spent').eq('id',current.customer_id).maybeSingle(); if(customer) await db.from('customers').update({total_spent:Number(customer.total_spent||0)+Number(current.total_amount||0),last_order_at:new Date().toISOString()}).eq('id',current.customer_id); }
   const items=Array.isArray(current.items)?current.items:[];
   for(const item of items){
     const productId=String(item.id||''); const qty=Math.max(1,Math.min(20,Number(item.quantity)||1));
     if(!productId)continue;
     const {data:inv}=await db.from('product_inventory').select('product_id,stock_qty,reserved_qty,track_inventory').eq('product_id',productId).maybeSingle();
     if(inv?.track_inventory) await db.from('product_inventory').update({stock_qty:Math.max(0,Number(inv.stock_qty)-qty),updated_at:new Date().toISOString()}).eq('product_id',productId);
   }
 }
 return NextResponse.json({order:data});
}
