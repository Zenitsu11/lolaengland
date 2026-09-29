'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import Script from 'next/script';
import QRCode from 'qrcode';
import {ArrowLeft,CheckCircle2,ShieldCheck,Truck,WalletCards,Copy,ExternalLink,CreditCard,Banknote} from 'lucide-react';
import {useCart} from '@/components/cart-provider';

type Method='upi'|'card'|'cod';
type Config={upiEnabled:boolean;upiId:string;upiName:string;cardEnabled:boolean;codEnabled:boolean;codFee:number};
type Payment={orderRecordId:string;upiUri?:string;upiId?:string;upiName?:string;transactionNote?:string;subtotal:number;shippingFee:number;platformFee:number;gstRate:number;gstAmount:number;totalAmount:number;discountAmount:number;couponCode:string;qr?:string;razorpayOrderId?:string;keyId?:string;method:Method;codFee?:number};

export default function CheckoutPage(){
 const {items,total,clear}=useCart();
 const [busy,setBusy]=useState(false); const [done,setDone]=useState(false); const [error,setError]=useState(''); const [doneMethod,setDoneMethod]=useState<Method>('upi');
 const [config,setConfig]=useState<Config>({upiEnabled:false,upiId:'',upiName:'LOLA ENGLAND',cardEnabled:false,codEnabled:false,codFee:0});
 const [method,setMethod]=useState<Method>('upi');
 const [customer,setCustomer]=useState({name:'',phone:'',email:'',address:''});
 const [couponCode,setCouponCode]=useState(''); const [payment,setPayment]=useState<Payment|null>(null);
 useEffect(()=>{fetch('/api/payment/config',{cache:'no-store'}).then(r=>r.json()).then(d=>{if(d&&typeof d==='object'){setConfig(d);if(d.upiEnabled)setMethod('upi');else if(d.cardEnabled)setMethod('card');else if(d.codEnabled)setMethod('cod');}}).catch(()=>{});},[]);
 const update=(k:string,v:string)=>setCustomer(c=>({...c,[k]:v}));
 const totalText=useMemo(()=>total.toLocaleString('en-IN'),[total]);
 const start=async()=>{
  setError(''); if(!items.length)return setError('Your bag is empty.');
  if(!customer.name||!customer.phone||!customer.address)return setError('Please enter your name, phone and delivery address.');
  if(method==='upi'&&!config.upiEnabled)return setError('UPI payments are currently unavailable.');
  if(method==='card'&&!config.cardEnabled)return setError('Card payments are currently unavailable.');
  if(method==='cod'&&!config.codEnabled)return setError('Cash on Delivery is currently unavailable.');
  setBusy(true);
  try{
   const res=await fetch('/api/payment/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,customer,couponCode,method})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||'Unable to create order.');
   if(method==='cod'){clear();setDoneMethod('cod');setDone(true);return;}
   if(method==='upi'){
    const qr=await QRCode.toDataURL(data.upiUri,{width:420,margin:2,errorCorrectionLevel:'M'});
    setPayment({...data,qr,method});return;
   }
   if(!(window as any).Razorpay)throw new Error('Secure card checkout is still loading. Please try again.');
   const rzp=new (window as any).Razorpay({
    key:data.keyId,amount:Math.round(data.totalAmount*100),currency:'INR',name:'LOLA ENGLAND',
    description:'LOLA ENGLAND order',order_id:data.razorpayOrderId,
    prefill:{name:customer.name,email:customer.email,contact:customer.phone},
    theme:{color:'#111111'},
    handler:async(response:any)=>{
      setBusy(true);
      try{
       const vr=await fetch('/api/payment/razorpay/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderRecordId:data.orderRecordId,razorpay_payment_id:response.razorpay_payment_id,razorpay_order_id:response.razorpay_order_id,razorpay_signature:response.razorpay_signature})});
       const vd=await vr.json();if(!vr.ok)throw new Error(vd.error||'Payment verification failed.');
       clear();setDoneMethod('card');setDone(true);
      }catch(e){setError(e instanceof Error?e.message:'Payment verification failed.');}finally{setBusy(false);}
    },
    modal:{ondismiss:()=>setBusy(false)}
   });
   rzp.on('payment.failed',(response:any)=>setError(response?.error?.description||'Card payment failed. Please try again.'));
   rzp.open();
  }catch(e){setError(e instanceof Error?e.message:'Payment could not start.');}finally{if(method!=='card')setBusy(false);}
 };
 async function confirmUpi(){if(!payment)return;setBusy(true);try{const res=await fetch('/api/payment/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderRecordId:payment.orderRecordId})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Could not submit order.');clear();setDoneMethod('upi');setDone(true);}catch(e){setError(e instanceof Error?e.message:'Could not submit order.');}finally{setBusy(false);}}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);}catch{}}
 if(done)return <main className="checkout-page"><div className="checkout-success"><CheckCircle2 size={64}/><p className="editorial-eyebrow">{doneMethod==='cod'?'ORDER CONFIRMED':'ORDER RECEIVED'}</p><h1>Thank you, <br/><em>LOLA girl.</em></h1><p>{doneMethod==='cod'?'Your Cash on Delivery order has been placed. We will contact you before dispatch.':doneMethod==='card'?'Your card payment has been submitted and your order is being confirmed.':'Your UPI order has been received. Once the payment is confirmed, your order can be processed.'}</p><div className="checkout-success-actions"><Link className="btn btn-dark" href="/">Continue shopping</Link><Link className="btn btn-light" href="/returns">Returns & refunds</Link></div></div></main>;
 return <main className="checkout-page"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/><div className="container checkout-wrap"><Link className="back-link" href="/cart"><ArrowLeft/> Back to bag</Link>
 <div className="checkout-grid"><section className="checkout-card"><p className="editorial-eyebrow">SECURE CHECKOUT</p><h1>Pay your way.<br/><em>Choose what suits you.</em></h1><div className="trust-row"><span><ShieldCheck/> Secure order</span><span><Truck/> Fast delivery</span><span><WalletCards/> Multiple payment options</span></div>
 {!payment?<><div className="payment-method-grid">
   {config.upiEnabled&&<button type="button" className={'payment-method-option '+(method==='upi'?'active':'')} onClick={()=>setMethod('upi')}><WalletCards/><span><b>UPI</b><small>GPay, PhonePe, Paytm & QR</small></span></button>}
   {config.cardEnabled&&<button type="button" className={'payment-method-option '+(method==='card'?'active':'')} onClick={()=>setMethod('card')}><CreditCard/><span><b>Credit / Debit Card</b><small>Secure Razorpay checkout</small></span></button>}
   {config.codEnabled&&<button type="button" className={'payment-method-option '+(method==='cod'?'active':'')} onClick={()=>setMethod('cod')}><Banknote/><span><b>Cash on Delivery</b><small>{config.codFee?'₹'+config.codFee+' COD fee':''}</small></span></button>}
  </div>
  <div className="checkout-form"><label>Full name<input value={customer.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label><label>Phone number<input inputMode="tel" value={customer.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91"/></label><label>Email <span>(optional)</span><input type="email" value={customer.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label><label>Coupon code <span>(optional)</span><input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. LOLA10"/></label><label>Delivery address<textarea value={customer.address} onChange={e=>update('address',e.target.value)} placeholder="House / flat, street, city, state, PIN"/></label></div>
  <button className="checkout-pay" onClick={start} disabled={busy||!items.length}>{busy?'Opening secure checkout…':method==='upi'?'Continue to UPI QR · ₹'+totalText:method==='card'?'Pay securely by card · ₹'+totalText:'Place COD order · ₹'+totalText}</button>
 </>:<div className="upi-payment-box"><div className="upi-amount">Pay <strong>₹{payment.totalAmount.toLocaleString('en-IN')}</strong></div><p className="upi-caption">Scan with Google Pay, PhonePe, Paytm, BHIM or any UPI app.</p><img className="upi-qr" src={payment.qr} alt="LOLA ENGLAND UPI payment QR code"/><div className="upi-id-row"><span>UPI ID</span><strong>{payment.upiId}</strong><button type="button" onClick={()=>copy(payment.upiId||'')} aria-label="Copy UPI ID"><Copy size={16}/></button></div><button type="button" className="upi-open-btn" onClick={()=>{window.location.href=payment.upiUri||''}}><ExternalLink size={17}/> Open UPI app</button><p className="upi-note">Payment note: <strong>{payment.transactionNote}</strong></p><div className="checkout-charge-mini"><span>Subtotal <b>₹{payment.subtotal.toLocaleString('en-IN')}</b></span><span>Shipping <b>{payment.shippingFee?'₹'+payment.shippingFee.toLocaleString('en-IN'):'FREE'}</b></span><span>Discount {payment.couponCode?<b>-₹'+payment.discountAmount.toLocaleString('en-IN')+' ('+payment.couponCode+')':'₹0'}</b></span><span>Platform fee <b>₹{payment.platformFee.toLocaleString('en-IN')}</b></span><span>GST ({payment.gstRate}%) <b>₹{payment.gstAmount.toLocaleString('en-IN')}</b></span><strong>Total <b>₹{payment.totalAmount.toLocaleString('en-IN')}</b></strong></div><button type="button" className="checkout-pay" onClick={confirmUpi} disabled={busy}>{busy?'Submitting order…':'I’ve completed the payment'}</button><p className="upi-note">Payment status is confirmed by the owner from the payment account/bank records. You do not need to enter a UTR.</p><button type="button" className="change-payment" onClick={()=>setPayment(null)}>← Change payment method</button></div>}
 {error&&<div className="checkout-error">{error}</div>}<p className="checkout-note">Never share your UPI PIN, card CVV or OTP with anyone.</p></section>
 <aside className="checkout-summary"><p className="editorial-eyebrow">YOUR LOLA BAG</p>{items.map(i=><div className="checkout-item" key={i.lineId}><img src={i.image} alt=""/><div><b>{i.name}</b><span>Size {i.size} · Qty {i.quantity}</span></div><strong>₹{(i.price*i.quantity).toLocaleString('en-IN')}</strong></div>)}<div className="checkout-total"><span>Subtotal</span><b>₹{totalText}</b></div><small className="checkout-note">Final shipping, platform fee, GST and any COD fee are calculated securely before order creation.</small></aside></div></div></main>;
}
