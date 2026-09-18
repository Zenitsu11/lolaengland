import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
  const price=payload.price as number|undefined, mrp=payload.mrp as number|undefined, rating=payload.rating as number|undefined, reviews=payload.reviews as number|undefined;
  if(Object.values(payload).some(v=>typeof v==='number'&&!Number.isFinite(v))) return NextResponse.json({error:'Numeric fields contain an invalid value'},{status:400});
  if(price!==undefined&&price<0||mrp!==undefined&&mrp<0||rating!==undefined&&(rating<0||rating>5)||reviews!==undefined&&reviews<0) return NextResponse.json({error:'Check price, MRP, rating and reviews values.'},{status:400});
  if(price!==undefined&&mrp!==undefined&&mrp<price) return NextResponse.json({error:'MRP must be equal to or higher than price.'},{status:400});
  const {data,error}=await db.from('products').update(payload).eq('id',id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  revalidatePath('/');
  revalidatePath('/collection/all');
  return NextResponse.json({product:data});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {id}=await params;
  const {error}=await db.from('products').delete().eq('id',id);
  if(error) return NextResponse.json({error:error.message},{status:400});
  revalidatePath('/');
  revalidatePath('/collection/all');
  return NextResponse.json({ok:true});
}
