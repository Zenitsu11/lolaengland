'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/components/cart-provider';

export default function RecoverCartPage(){
 const params=useSearchParams(); const router=useRouter(); const {clear}=useCart();
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
 const [message,setMessage]=useState('Restoring your cart…');
 useEffect(()=>{
  const token=params.get('token');
  if(!token){setState('error');setMessage('This recovery link is missing its token.');return;}
  (async()=>{
   try{
    const res=await fetch(`/api/cart/abandoned?token=${encodeURIComponent(token)}`);
    const data=await res.json();
    if(!res.ok||!Array.isArray(data.cart_data)||!data.cart_data.length) throw new Error(data.error||'Your cart could not be restored.');
    localStorage.setItem('lola-cart',JSON.stringify(data.cart_data));
    clear();
    window.dispatchEvent(new Event('lola-cart-change'));
    setState('ready'); setMessage('Your saved items are back.');
   }catch(e){setState('error');setMessage(e instanceof Error?e.message:'Unable to restore your cart.');}
  })();
 },[params,clear]);
 return <main style={{minHeight:'70vh',display:'grid',placeItems:'center',padding:24,textAlign:'center'}}><div><div style={{fontSize:12,letterSpacing:'.18em',marginBottom:14}}>LOLA ENGLAND</div><h1 style={{fontSize:'clamp(32px,7vw,56px)',margin:'0 0 12px'}}>{message}</h1><p style={{color:'#666',marginBottom:24}}>{state==='ready'?'Continue to checkout to complete your purchase.':'Please request a fresh recovery link if this one has expired.'}</p>{state==='ready'?<button onClick={()=>router.push('/cart')} style={{border:0,background:'#111',color:'#fff',padding:'14px 24px',cursor:'pointer'}}>View my cart</button>:<button onClick={()=>router.push('/')} style={{border:'1px solid #111',background:'#fff',padding:'14px 24px',cursor:'pointer'}}>Continue shopping</button>}</div></main>
}
