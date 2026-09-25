'use client';
import Script from 'next/script';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,CheckCircle2,ShieldCheck,Sparkles,Truck,WalletCards} from 'lucide-react';
import {useCart} from '@/components/cart-provider';

declare global { interface Window { Razorpay:any } }

export default function CheckoutPage(){
 const {items,total,clear}=useCart(); const [busy,setBusy]=useState(false); const [done,setDone]=useState(false); const [error,setError]=useState('');
 const [customer,setCustomer]=useState({name:'',phone:'',email:'',address:''});
 const update=(k:string,v:string)=>setCustomer(c=>({...c,[k]:v}));
 const totalText=useMemo(()=>total.toLocaleString('en-IN'),[total]);
 async function pay(){
  setError(''); if(!items.length)return setError('Your bag is empty.');
  if(!customer.name||!customer.phone||!customer.address)return setError('Please enter your name, phone and delivery address.');
  setBusy(true);
  try{
   const res=await fetch('/api/payment/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,customer})});
   const data=await res.json(); if(!res.ok)throw new Error(data.error||'Unable to start payment.');
   const options={key:data.keyId,amount:data.amount,currency:data.currency,name:'LOLA ENGLAND',description:'Women’s T-shirt order',order_id:data.orderId,prefill:{name:customer.name,email:customer.email,contact:customer.phone},notes:{orderRecordId:data.orderRecordId},theme:{color:'#111111'},modal:{ondismiss:()=>setBusy(false)},handler:async(response:any)=>{
     try{
       const verify=await fetch('/api/payment/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...response,orderRecordId:data.orderRecordId})});
       const v=await verify.json(); if(!verify.ok)throw new Error(v.error||'Payment verification failed.');
       clear();setDone(true);
     }catch(e){setError(e instanceof Error?e.message:'Payment verification failed.');}
     finally{setBusy(false);}
   }};
   if(!window.Razorpay)throw new Error('Payment checkout is still loading. Please try again.');
   new window.Razorpay(options).open();
  }catch(e){setBusy(false);setError(e instanceof Error?e.message:'Payment could not start.');}
 }
 if(done)return <main className="checkout-page"><div className="checkout-success"><CheckCircle2 size={64}/><p className="editorial-eyebrow">PAYMENT CONFIRMED</p><h1>You’re officially a<br/><em>LOLA girl.</em></h1><p>Your payment was verified and your order is now in our system.</p><Link className="btn btn-dark" href="/">Continue shopping</Link></div></main>;
 return <main className="checkout-page"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/><div className="container checkout-wrap"><Link className="back-link" href="/cart"><ArrowLeft/> Back to bag</Link><div className="checkout-grid"><section className="checkout-card"><p className="editorial-eyebrow">SECURE CHECKOUT</p><h1>Ready to wear<br/><em>your mood?</em></h1><div className="trust-row"><span><ShieldCheck/> Secure</span><span><Truck/> Fast delivery</span><span><WalletCards/> UPI + Cards</span></div><div className="checkout-form"><label>Full name<input value={customer.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label><label>Phone number<input inputMode="tel" value={customer.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91"/></label><label>Email <span>(optional)</span><input type="email" value={customer.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label><label>Delivery address<textarea value={customer.address} onChange={e=>update('address',e.target.value)} placeholder="House / flat, street, city, state, PIN"/></label></div>{error&&<div className="checkout-error">{error}</div>}<button className="checkout-pay" onClick={pay} disabled={busy||!items.length}>{busy?'Opening secure payment…':'Pay ₹'+totalText+' securely'}</button><p className="checkout-note">UPI apps, cards, netbanking and other methods shown by Razorpay depend on the payment methods enabled for your merchant account.</p></section><aside className="checkout-summary"><p className="editorial-eyebrow">YOUR LOLA BAG</p>{items.map(i=><div className="checkout-item" key={i.id}><img src={i.image} alt=""/><div><b>{i.name}</b><span>Qty {i.quantity}</span></div><strong>₹{(i.price*i.quantity).toLocaleString('en-IN')}</strong></div>)}<div className="checkout-total"><span>Total</span><b>₹{totalText}</b></div></aside></div></div></main>;
}