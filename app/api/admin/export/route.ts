import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const [customers,orders,products,inventory,newsletter,returns]=await Promise.all([
  db.from('customers').select('id,name,phone,email,shipping_address,total_orders,total_spent,last_order_at,created_at').order('created_at',{ascending:false}).limit(5000),
  db.from('orders').select('id,status,customer_name,customer_phone,customer_email,shipping_address,subtotal,shipping_fee,platform_fee,discount_amount,gst_amount,total_amount,coupon_code,upi_transaction_id,return_status,refund_status,refund_amount,refund_reference,refund_method,refunded_at,return_requested_at,created_at,paid_at').order('created_at',{ascending:false}).limit(5000),
  db.from('products').select('id,name,price,mrp,active,image_url').order('created_at',{ascending:false}).limit(5000),
  db.from('product_inventory').select('product_id,stock_qty,reserved_qty,low_stock_threshold,track_inventory,products(name)').limit(5000),
  db.from('newsletter_subscribers').select('id,email,source,subscribed_at,active').order('subscribed_at',{ascending:false}).limit(5000),
  db.from('return_requests').select('id,order_id,customer_name,customer_phone,customer_email,reason,details,status,admin_note,refund_amount,refund_status,refund_method,refund_reference,requested_at,resolved_at,refunded_at').order('requested_at',{ascending:false}).limit(5000)
 ]);
 const error=customers.error||orders.error||products.error||inventory.error||newsletter.error||returns.error;
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({customers:customers.data||[],orders:orders.data||[],products:products.data||[],inventory:inventory.data||[],newsletter:newsletter.data||[],returns:returns.data||[],generatedAt:new Date().toISOString()});
}