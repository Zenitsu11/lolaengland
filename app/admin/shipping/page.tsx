'use client';

import { useEffect, useState } from 'react';

const statuses=['unfulfilled','processing','shipped','delivered','cancelled'];

type Order={id:string;status?:string;total_amount?:number;created_at?:string;shipment_status?:string;courier_name?:string;awb_number?:string;tracking_url?:string;shipped_at?:string;delivered_at?:string};

export default function AdminShippingPage(){
  const [orders,setOrders]=useState<Order[]>([]);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState<string|null>(null);

  async function load(){
    setLoading(true);
    try{
      const r=await fetch('/api/admin/orders',{cache:'no-store'}); const d=await r.json();
      if(!r.ok) throw new Error(d.error||'Could not load orders.');
      setOrders(d.orders||[]);
    }catch(e){setMessage(e instanceof Error?e.message:'Could not load orders.');}
    finally{setLoading(false);}
  }
  useEffect(()=>{load()},[]);

  function patch(id:string,key:keyof Order,value:string){setOrders(list=>list.map(o=>o.id===id?{...o,[key]:value}:o));}

  async function save(o:Order){
    setSaving(o.id);setMessage('');
    try{
      const r=await fetch('/api/admin/orders/shipment',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:o.id,courier_name:o.courier_name,awb_number:o.awb_number,tracking_url:o.tracking_url,shipment_status:o.shipment_status||'unfulfilled'})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||'Could not save shipment.');
      setOrders(list=>list.map(x=>x.id===o.id?{...x,...d.order}:x));
      setMessage(`Shipment saved for #${o.id.slice(0,8).toUpperCase()}.`);
    }catch(e){setMessage(e instanceof Error?e.message:'Could not save shipment.');}
    finally{setSaving(null)}
  }

  return <main className="ship-page"><div className="ship-shell">
    <header><div><p className="eyebrow">LOLA ENGLAND · ADMIN</p><h1>Shipping & fulfilment</h1><p>Assign courier, AWB and tracking information to each order.</p></div><a href="/admin">← Admin dashboard</a></header>
    {message&&<div className="notice">{message}</div>}
    {loading?<div className="empty">Loading orders…</div>:orders.length===0?<div className="empty">No orders found.</div>:<div className="orders">
      {orders.map(o=><section className="order" key={o.id}>
        <div className="order-top"><div><strong>#{o.id.slice(0,8).toUpperCase()}</strong><span>{o.created_at?new Date(o.created_at).toLocaleString('en-IN'):''}</span></div><b>₹{Number(o.total_amount||0).toLocaleString('en-IN')}</b></div>
        <div className="fields">
          <label>Courier<input value={o.courier_name||''} onChange={e=>patch(o.id,'courier_name',e.target.value)} placeholder="Delhivery" /></label>
          <label>AWB / Tracking number<input value={o.awb_number||''} onChange={e=>patch(o.id,'awb_number',e.target.value)} placeholder="Enter AWB number" /></label>
          <label>Tracking URL<input value={o.tracking_url||''} onChange={e=>patch(o.id,'tracking_url',e.target.value)} placeholder="https://…" /></label>
          <label>Status<select value={o.shipment_status||'unfulfilled'} onChange={e=>patch(o.id,'shipment_status',e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></label>
        </div>
        <div className="order-bottom"><div className="timeline"><span className={(o.shipment_status||'unfulfilled')!=='unfulfilled'?'on':''}>Processing</span><span className={['shipped','delivered'].includes(o.shipment_status||'')?'on':''}>Shipped</span><span className={o.shipment_status==='delivered'?'on':''}>Delivered</span></div><button onClick={()=>save(o)} disabled={saving===o.id}>{saving===o.id?'Saving…':'Save shipment'}</button></div>
      </section>)}
    </div>}
  </div>
  <style jsx>{`body{margin:0}.ship-page{min-height:100vh;background:#f7f6f3;color:#191919;padding:36px 18px 80px}.ship-shell{max-width:1100px;margin:auto}header{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:24px}header h1{font-size:clamp(32px,5vw,52px);margin:0 0 8px}header p{color:#6b6b6b;margin:0}.eyebrow{font-size:11px;letter-spacing:.18em;margin-bottom:8px!important;color:#191919!important}header a{color:#191919;border:1px solid #222;padding:11px 15px;text-decoration:none;white-space:nowrap}.notice{background:#191919;color:#fff;padding:12px 14px;margin-bottom:16px}.orders{display:grid;gap:14px}.order{background:#fff;border:1px solid #e3dfd8;padding:20px}.order-top,.order-bottom{display:flex;justify-content:space-between;gap:18px;align-items:center}.order-top div{display:flex;flex-direction:column;gap:5px}.order-top span{font-size:12px;color:#777}.fields{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.fields label{font-size:12px;color:#666;display:grid;gap:6px}.fields input,.fields select{width:100%;box-sizing:border-box;border:1px solid #d8d4ce;padding:11px;background:#fff;color:#191919}.order-bottom button{border:0;background:#191919;color:#fff;padding:12px 17px;cursor:pointer}.order-bottom button:disabled{opacity:.5}.timeline{display:flex;gap:8px;flex-wrap:wrap}.timeline span{font-size:11px;border:1px solid #ddd;padding:6px 9px;color:#888}.timeline .on{border-color:#191919;color:#191919}.empty{background:#fff;border:1px solid #e3dfd8;padding:30px}@media(max-width:800px){header{display:block}header a{display:inline-block;margin-top:16px}.fields{grid-template-columns:1fr 1fr}}@media(max-width:520px){.fields{grid-template-columns:1fr}.order-top,.order-bottom{align-items:flex-start;flex-direction:column}.order-bottom{gap:14px}}`}</style>
  </main>;
}
