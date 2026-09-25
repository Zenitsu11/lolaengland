'use client';
import Link from 'next/link';
import {ArrowLeft,Minus,Plus,Trash2,ShieldCheck} from 'lucide-react';
import {useCart} from '@/components/cart-provider';
export default function CartPage(){
 const {items,total,setQuantity,remove}=useCart();
 return <main className="cart-page"><div className="container"><Link className="back-link" href="/"><ArrowLeft/> Continue shopping</Link>
 <div className="cart-head"><div><p className="editorial-eyebrow">YOUR LOLA BAG</p><h1>Good choices.<br/><em>Great mood.</em></h1></div><b>{items.length} item{items.length===1?'':'s'}</b></div>
 {!items.length?<div className="empty-cart"><h2>Your bag is waiting.</h2><p>Find a tee that feels like you.</p><Link className="btn btn-dark" href="/collection/all">Shop T-shirts</Link></div>:
 <div className="cart-grid"><section>{items.map(i=><div className="cart-item" key={i.id}><img src={i.image} alt=""/><div className="cart-item-info"><h3>{i.name}</h3><p>₹{i.price.toLocaleString('en-IN')}</p><div className="qty"><button onClick={()=>setQuantity(i.id,i.quantity-1)} disabled={i.quantity<=1}><Minus/></button><b>{i.quantity}</b><button onClick={()=>setQuantity(i.id,i.quantity+1)}><Plus/></button></div></div><button className="remove-item" onClick={()=>remove(i.id)}><Trash2/></button></div>)}</section>
 <aside className="cart-summary"><p className="editorial-eyebrow">ORDER SUMMARY</p><div><span>Subtotal</span><b>₹{total.toLocaleString('en-IN')}</b></div><div><span>Shipping</span><b>{total>=799?'FREE':'Calculated at checkout'}</b></div><hr/><div className="cart-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div><Link className="checkout-pay" href="/checkout">Proceed to secure checkout →</Link><small><ShieldCheck/> UPI · Cards · Netbanking · Wallets · More</small></aside></div>}
 </div></main>;
}