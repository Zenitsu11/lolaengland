import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

const STATUSES=['pending','approved','rejected'];

export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('product_reviews').select('id,product_id,customer_id,order_id,rating,title,body,photos,verified_purchase,status,created_at,updated_at,products(id,name,slug)').order('created_at',{ascending:false}).limit(300);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({reviews:data||[]});
}

export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const id=String(body.id||''); const status=String(body.status||'');
  if(!id || !STATUSES.includes(status)) return NextResponse.json({error:'Review ID and valid status are required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('product_reviews').update({status,updated_at:new Date().toISOString()}).eq('id',id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({review:data});
}

export const runtime='nodejs';
