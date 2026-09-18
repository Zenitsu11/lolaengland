import { NextResponse } from 'next/server';

export async function POST(request: Request){
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!expected || !secret || typeof password !== 'string' || password !== expected) return NextResponse.json({ok:false},{status:401});
    const response = NextResponse.json({ok:true});
    response.cookies.set('lola_admin_session',secret,{httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:'lax',path:'/',maxAge:60*60*24*7});
    return response;
  } catch { return NextResponse.json({ok:false},{status:400}); }
}
