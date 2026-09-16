import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {id}=await params;
  const body=await request.json();
  const allowed=['name','slug','price','mrp','rating','reviews','description','image_url','amazon_url','flipkart_url','featured','active','sort_order'];
  const payload=Object.fromEntries(Object.entries(body).filter(([key])=>allowed.includes(key)));
  for(const key of ['price','mrp','rating','reviews','sort_order']) if(key in payload) payload[key]=Number(payload[key]);
  for(const key of ['featured','active']) if(key in payload) payload[key]=Boolean(payload[key]);
  const {data,error}=await db.from('products').update(payload).eq('id',id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({product:data});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {id}=await params;
  const {error}=await db.from('products').delete().eq('id',id);
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}
