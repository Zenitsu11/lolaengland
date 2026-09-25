'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check,ShoppingBag} from 'lucide-react';
import {useCart} from '@/components/cart-provider';

export function ProductPurchase({product}:{product:{id:string|number,name:string,price:number,image_url?:string,image_urls?:string[];amazon?:string;flipkart?:string}}){
 const {add}=useCart(); const [added,setAdded]=useState(false);
 function addBag(){add({id:product.id,name:product.name,price:product.price,image:product.image_url||product.image_urls?.[0]||''});setAdded(true);setTimeout(()=>setAdded(false),1800);}
 return <><button className="checkout-pay add-bag-btn" onClick={addBag}>{added?<><Check/> Added to LOLA bag</>:<><ShoppingBag/> Add to bag</>}</button><div className="detail-actions">{product.amazon?<a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Shop on Amazon <ArrowUpRight/></a>:null}{product.flipkart?<a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Shop on Flipkart <ArrowUpRight/></a>:null}</div><Link className="btn btn-dark detail-back" href="/cart">View LOLA bag <ArrowUpRight/></Link></>;
}