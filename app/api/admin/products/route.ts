import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('products').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({products:data ?? []});
}

export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const body=await request.json();
  const name=String(body.name ?? '').trim();
  const slug=String(body.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''));
  if(!name || !slug) return NextResponse.json({error:'Name is required'},{status:400});
  const payload={name,slug,price:Number(body.price ?? 0),mrp:Number(body.mrp ?? 0),rating:Number(body.rating ?? 0),reviews:Number(body.reviews ?? 0),description:String(body.description ?? ''),image_url:String(body.image_url ?? ''),amazon_url:String(body.amazon_url ?? ''),flipkart_url:String(body.flipkart_url ?? ''),featured:Boolean(body.featured ?? true),active:Boolean(body.active ?? true),sort_order:Number(body.sort_order ?? 0)};
  const {data,error}=await db.from('products').insert(payload).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({product:data},{status:201});
}
