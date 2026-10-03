'use client';

import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard, type Product } from '@/components/product-card';
import type { ProductVariant } from '@/lib/catalog';

type Props={products:Product[];variants:ProductVariant[]};
type SortKey='featured'|'newest'|'price-asc'|'price-desc'|'discount-desc';
const SIZES=['XS','S','M','L','XL','XXL','3XL'];

export function CollectionFilters({products,variants}:Props){
  const [open,setOpen]=useState(false);const [sort,setSort]=useState<SortKey>('featured');const [sizes,setSizes]=useState<string[]>([]);const [colors,setColors]=useState<string[]>([]);const [fabric,setFabric]=useState('');const [occasion,setOccasion]=useState('');const [discount,setDiscount]=useState('');const [price,setPrice]=useState('');
  const colorOptions=useMemo(()=>Array.from(new Set(variants.map(v=>v.color).filter(Boolean))).sort(),[variants]);
  const fabricOptions=useMemo(()=>Array.from(new Set(products.map(p=>p.fabric||'').filter(Boolean))).sort(),[products]);
  const occasionOptions=useMemo(()=>Array.from(new Set(products.flatMap(p=>p.occasions||[]).filter(Boolean))).sort(),[products]);
  const toggle=(value:string,setter:React.Dispatch<React.SetStateAction<string[]>>)=>setter(current=>current.includes(value)?current.filter(x=>x!==value):[...current,value]);
  const clear=()=>{setSizes([]);setColors([]);setFabric('');setOccasion('');setDiscount('');setPrice('');setSort('featured');};
  const filtered=useMemo(()=>products.filter(product=>{const pv=variants.filter(v=>String(v.product_id)===String(product.id));if(sizes.length&&!pv.some(v=>sizes.includes(v.size)&&(!v.track_inventory||v.stock_qty-v.reserved_qty>0)))return false;if(colors.length&&!pv.some(v=>colors.includes(v.color)&&(!v.track_inventory||v.stock_qty-v.reserved_qty>0)))return false;if(fabric&&(product.fabric||'')!==fabric)return false;if(occasion&&!(product.occasions||[]).includes(occasion))return false;if(discount){const pct=product.mrp>0?Math.round((1-product.price/product.mrp)*100):0;if(Number(discount)>pct)return false;}if(price){const [min,max]=price.split('-').map(Number);if(product.price<min||(Number.isFinite(max)&&product.price>max))return false;}return true;}).sort((a,b)=>{if(sort==='price-asc')return a.price-b.price;if(sort==='price-desc')return b.price-a.price;if(sort==='discount-desc')return ((b.mrp-b.price)/Math.max(1,b.mrp))-((a.mrp-a.price)/Math.max(1,a.mrp));if(sort==='newest')return String(b.id).localeCompare(String(a.id));return 0;}),[products,variants,sizes,colors,fabric,occasion,discount,price,sort]);
  const activeCount=sizes.length+colors.length+(fabric?1:0)+(occasion?1:0)+(discount?1:0)+(price?1:0);
  return <>
    <div className="collection-controls"><button type="button" className="filter-trigger" onClick={()=>setOpen(v=>!v)}><SlidersHorizontal size={17}/> Filters {activeCount?`(${activeCount})`:''}</button><span className="collection-result-count">{filtered.length} of {products.length} styles</span><label className="sort-control"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value as SortKey)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: Low to high</option><option value="price-desc">Price: High to low</option><option value="discount-desc">Biggest discount</option></select><ChevronDown size={15}/></label></div>
    {open?<div className="filter-panel"><div className="filter-panel-head"><strong>Shop by</strong><div><button type="button" onClick={clear}>Clear all</button><button type="button" className="filter-close" onClick={()=>setOpen(false)} aria-label="Close filters"><X size={18}/></button></div></div><div className="filter-grid">
      <fieldset><legend>Size</legend><div className="chip-row">{SIZES.map(x=><button type="button" className={sizes.includes(x)?'filter-chip active':'filter-chip'} key={x} onClick={()=>toggle(x,setSizes)}>{x}</button>)}</div></fieldset>
      <fieldset><legend>Color</legend><div className="chip-row">{colorOptions.length?colorOptions.map(x=><button type="button" className={colors.includes(x)?'filter-chip active':'filter-chip'} key={x} onClick={()=>toggle(x,setColors)}>{x}</button>):<small className="filter-muted">Color variants will appear here when configured.</small>}</div></fieldset>
      <fieldset><legend>Price</legend><select className="filter-select" value={price} onChange={e=>setPrice(e.target.value)}><option value="">Any price</option><option value="0-799">Under ₹799</option><option value="800-1199">₹800–₹1,199</option><option value="1200-1999">₹1,200–₹1,999</option><option value="2000-999999">₹2,000+</option></select></fieldset>
      <fieldset><legend>Discount</legend><select className="filter-select" value={discount} onChange={e=>setDiscount(e.target.value)}><option value="">Any discount</option><option value="10">10% or more</option><option value="20">20% or more</option><option value="30">30% or more</option><option value="50">50% or more</option></select></fieldset>
      <fieldset><legend>Fabric</legend>{fabricOptions.length?<select className="filter-select" value={fabric} onChange={e=>setFabric(e.target.value)}><option value="">Any fabric</option>{fabricOptions.map(x=><option key={x}>{x}</option>)}</select>:<small className="filter-muted">No fabric metadata has been added yet.</small>}</fieldset>
      <fieldset><legend>Occasion</legend>{occasionOptions.length?<select className="filter-select" value={occasion} onChange={e=>setOccasion(e.target.value)}><option value="">Any occasion</option>{occasionOptions.map(x=><option key={x}>{x}</option>)}</select>:<small className="filter-muted">No occasion metadata has been added yet.</small>}</fieldset>
    </div></div>:null}
    <div className="product-grid">{filtered.map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</div>
    {!filtered.length?<div className="empty-filter-state"><h3>No styles match those filters.</h3><p>Try removing a filter or browse the complete LOLA edit.</p><button type="button" onClick={clear}>Clear filters</button></div>:null}
  </>;
}
