import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('categories').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({categories:data||[]});
}
export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const name=String(body.name||'').trim();
  const slug=String(body.slug||name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')).trim();
  if(!name||!slug) return NextResponse.json({error:'Category name is required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('categories').insert({name,slug,description:String(body.description||''),active:body.active!==false,sort_order:Number(body.sort_order||0)}).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({category:data},{status:201});
}
export async function PUT(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id) return NextResponse.json({error:'Category ID required.'},{status:400});
  const patch={name:String(body.name||'').trim(),slug:String(body.slug||'').trim(),description:String(body.description||''),active:body.active!==false,sort_order:Number(body.sort_order||0)};
  if(!patch.name||!patch.slug) return NextResponse.json({error:'Name and slug are required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {data,error}=await db.from('categories').update(patch).eq('id',body.id).select('*').single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({category:data});
}
export async function DELETE(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); if(!body.id) return NextResponse.json({error:'Category ID required.'},{status:400});
  const db=getSupabaseAdmin(); if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const {error}=await db.from('categories').delete().eq('id',body.id);
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}