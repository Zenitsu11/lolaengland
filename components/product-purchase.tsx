'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check,ShoppingBag,Ruler} from 'lucide-react';
import {useCart} from '@/components/cart-provider';
import {trackAddToCart} from '@/lib/analytics';
import type {ProductVariant} from '@/lib/catalog';

const sizes=[
 {label:'XS',chest:'32–34 in',cm:'81–86 cm'}, {label:'S',chest:'34–36 in',cm:'86–91 cm'}, {label:'M',chest:'36–38 in',cm:'91–97 cm'},
 {label:'L',chest:'38–40 in',cm:'97–102 cm'}, {label:'XL',chest:'40–42 in',cm:'102–107 cm'}, {label:'XXL',chest:'42–44 in',cm:'107–112 cm'}, {label:'3XL',chest:'44–46 in',cm:'112–117 cm'}
];

type ProductProps={id:string|number,name:string,price:number,image_url?:string,image_urls?:string[];amazon?:string;flipkart?:string;variants?:ProductVariant[]};
export function ProductPurchase({product}:{product:ProductProps}){
 const {add}=useCart(); const [added,setAdded]=useState(false); const [size,setSize]=useState(''); const [color,setColor]=useState('');
 const variants=product.variants||[]; const variantMode=variants.length>0;
 const colors=useMemo(()=>Array.from(new Map(variants.map(v=>[v.color,v])).values()),[variants]);
 const sizeOptions=useMemo(()=>variantMode?sizes.filter(s=>variants.some(v=>v.size===s.label&&(!color||v.color===color)&&v.active)):sizes,[variants,variantMode,color]);
 const selectedVariant=variantMode?variants.find(v=>v.size===size&&v.color===color&&v.active):null;
 const available=selectedVariant?(!selectedVariant.track_inventory||selectedVariant.stock_qty-selectedVariant.reserved_qty>0):true;
 function addBag(){
   if(!size||!available||(variantMode&&!color))return;
   const lineId=`${product.id}-${size}-${color||'default'}`;
   add({id:product.id,name:product.name,price:product.price,image:product.image_url||product.image_urls?.[0]||'',size,color:color||undefined,variantId:selectedVariant?.id,lineId});
   trackAddToCart({item_id:product.id,item_name:product.name,price:product.price,quantity:1,item_variant:color?`${color} / ${size}`:size});
   setAdded(true);setTimeout(()=>setAdded(false),1800);
 }
 return <div className="purchase-box">
   {variantMode&&<div className="color-picker"><div className="size-picker-head"><strong>Select your color</strong><small>{color||'Choose a colour'}</small></div><div className="color-grid" role="radiogroup" aria-label="T-shirt color">{colors.map(v=><button key={v.color} type="button" className={'color-chip'+(color===v.color?' selected':'')} onClick={()=>{setColor(v.color);setSize('')}} aria-pressed={color===v.color}><span className="color-swatch" style={{backgroundColor:v.color_hex||'#ddd'}}/><span>{v.color}</span></button>)}</div></div>}
   <div className="size-picker">
    <div className="size-picker-head"><strong>Select your size</strong><button type="button" className="size-guide-trigger" onClick={()=>document.getElementById('lola-size-guide')?.scrollIntoView({behavior:'smooth',block:'center'})}><Ruler size={16}/> Size guide</button></div>
    <div className="size-grid" role="radiogroup" aria-label="T-shirt size">{sizeOptions.map(s=>{const v=variantMode?variants.find(x=>x.size===s.label&&x.color===color&&x.active):null;const inStock=!variantMode||!v?.track_inventory||(v.stock_qty-v.reserved_qty>0);return <button key={s.label} type="button" className={'size-chip'+(size===s.label?' selected':'')+(inStock?'':' sold-out')} onClick={()=>inStock&&setSize(s.label)} disabled={!inStock} aria-pressed={size===s.label}>{s.label}{!inStock?<small>Sold out</small>:null}</button>})}</div>
    {!size?<small className="size-required">{variantMode&&!color?'Select a colour first.':'Please select a size before adding to bag.'}</small>:<small>Selected: <strong>{color?`${color} · `:''}{size}</strong>{selectedVariant?.sku?` · SKU ${selectedVariant.sku}`:''}</small>}
    {selectedVariant&&selectedVariant.track_inventory?<small className="stock-hint">{available?(selectedVariant.stock_qty-selectedVariant.reserved_qty<=3?`Only ${selectedVariant.stock_qty-selectedVariant.reserved_qty} left`:'In stock'):'Sold out'}</small>:null}
   </div>
   <button className="checkout-pay add-bag-btn" onClick={addBag} disabled={!size||!available||(variantMode&&!color)}>{added?<><Check/> Added to LOLA bag</>:<><ShoppingBag/> Add {size?size+' ':''}to bag</>}</button>
   <div className="detail-actions">{product.amazon?<a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Shop on Amazon <ArrowUpRight/></a>:null}{product.flipkart?<a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Shop on Flipkart <ArrowUpRight/></a>:null}</div>
   <Link className="btn btn-dark detail-back" href="/cart">View LOLA bag <ArrowUpRight/></Link>
 </div>;
}
export {sizes};
