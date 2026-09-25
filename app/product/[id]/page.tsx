'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,ArrowUpRight,Check,ShoppingBag,Star} from 'lucide-react';
import {useCart} from '@/components/cart-provider';
import {ProductGallery} from '@/components/product-gallery';

type Product={id:string|number,name:string,price:number,mrp:number,rating:number,reviews:number|string,description?:string,image_url?:string,secondary_image_url?:string,image_urls?:string[],amazon?:string,flipkart?:string};

export default function ProductPageClient({product}:{product:Product}){
 const {add}=useCart(); const [added,setAdded]=useState(false);
 function addBag(){add({id:product.id,name:product.name,price:product.price,image:product.image_url||product.image_urls?.[0]||''});setAdded(true);setTimeout(()=>setAdded(false),1800);}
 return <main className="inner-page product-detail-page"><div className="container"><Link className="back-link" href="/collection/all"><ArrowLeft/> Back to shop</Link><div className="product-detail"><ProductGallery name={product.name} front={product.image_url} back={product.secondary_image_url} images={product.image_urls}/><div className="product-detail-copy"><p className="editorial-eyebrow">LOLA ENGLAND · WOMEN’S T-SHIRT</p><h1>{product.name}</h1><div className="detail-rating"><Star/><Star/><Star/><Star/><Star/> <span>{product.rating} · {Number(product.reviews||0).toLocaleString('en-IN')} ratings</span></div><div className="detail-price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div><p className="detail-description">{product.description||'A relaxed women’s T-shirt made for easy everyday styling. Pair it with denim, cargos or your favourite layers.'}</p><div className="size-note"><strong>Available sizes</strong><span>S · M · L · XL · XXL</span></div><button className="checkout-pay add-bag-btn" onClick={addBag}>{added?<><Check/> Added to LOLA bag</>:<><ShoppingBag/> Add to bag</>}</button><div className="detail-actions">{product.amazon?<a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Shop on Amazon <ArrowUpRight/></a>:null}{product.flipkart?<a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Shop on Flipkart <ArrowUpRight/></a>:null}</div><Link className="btn btn-dark detail-back" href="/cart">View LOLA bag <ArrowUpRight/></Link></div></div></div></main>;
}