'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard, type Product } from '@/components/product-card';

type Props={products:Product[]};

export function ProductDiscovery({products}:Props){
 const [query,setQuery]=useState('');
 const normalized=query.trim().toLowerCase();
 const results=useMemo(()=>{
  if(!normalized)return products;
  const terms=normalized.split(/\s+/).filter(Boolean);
  return products.filter(p=>{
   const hay=[p.name,p.description,p.tone,p.fabric,...(p.categories||[]),...(p.occasions||[])].filter(Boolean).join(' ').toLowerCase();
   return terms.every(term=>hay.includes(term));
  });
 },[products,normalized]);
 return <section aria-label="Search LOLA products" className="product-discovery">
   <div className="discovery-search">
    <Search size={19} aria-hidden="true"/>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search T-shirts, graphics, oversized…" aria-label="Search products"/>
    {query?<button type="button" onClick={()=>setQuery('')} aria-label="Clear search"><X size={17}/></button>:null}
   </div>
   {query?<p className="discovery-count">{results.length} {results.length===1?'style':'styles'} found for “{query}”</p>:null}
   <div className="product-grid">{results.map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</div>
   {query&&!results.length?<div className="empty-filter-state"><h3>No styles found.</h3><p>Try “graphic”, “oversized”, “pink” or another product detail.</p><button type="button" onClick={()=>setQuery('')}>Clear search</button></div>:null}
 </section>;
}
