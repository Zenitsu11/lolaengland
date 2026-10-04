import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('Supabase server configuration is missing.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function PUT(request:Request){
  try{
    const body=await request.json();
    const {id,courier_name,awb_number,tracking_url,shipment_status}=body||{};
    if(!id) return NextResponse.json({error:'Order id is required.'},{status:400});
    const allowed=['unfulfilled','processing','shipped','delivered','cancelled'];
    if(shipment_status && !allowed.includes(shipment_status)) return NextResponse.json({error:'Invalid shipment status.'},{status:400});
    const supabase=adminClient();
    const update:any={
      courier_name:String(courier_name||'').trim()||null,
      awb_number:String(awb_number||'').trim()||null,
      tracking_url:String(tracking_url||'').trim()||null,
      shipment_status:shipment_status||'unfulfilled',
    };
    if(update.shipment_status==='shipped') update.shipped_at=new Date().toISOString();
    if(update.shipment_status==='delivered') update.delivered_at=new Date().toISOString();
    const {data,error}=await supabase.from('orders').update(update).eq('id',id).select('id,shipment_status,courier_name,awb_number,tracking_url,shipped_at,delivered_at').single();
    if(error) throw error;
    return NextResponse.json({order:data});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Could not update shipment.'},{status:500});
  }
}
