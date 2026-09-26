'use client';

import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProductCard, type Product } from '@/components/product-card';

export function WishlistClient({products}:{products:Product[]}){
  const [ids,setIds]=useState<string[]>([]);
  const sync=()=>{try{setIds(JSON.parse(localStorage.getItem('lola-wishlist')||'[]').map(String));}catch{setIds([])}};
  useEffect(()=>{sync();window.addEventListener('lola-wishlist-change',sync);return()=>window.removeEventListener('lola-wishlist-change',sync)},[]);
  const saved=products.filter(p=>ids.includes(String(p.id)));
  const clear=()=>{localStorage.removeItem('lola-wishlist');sync();window.dispatchEvent(new CustomEvent('lola-wishlist-change'));};
  return <main className="wishlist-page">
    <section className="wishlist-head container">
      <div><p className="editorial-eyebrow">YOUR LOLA EDIT</p><h1>Save the looks<br/><em>you love.</em></h1><p>Keep your favourite tees here and come back whenever you're ready.</p></div>
      {saved.length ? <button className="wishlist-clear" onClick={clear}><Trash2/> Clear wishlist</button> : null}
    </section>
    {saved.length ? <section className="container wishlist-grid">{saved.map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</section> :
      <section className="wishlist-empty container"><Heart/><h2>Your wishlist is waiting.</h2><p>Tap the heart on any T-shirt to save it here.</p><Link className="btn btn-dark" href="/collection/all">Browse T-shirts</Link></section>}
  </main>;
}
