import { NextResponse } from 'next/server';
export const runtime='nodejs';

const PIN=/^[1-9][0-9]{5}$/;

export async function GET(request:Request){
  const pin=new URL(request.url).searchParams.get('pincode')?.trim()||'';
  if(!PIN.test(pin)) return NextResponse.json({serviceable:false,error:'Enter a valid 6-digit Indian pincode.'},{status:400});
  try{
    const res=await fetch(`https://api.postalpincode.in/pincode/${pin}`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!res.ok) throw new Error('Postal lookup failed');
    const payload=await res.json();
    const result=Array.isArray(payload)?payload[0]:null;
    const offices=Array.isArray(result?.PostOffice)?result.PostOffice:[];
    if(result?.Status!=='Success'||!offices.length) return NextResponse.json({serviceable:false,error:'This pincode could not be found. Please check the number.'},{status:404});
    const office=offices[0];
    // This is a postal-address validation/estimate, not courier-provider serviceability.
    // Actual courier integration can replace this route later without changing checkout UI.
    return NextResponse.json({
      serviceable:true,pincode:pin,city:String(office.District||office.Block||''),state:String(office.State||''),region:String(office.Region||''),
      etaMinBusinessDays:3,etaMaxBusinessDays:7,
      message:'Delivery available to this pincode. Estimated delivery: 3–7 business days.'
    },{headers:{'Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'}});
  }catch{
    return NextResponse.json({serviceable:false,error:'We could not verify this pincode right now. Please try again.'},{status:503});
  }
}
