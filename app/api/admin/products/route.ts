import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
  const price=Number(body.price ?? 0), mrp=Number(body.mrp ?? 0), rating=Number(body.rating ?? 0), reviews=Number(body.reviews ?? 0), sort_order=Number(body.sort_order ?? 0);
  if(!Number.isFinite(price)||!Number.isFinite(mrp)||!Number.isFinite(rating)||!Number.isFinite(reviews)||!Number.isFinite(sort_order)) return NextResponse.json({error:'Numeric fields contain an invalid value'},{status:400});
  if(price<0||mrp<price||rating<0||rating>5||reviews<0) return NextResponse.json({error:'Check price, MRP, rating and reviews values.'},{status:400});
  const payload={name,slug,price,mrp,rating,reviews,description:String(body.description ?? ''),image_url:String(body.image_url ?? ''),amazon_url:String(body.amazon_url ?? ''),flipkart_url:String(body.flipkart_url ?? ''),featured:Boolean(body.featured ?? true),active:Boolean(body.active ?? true),sort_order};
  const {data,error}=await db.from('products').insert(payload).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  revalidatePath('/');
  return NextResponse.json({product:data},{status:201});
}
