'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard, type Product } from '@/components/product-card';
import { trackSearch } from '@/lib/analytics';

function normalize(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ');}
function distance(a:string,b:string){
  if(a===b)return 0;
  if(Math.abs(a.length-b.length)>4)return 99;
  const prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const row=[i];
    for(let j=1;j<=b.length;j++) row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<row.length;j++)prev[j]=row[j];
  }
  return prev[b.length];
}
function fuzzyMatch(query:string,text:string){
  const q=normalize(query); const t=normalize(text); if(!q)return true;
  if(t.includes(q))return true;
  const words=t.split(' ');
  return q.split(' ').every(token=>words.some(word=>word.includes(token)||distance(token,word)<=Math.max(1,Math.floor(token.length/4))));
}

export function ProductSearch({products,initialQuery=''}:{products:Product[];initialQuery?:string}){
  const [query,setQuery]=useState(initialQuery);
  const results=useMemo(()=>{
    const q=normalize(query); if(!q)return products;
    return products.filter(p=>fuzzyMatch(q,[p.name,p.description||'',...(p.categories||[]),p.fabric||'',...(p.occasions||[])].join(' ')));
  },[products,query]);
  const suggestions=useMemo(()=>{
    const q=normalize(query); if(!q)return [];
    return products.filter(p=>fuzzyMatch(q,p.name)).slice(0,5);
  },[products,query]);

  useEffect(()=>{
    const value=query.trim();
    if(!value)return;
    const timer=window.setTimeout(()=>trackSearch(value),700);
    return()=>window.clearTimeout(timer);
  },[query]);

  return <div className="search-shell">
    <div className="search-box-wrap">
      <Search size={21}/>
      <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search T-shirts, graphics, oversized..." aria-label="Search LOLA ENGLAND products" />
      {query?<button type="button" onClick={()=>setQuery('')} aria-label="Clear search"><X size={18}/></button>:null}
    </div>
    {query&&suggestions.length?<div className="search-suggestions">{suggestions.map(p=><Link key={p.id} href={'/product/'+encodeURIComponent(String(p.id))} onClick={()=>setQuery(p.name)}><span>{p.name}</span><small>₹{p.price.toLocaleString('en-IN')}</small></Link>)}</div>:null}
    <div className="search-meta"><span>{query?`${results.length} result${results.length===1?'':'s'}`:'All LOLA styles'}</span>{query?<span>Smart matching enabled</span>:null}</div>
    {results.length?<div className="product-grid">{results.map((p,i)=><ProductCard key={p.id} product={p} visualIndex={i}/>)}</div>:<div className="empty-filter-state"><h3>No exact match? Try another mood.</h3><p>We also understand close spellings and product keywords.</p><Link href="/collection/all" className="btn btn-dark">Browse all T-shirts</Link></div>}
  </div>;
}
