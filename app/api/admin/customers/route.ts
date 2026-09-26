import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET(){
 if(!(await isAdminRequest()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=getSupabaseAdmin();if(!db)return NextResponse.json({error:'Supabase is not configured'},{status:503});
 const {data,error}=await db.from('customers').select('*').order('last_order_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false}).limit(1000);
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({customers:data||[]});
}