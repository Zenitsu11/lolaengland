import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export const runtime='nodejs';

const imageTypes=new Set(['image/jpeg','image/png','image/webp']);
const videoTypes=new Set(['video/mp4','video/webm','video/quicktime']);

export async function POST(request:Request){
  if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Supabase is not configured'},{status:503});
  const body=await request.json().catch(()=>({}));
  const type=String(body.type||'');
  const size=Number(body.size||0);
  const name=String(body.name||'file');
  const isVideo=videoTypes.has(type);
  const isImage=imageTypes.has(type);
  if(!isVideo&&!isImage) return NextResponse.json({error:'Use JPG, PNG, WebP or MP4/WebM video.'},{status:400});
  const max=isVideo?100*1024*1024:10*1024*1024;
  if(!Number.isFinite(size)||size<=0||size>max) return NextResponse.json({error:isVideo?'Video must be 100 MB or smaller.':'Image must be 10 MB or smaller.'},{status:400});
  const ext=type==='image/png'?'png':type==='image/webp'?'webp':type==='video/mp4'?'mp4':type==='video/webm'?'webm':type==='video/quicktime'?'mov':'jpg';
  const safe=name.replace(/[^a-zA-Z0-9._-]/g,'-').slice(-80);
  const path='products/'+crypto.randomUUID()+'-'+safe.replace(/\.[^.]+$/,'')+'.'+ext;
  const {data,error}=await db.storage.from('product-images').createSignedUploadUrl(path,{upsert:false});
  if(error||!data) return NextResponse.json({error:error?.message||'Could not create upload URL.'},{status:500});
  const {data:publicData}=db.storage.from('product-images').getPublicUrl(path);
  return NextResponse.json({path,token:data.token,url:publicData.publicUrl});
}
