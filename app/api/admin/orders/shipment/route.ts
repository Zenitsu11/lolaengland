import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function PUT(request:Request){
  try{
    if(!(await isAdminRequest())) return NextResponse.json({error:'Unauthorized.'},{status:401});
    const body=await request.json();
    const {id,courier_name,awb_number,tracking_url,shipment_status}=body||{};
    if(typeof id!=='string'||!id.trim()) return NextResponse.json({error:'Order id is required.'},{status:400});
    const allowed=['unfulfilled','processing','shipped','delivered','cancelled'];
    if(shipment_status && !allowed.includes(shipment_status)) return NextResponse.json({error:'Invalid shipment status.'},{status:400});
    const url=tracking_url==null?'':String(tracking_url).trim();
    if(url){try{const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol)) throw new Error();}catch{return NextResponse.json({error:'Invalid tracking URL.'},{status:400});}}
    const db=getSupabaseAdmin();
    if(!db) throw new Error('Server configuration is missing.');
    const update:any={courier_name:String(courier_name||'').trim().slice(0,120)||null,awb_number:String(awb_number||'').trim().slice(0,120)||null,tracking_url:url.slice(0,1000)||null,shipment_status:shipment_status||'unfulfilled'};
    const now=new Date().toISOString();
    if(update.shipment_status==='shipped') update.shipped_at=now;
    if(update.shipment_status==='delivered') update.delivered_at=now;
    const {data,error}=await db.from('orders').update(update).eq('id',id.trim()).select('id,shipment_status,courier_name,awb_number,tracking_url,shipped_at,delivered_at').single();
    if(error) throw error;
    return NextResponse.json({order:data});
  }catch(error){
    console.error('shipment update failed',error);
    return NextResponse.json({error:'Could not update shipment.'},{status:500});
  }
}
