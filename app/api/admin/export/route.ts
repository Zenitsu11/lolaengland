import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const [customers,orders,products,inventory,newsletter]=await Promise.all([
  db.from('customers').select('id,name,phone,email,shipping_address,total_orders,total_spent,last_order_at,created_at').order('created_at',{ascending:false}).limit(5000),
  db.from('orders').select('id,status,customer_name,customer_phone,customer_email,shipping_address,subtotal,shipping_fee,platform_fee,discount_amount,gst_amount,total_amount,coupon_code,upi_transaction_id,created_at,paid_at').order('created_at',{ascending:false}).limit(5000),
  db.from('products').select('id,name,price,mrp,active,image_url').order('created_at',{ascending:false}).limit(5000),
  db.from('product_inventory').select('product_id,stock_qty,reserved_qty,low_stock_threshold,track_inventory,products(name)').limit(5000),
  db.from('newsletter_subscribers').select('id,email,source,subscribed_at,active').order('subscribed_at',{ascending:false}).limit(5000)
 ]);
 const error=customers.error||orders.error||products.error||inventory.error||newsletter.error;
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({customers:customers.data||[],orders:orders.data||[],products:products.data||[],inventory:inventory.data||[],newsletter:newsletter.data||[],generatedAt:new Date().toISOString()});
}