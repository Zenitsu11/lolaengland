'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { SafeImage } from '@/components/safe-image';
import type { Product } from '@/components/product-card';

export function ProductQuickView({product,onClose}:{product:Product;onClose:()=>void}){
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>e.key==='Escape'&&onClose();document.addEventListener('keydown',onKey);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=''}},[onClose]);
 const image=product.image_url||'/products/lola-mint-front.webp?v=6';
 return <div role="dialog" aria-modal="true" aria-label={'Quick view: '+product.name} className="quick-view-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="quick-view-modal"><button className="quick-view-close" onClick={onClose} aria-label="Close quick view"><X/></button><div className="quick-view-media"><SafeImage src={image} fallbackSrc={image} alt={product.name+' product preview'} width={900} height={1050}/></div><div className="quick-view-copy"><p className="quick-view-eyebrow">LOLA ENGLAND</p><h2>{product.name}</h2><div className="quick-view-price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div><div className="quick-view-rating">★ {product.rating} · {Number(product.reviews||0).toLocaleString('en-IN')} reviews</div><p>{product.description||'A statement everyday tee designed for effortless styling.'}</p>{product.fabric?<p><strong>Fabric:</strong> {product.fabric}</p>:null}<div className="quick-view-note"><Check/> Quick preview — open the full product page for sizes, stock and checkout.</div><div className="quick-view-actions"><Link href={'/product/'+encodeURIComponent(String(product.id))} className="quick-view-primary" onClick={onClose}>View product <ArrowUpRight/></Link><button className="quick-view-secondary" onClick={onClose}>Keep browsing</button></div></div></div></div>;
}
