'use client';

import {FormEvent,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,CheckCircle2,PackageCheck,RefreshCcw,Search} from 'lucide-react';

const reasons=['Size / fit','Changed my mind','Damaged / defective','Wrong item received','Other'];

export default function ReturnsPage(){
  const [orderId,setOrderId]=useState('');
  const [phone,setPhone]=useState('');
  const [reason,setReason]=useState(reasons[0]);
  const [details,setDetails]=useState('');
  const [request,setRequest]=useState<any>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [submitted,setSubmitted]=useState(false);

  async function lookup(event?:FormEvent){
    event?.preventDefault(); setBusy(true);setError('');setSubmitted(false);
    try{
      const res=await fetch('/api/returns?orderId='+encodeURIComponent(orderId.trim())+'&phone='+encodeURIComponent(phone.trim()),{cache:'no-store'});
      const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not find order.');
      setRequest(data.request||null);
    }catch(e){setError(e instanceof Error?e.message:'Could not find order.');}finally{setBusy(false);}
  }

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{
      const res=await fetch('/api/returns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:orderId.trim(),phone:phone.trim(),reason,details})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not submit return request.');
      setRequest(data.request);setSubmitted(true);
    }catch(e){setError(e instanceof Error?e.message:'Could not submit return request.');}finally{setBusy(false);}
  }

  const statusLabel=(value:string)=>value.replaceAll('_',' ').replace(/\\b\\w/g,m=>m.toUpperCase());

  return <main className="return-page"><div className="container return-wrap">
    <Link className="back-link" href="/"><ArrowLeft/> Back to LOLA ENGLAND</Link>
    <div className="return-hero"><p className="editorial-eyebrow">RETURNS & REFUNDS</p><h1>Love the tee.<br/><em>Or send it back.</em></h1><p>Start a return request with your order number and the phone number used at checkout. We’ll review the request against the policy below.</p></div>
    <div className="return-grid">
      <section className="return-card">
        <div className="return-card-head"><PackageCheck/><div><h2>Start a return</h2><p>Use the same phone number you used when ordering.</p></div></div>
        <form onSubmit={request&&!['rejected','cancelled'].includes(request.status)?lookup:submit}>
          <label>Order number<input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="Paste your order ID" required/></label>
          <label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="+91…" required/></label>
          {!request||['rejected','cancelled'].includes(request.status)?<>
            <label>Reason<select value={reason} onChange={e=>setReason(e.target.value)}>{reasons.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Tell us a little more <span>(optional)</span><textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="What happened with your order?"/></label>
            <button className="btn btn-dark" disabled={busy}><RefreshCcw size={16}/>{busy?'Submitting…':'Submit return request'}</button>
          </>:<button className="btn btn-dark" disabled={busy}><Search size={16}/>{busy?'Checking…':'Check request status'}</button>}
        </form>
        {error&&<p className="return-error">{error}</p>}
        {submitted&&<div className="return-success"><CheckCircle2/><div><b>Return request received.</b><p>Keep your order number handy. The owner will review the request and update its status.</p></div></div>}
        {request&&<div className="return-status"><div><span>Request status</span><strong>{statusLabel(request.status)}</strong></div><div><span>Refund status</span><strong>{statusLabel(request.refund_status||'not_requested')}</strong></div>{Number(request.refund_amount||0)>0?<div><span>Refund amount</span><strong>₹{Number(request.refund_amount).toLocaleString('en-IN')}</strong></div>:null}{request.admin_note?<p>{request.admin_note}</p>:null}</div>}
      </section>
      <aside className="return-policy-card">
        <p className="editorial-eyebrow">LOLA POLICY</p><h2>Simple, clear, no surprises.</h2>
        <div><b>7-day returns</b><p>Eligible items can be requested within 7 days of delivery.</p></div>
        <div><b>Item condition</b><p>T-shirts must be unworn, unwashed, unaltered, with original tags and packaging.</p></div>
        <div><b>Damaged or wrong item</b><p>Tell us within 48 hours of delivery and include clear photos or video when requested.</p></div>
        <div><b>Refunds</b><p>After the return is received and approved, the refund is processed to the original payment method or the UPI details confirmed by support.</p></div>
        <div><b>Not eligible</b><p>Washed, worn, altered, damaged after delivery, or otherwise used items are not eligible unless the issue is a verified manufacturing defect.</p></div>
        <p className="return-fine">Return eligibility is reviewed against the order, delivery date and item condition. This page is a store policy summary; applicable consumer-protection rights still apply.</p>
      </aside>
    </div>
  </div></main>;
}
