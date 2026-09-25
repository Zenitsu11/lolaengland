'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {ArrowLeft,CheckCircle2,ShieldCheck,Truck,WalletCards,Copy,ExternalLink} from 'lucide-react';
import {useCart} from '@/components/cart-provider';

export default function CheckoutPage(){
 const {items,total,clear}=useCart();
 const [busy,setBusy]=useState(false); const [done,setDone]=useState(false); const [error,setError]=useState('');
 const [customer,setCustomer]=useState({name:'',phone:'',email:'',address:''});
 const [payment,setPayment]=useState<{orderRecordId:string;upiUri:string;upiId:string;upiName:string;transactionNote:string;amount:number;qr:string}|null>(null);
 const [utr,setUtr]=useState('');
 const update=(k:string,v:string)=>setCustomer(c=>({...c,[k]:v}));
 const totalText=useMemo(()=>total.toLocaleString('en-IN'),[total]);

 async function startPayment(){
  setError(''); if(!items.length)return setError('Your bag is empty.');
  if(!customer.name||!customer.phone||!customer.address)return setError('Please enter your name, phone and delivery address.');
  setBusy(true);
  try{
   const res=await fetch('/api/payment/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,customer})});
   const data=await res.json(); if(!res.ok)throw new Error(data.error||'Unable to create payment.');
   const qr=await QRCode.toDataURL(data.upiUri,{width:420,margin:2,errorCorrectionLevel:'M'});
   setPayment({...data,qr});
  }catch(e){setError(e instanceof Error?e.message:'Payment could not start.');}
  finally{setBusy(false);}
 }

 async function submitPayment(){
  setError(''); if(!payment)return;
  if(!utr.trim())return setError('Enter the UTR / transaction ID after completing the UPI payment.');
  setBusy(true);
  try{
   const res=await fetch('/api/payment/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderRecordId:payment.orderRecordId,utr})});
   const data=await res.json(); if(!res.ok)throw new Error(data.error||'Could not submit payment details.');
   clear();setDone(true);
  }catch(e){setError(e instanceof Error?e.message:'Could not submit payment details.');}
  finally{setBusy(false);}
 }

 async function copy(text:string){try{await navigator.clipboard.writeText(text);}catch{}}

 if(done)return <main className="checkout-page"><div className="checkout-success"><CheckCircle2 size={64}/><p className="editorial-eyebrow">PAYMENT SUBMITTED</p><h1>Thank you, <br/><em>LOLA girl.</em></h1><p>Your UPI payment details have been submitted. We’ll verify the transaction and process your order.</p><Link className="btn btn-dark" href="/">Continue shopping</Link></div></main>;

 return <main className="checkout-page"><div className="container checkout-wrap"><Link className="back-link" href="/cart"><ArrowLeft/> Back to bag</Link>
 <div className="checkout-grid"><section className="checkout-card"><p className="editorial-eyebrow">SECURE UPI CHECKOUT</p><h1>Pay your way.<br/><em>Scan & go.</em></h1>
  <div className="trust-row"><span><ShieldCheck/> Secure order</span><span><Truck/> Fast delivery</span><span><WalletCards/> UPI QR</span></div>
  {!payment?<div className="checkout-form">
    <label>Full name<input value={customer.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label>
    <label>Phone number<input inputMode="tel" value={customer.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91"/></label>
    <label>Email <span>(optional)</span><input type="email" value={customer.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label>
    <label>Delivery address<textarea value={customer.address} onChange={e=>update('address',e.target.value)} placeholder="House / flat, street, city, state, PIN"/></label>
   </div>:null}
  {payment?<div className="upi-payment-box">
    <div className="upi-amount">Pay <strong>₹{payment.amount.toLocaleString('en-IN')}</strong></div>
    <p className="upi-caption">Scan this QR with Google Pay, PhonePe, Paytm, BHIM or any UPI app.</p>
    <img className="upi-qr" src={payment.qr} alt="LOLA ENGLAND UPI payment QR code"/>
    <div className="upi-id-row"><span>UPI ID</span><strong>{payment.upiId}</strong><button type="button" onClick={()=>copy(payment.upiId)} aria-label="Copy UPI ID"><Copy size={16}/></button></div>
    <button type="button" className="upi-open-btn" onClick={()=>{window.location.href=payment.upiUri}}><ExternalLink size={17}/> Open UPI app</button>
    <p className="upi-note">Payment note: <strong>{payment.transactionNote}</strong></p>
    <label className="utr-field">After payment, enter UTR / transaction ID<input value={utr} onChange={e=>setUtr(e.target.value)} placeholder="e.g. 123456789012" inputMode="numeric"/></label>
    <button className="checkout-pay" onClick={submitPayment} disabled={busy}>{busy?'Submitting…':'I’ve paid — submit payment'}</button>
    <button type="button" className="change-payment" onClick={()=>setPayment(null)}>← Change details</button>
   </div>:<button className="checkout-pay" onClick={startPayment} disabled={busy||!items.length}>{busy?'Creating secure QR…':'Continue to UPI QR · ₹'+totalText}</button>}
  {error&&<div className="checkout-error">{error}</div>}
  <p className="checkout-note">Direct UPI QR checkout. Your order is marked paid only after the submitted UTR is checked by the store; do not upload or share your UPI PIN.</p>
 </section>
 <aside className="checkout-summary"><p className="editorial-eyebrow">YOUR LOLA BAG</p>{items.map(i=><div className="checkout-item" key={i.lineId}><img src={i.image} alt=""/><div><b>{i.name}</b><span>Size {i.size} · Qty {i.quantity}</span></div><strong>₹{(i.price*i.quantity).toLocaleString('en-IN')}</strong></div>)}<div className="checkout-total"><span>Total</span><b>₹{totalText}</b></div></aside></div></div></main>;
}
