import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import './invoice.css';

export const dynamic = 'force-dynamic';

function money(value:any){return `₹${Number(value||0).toFixed(2)}`}
function esc(value:any){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}

export default async function InvoicePage({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{phone?:string}>}){
 const {id}=await params; const {phone}=await searchParams;
 const db=getSupabaseAdmin(); if(!db) notFound();
 const {data:order}=await db.from('orders').select('*').eq('id',id).maybeSingle();
 if(!order || !phone || String(order.customer_phone)!==String(phone).trim()) notFound();
 const {data:settings}=await db.from('store_settings').select('*').eq('id',true).single();
 const items=Array.isArray(order.items)?order.items:[];
 const intraState = settings?.business_state && String(order.shipping_address||'').toLowerCase().includes(String(settings.business_state).toLowerCase());
 const gst=Number(order.gst_amount||0); const half=gst/2;
 return <main className="invoice-page"><section className="invoice-sheet">
  <header className="invoice-header"><div><h1>{esc(settings?.legal_name||settings?.brand_name||'LOLA ENGLAND')}</h1><p>{esc(settings?.business_address||'')}</p><p>{esc(settings?.business_state||'')}{settings?.business_state_code?` (${esc(settings.business_state_code)})`:''}</p>{settings?.gstin&&<p><b>GSTIN:</b> {esc(settings.gstin)}</p>}</div><div className="invoice-title"><strong>TAX INVOICE</strong><span>Invoice No. {esc(order.invoice_number||`LE-${String(order.id).slice(0,8).toUpperCase()}`)}</span><span>Date {new Date(order.created_at).toLocaleDateString('en-IN')}</span></div></header>
  <div className="invoice-parties"><div><b>Billed to</b><strong>{esc(order.customer_name)}</strong><span>{esc(order.customer_phone)}</span><span>{esc(order.customer_email)}</span></div><div><b>Ship to</b><span>{esc(order.shipping_address)}</span></div></div>
  <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.map((item:any,i:number)=><tr key={i}><td>{esc(item.name||item.title||'Product')}{item.size?` · Size ${esc(item.size)}`:''}{item.color?` · ${esc(item.color)}`:''}</td><td>{Number(item.quantity||1)}</td><td>{money(item.price)}</td><td>{money(Number(item.price||0)*Number(item.quantity||1))}</td></tr>)}</tbody></table>
  <div className="invoice-bottom"><div className="invoice-note"><b>Payment method:</b> {esc(order.payment_method)}<br/><b>Order ID:</b> {esc(order.id)}<br/><small>This invoice is generated electronically and does not require a signature.</small></div><div className="invoice-totals"><span>Subtotal <b>{money(order.subtotal)}</b></span><span>Discount <b>-{money(order.discount_amount)}</b></span><span>Shipping <b>{money(order.shipping_fee)}</b></span><span>Platform fee <b>{money(order.platform_fee)}</b></span>{intraState?<><span>CGST ({Number(order.gst_rate||0)/2}%) <b>{money(half)}</b></span><span>SGST ({Number(order.gst_rate||0)/2}%) <b>{money(half)}</b></span></>:<span>GST ({Number(order.gst_rate||0)}%) <b>{money(gst)}</b></span>}<strong>Total <b>{money(order.total_amount||order.amount)}</b></strong></div></div>
  <button className="print-button" onClick={()=>{}} type="button">Print / Save as PDF</button>
  <script dangerouslySetInnerHTML={{__html:`document.querySelector('.print-button')?.addEventListener('click',()=>window.print())`}} />
 </section></main>
}
