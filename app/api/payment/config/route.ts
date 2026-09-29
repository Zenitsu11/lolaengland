import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(){
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:'Payment configuration is unavailable.'},{status:503});
  const [{data:settings,error:settingsError},{data:accounts,error:accountsError}]=await Promise.all([
    db.from('store_settings').select('brand_name,upi_enabled,card_enabled,cod_enabled,cod_fee').eq('id',true).single(),
    db.from('payment_accounts').select('id,provider,upi_id,key_id,secret_key_encrypted,active').eq('active',true).order('sort_order').order('created_at')
  ]);
  if(settingsError) return NextResponse.json({error:settingsError.message},{status:500});
  if(accountsError) return NextResponse.json({error:accountsError.message},{status:500});
  const razorpay=accounts?.find((a:any)=>a.provider==='razorpay'&&a.active&&a.key_id&&a.secret_key_encrypted);
  const upi=accounts?.find((a:any)=>a.upi_id&&a.active);
  return NextResponse.json({
    upiEnabled:Boolean(settings?.upi_enabled&&upi?.upi_id),
    upiId:upi?.upi_id||'',
    upiName:settings?.brand_name||'LOLA ENGLAND',
    cardEnabled:Boolean(settings?.card_enabled&&razorpay?.id),
    codEnabled:Boolean(settings?.cod_enabled),
    codFee:Number(settings?.cod_fee||0)
  },{headers:{'Cache-Control':'no-store'}});
}
