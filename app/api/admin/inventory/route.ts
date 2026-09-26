import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('product_inventory').select('*, products(id,name,image_url,price,active)').order('updated_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({inventory:data||[]});
}
export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.product_id) return NextResponse.json({error:'Product ID required.'},{status:400});
  const stock=Math.max(0,Math.floor(Number(body.stock_qty)||0));
  const threshold=Math.max(0,Math.floor(Number(body.low_stock_threshold)||0));
  const reserved=Math.max(0,Math.floor(Number(body.reserved_qty)||0));
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('product_inventory').upsert({product_id:body.product_id,stock_qty:stock,reserved_qty:reserved,low_stock_threshold:threshold,track_inventory:body.track_inventory!==false}).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({inventory:data});
}