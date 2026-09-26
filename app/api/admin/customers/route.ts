import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('orders').select('customer_name,customer_phone,customer_email,shipping_address,amount,total_amount,status,created_at').order('created_at',{ascending:false}).limit(500);
  if(error) return NextResponse.json({error:error.message},{status:500});
  const map=new Map<string,any>();
  for(const o of data||[]){
    const key=(o.customer_phone||o.customer_email||o.customer_name||'unknown').toLowerCase();
    const existing=map.get(key);
    const amount=Number(o.total_amount??o.amount??0);
    if(existing){ existing.orders+=1; existing.spent+=amount; if(new Date(o.created_at)>new Date(existing.last_order_at)) existing.last_order_at=o.created_at; }
    else map.set(key,{key,name:o.customer_name,phone:o.customer_phone,email:o.customer_email,address:o.shipping_address,orders:1,spent:amount,last_order_at:o.created_at});
  }
  return NextResponse.json({customers:Array.from(map.values()).sort((a,b)=>b.spent-a.spent)});
}