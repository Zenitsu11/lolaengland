'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check,ShoppingBag,Ruler} from 'lucide-react';
import {useCart} from '@/components/cart-provider';

const sizes=[
 {label:'XS',chest:'32–34 in',cm:'81–86 cm'},
 {label:'S',chest:'34–36 in',cm:'86–91 cm'},
 {label:'M',chest:'36–38 in',cm:'91–97 cm'},
 {label:'L',chest:'38–40 in',cm:'97–102 cm'},
 {label:'XL',chest:'40–42 in',cm:'102–107 cm'},
 {label:'XXL',chest:'42–44 in',cm:'107–112 cm'},
 {label:'3XL',chest:'44–46 in',cm:'112–117 cm'}
];

export function ProductPurchase({product}:{product:{id:string|number,name:string,price:number,image_url?:string,image_urls?:string[];amazon?:string;flipkart?:string}}){
 const {add}=useCart(); const [added,setAdded]=useState(false); const [size,setSize]=useState('');
 function addBag(){if(!size)return;const lineId=`${product.id}-${size}`;add({id:product.id,name:product.name,price:product.price,image:product.image_url||product.image_urls?.[0]||'',size,lineId});setAdded(true);setTimeout(()=>setAdded(false),1800);}
 return <div className="purchase-box">
   <div className="size-picker">
    <div className="size-picker-head"><strong>Select your size</strong><button type="button" className="size-guide-trigger" onClick={()=>document.getElementById('lola-size-guide')?.scrollIntoView({behavior:'smooth',block:'center'})}><Ruler size={16}/> Size guide</button></div>
    <div className="size-grid" role="radiogroup" aria-label="T-shirt size">{sizes.map(s=><button key={s.label} type="button" className={'size-chip'+(size===s.label?' selected':'')} onClick={()=>setSize(s.label)} aria-pressed={size===s.label}>{s.label}</button>)}</div>
    {!size?<small className="size-required">Please select a size before adding to bag.</small>:<small>Selected size: <strong>{size}</strong> · International / India reference</small>}
   </div>
   <button className="checkout-pay add-bag-btn" onClick={addBag} disabled={!size}>{added?<><Check/> Added to LOLA bag</>:<><ShoppingBag/> Add {size?size+' ':''}to bag</>}</button>
   <div className="detail-actions">{product.amazon?<a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Shop on Amazon <ArrowUpRight/></a>:null}{product.flipkart?<a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Shop on Flipkart <ArrowUpRight/></a>:null}</div>
   <Link className="btn btn-dark detail-back" href="/cart">View LOLA bag <ArrowUpRight/></Link>
 </div>;
}
export {sizes};
