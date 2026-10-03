'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Package} from 'lucide-react';
import {AdminVariantManager} from '@/components/admin-variant-manager';
import './variants.css';

type Product={id:string;name:string;active?:boolean};
export default function AdminVariantsPage(){
 const [products,setProducts]=useState<Product[]>([]); const [productId,setProductId]=useState(''); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{fetch('/api/admin/products',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Unauthorized');setProducts(d.products||[]);if(d.products?.[0])setProductId(String(d.products[0].id));}).catch(e=>setError(e instanceof Error?e.message:'Could not load products.')).finally(()=>setLoading(false));},[]);
 return <main className="variant-admin-page"><div className="variant-admin-wrap"><Link href="/admin" className="variant-back"><ArrowLeft size={16}/> Back to admin</Link><div className="variant-admin-hero"><div><p>LOLA ENGLAND · ADMIN</p><h1>Size × Color Inventory</h1><span>Control stock at the exact variant level customers purchase.</span></div><Package size={34}/></div>{loading?<div className="variant-admin-card">Loading products…</div>:error?<div className="variant-admin-card error">{error}<Link href="/admin/login">Open admin login</Link></div>:<><div className="variant-admin-card"><label>Select product<select value={productId} onChange={e=>setProductId(e.target.value)}>{products.map(p=><option key={p.id} value={p.id}>{p.name}{p.active===false?' · Hidden':''}</option>)}</select></label></div>{productId?<AdminVariantManager productId={productId}/>:<div className="variant-admin-card">No products found.</div>}</>}</div></main>;
}
