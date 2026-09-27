import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export const runtime='nodejs';

function clean(body:any){
  return {
    section:String(body.section||'').trim().slice(0,80),
    slot_key:String(body.slot_key||'').trim().slice(0,80),
    title:String(body.title||'').trim().slice(0,160),
    url:String(body.url||'').trim().slice(0,1000),
    alt_text:String(body.alt_text||'').trim().slice(0,300),
    href:String(body.href||'').trim().slice(0,500),
    active:body.active!==false,
    sort_order:Number.isFinite(Number(body.sort_order))?Number(body.sort_order):0,
  };
}
function invalidate(){
  revalidatePath('/','layout');
  revalidatePath('/new-in');
  revalidatePath('/t-shirts');
  revalidatePath('/lookbook');
  revalidatePath('/our-story');
  revalidatePath('/join-lola');
}
export async function GET(){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('site_media').select('*').order('section',{ascending:true}).order('sort_order',{ascending:true});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({media:data||[]});
}
export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const body=clean(await request.json().catch(()=>({})));
  if(!body.section||!body.slot_key||!body.url) return NextResponse.json({error:'Section, slot key and image URL are required.'},{status:400});
  const {data,error}=await db.from('site_media').insert(body).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  invalidate();
  return NextResponse.json({media:data});
}
export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const raw=await request.json().catch(()=>({}));
  const id=String(raw.id||'');
  if(!id) return NextResponse.json({error:'Media id is required.'},{status:400});
  const body=clean(raw);
  delete (body as any).section;
  delete (body as any).slot_key;
  const {data,error}=await db.from('site_media').update(body).eq('id',id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  invalidate();
  return NextResponse.json({media:data});
}
export async function DELETE(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const raw=await request.json().catch(()=>({}));
  const id=String(raw.id||'');
  if(!id) return NextResponse.json({error:'Media id is required.'},{status:400});
  const {error}=await db.from('site_media').delete().eq('id',id);
  if(error) return NextResponse.json({error:error.message},{status:400});
  invalidate();
  return NextResponse.json({ok:true});
}
