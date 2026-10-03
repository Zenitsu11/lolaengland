'use client';
import {useEffect,useState} from 'react';
import {Plus,Pencil,Trash2,Save,X} from 'lucide-react';

type Variant={id:string;product_id:string;size:string;color:string;color_hex:string|null;sku:string|null;stock_qty:number;reserved_qty:number;low_stock_threshold:number;track_inventory:boolean;active:boolean};
const SIZE_OPTIONS=['XS','S','M','L','XL','XXL','3XL'];
const empty=(productId:string):Variant=>({id:'new',product_id:productId,size:'M',color:'Default',color_hex:'#111111',sku:'',stock_qty:0,reserved_qty:0,low_stock_threshold:2,track_inventory:true,active:true});

export function AdminVariantManager({productId}:{productId:string}){
 const [variants,setVariants]=useState<Variant[]>([]); const [editing,setEditing]=useState<Variant|null>(null); const [loading,setLoading]=useState(false); const [message,setMessage]=useState('');
 async function api(path:string,options?:RequestInit){const r=await fetch(path,{cache:'no-store',...options});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Request failed');return d;}
 async function refresh(){try{const d=await api(`/api/admin/variants?product_id=${encodeURIComponent(productId)}`);setVariants(d.variants||[]);}catch(e){setMessage(e instanceof Error?e.message:'Could not load variants.');}}
 useEffect(()=>{refresh()},[productId]);
 async function save(){if(!editing)return;if(!editing.size||!editing.color.trim()){setMessage('Size and color are required.');return;}setLoading(true);setMessage('');try{const isNew=editing.id==='new';const d=await api('/api/admin/variants',{method:isNew?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editing)});setVariants(v=>isNew?[...v,d.variant]:v.map(x=>x.id===d.variant.id?d.variant:x));setEditing(null);setMessage('Variant saved.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save variant.');}finally{setLoading(false);}}
 async function remove(id:string){if(!confirm('Delete this size/color variant?'))return;try{await api('/api/admin/variants',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});setVariants(v=>v.filter(x=>x.id!==id));}catch(e){setMessage(e instanceof Error?e.message:'Could not delete variant.');}}
 return <div className="variant-manager">
   <div className="variant-manager-head"><div><b>Size × Color inventory</b><small>Each combination has its own stock, SKU and low-stock threshold.</small></div><button type="button" className="admin-btn" onClick={()=>setEditing(empty(productId))}><Plus/> Add variant</button></div>
   {message&&<small className="admin-inline-message">{message}</small>}
   {variants.length?<div className="variant-table"><div className="variant-table-head"><span>Size</span><span>Color</span><span>SKU</span><span>Stock</span><span>Available</span><span>Status</span><span></span></div>{variants.map(v=><div className="variant-row" key={v.id}><span><b>{v.size}</b></span><span><i className="variant-swatch" style={{background:v.color_hex||'#ddd'}}/>{v.color}</span><span>{v.sku||'—'}</span><span>{v.stock_qty}</span><span>{Math.max(0,v.stock_qty-v.reserved_qty)}</span><span>{v.active?(v.stock_qty-v.reserved_qty>0?'In stock':'Sold out'):'Hidden'}</span><span className="product-actions"><button type="button" onClick={()=>setEditing({...v})}><Pencil size={14}/></button><button type="button" onClick={()=>remove(v.id)}><Trash2 size={14}/></button></span></div>)}</div>:<p className="variant-empty">No variants configured yet. Add the actual size/color combinations you sell.</p>}
   {editing&&<div className="variant-editor"><div className="admin-row"><div><b>{editing.id==='new'?'Add variant':'Edit variant'}</b><small>Inventory is tracked independently for this combination.</small></div><button type="button" className="admin-btn ghost" onClick={()=>setEditing(null)}><X/></button></div><div className="admin-form-grid">
    <label>Size<select value={editing.size} onChange={e=>setEditing({...editing,size:e.target.value})}>{SIZE_OPTIONS.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Color<input value={editing.color} onChange={e=>setEditing({...editing,color:e.target.value})}/></label>
    <label>Color hex<input type="text" value={editing.color_hex||''} placeholder="#111111" onChange={e=>setEditing({...editing,color_hex:e.target.value})}/></label>
    <label>SKU<input value={editing.sku||''} onChange={e=>setEditing({...editing,sku:e.target.value})}/></label>
    <label>Stock qty<input type="number" min="0" value={editing.stock_qty} onChange={e=>setEditing({...editing,stock_qty:Number(e.target.value)})}/></label>
    <label>Reserved qty<input type="number" min="0" value={editing.reserved_qty} onChange={e=>setEditing({...editing,reserved_qty:Number(e.target.value)})}/></label>
    <label>Low-stock threshold<input type="number" min="0" value={editing.low_stock_threshold} onChange={e=>setEditing({...editing,low_stock_threshold:Number(e.target.value)})}/></label>
    <label>Active<select value={editing.active?'yes':'no'} onChange={e=>setEditing({...editing,active:e.target.value==='yes'})}><option value="yes">Active</option><option value="no">Hidden</option></select></label>
   </div><div className="admin-actions"><button type="button" className="admin-btn" disabled={loading} onClick={save}><Save/> Save variant</button><button type="button" className="admin-btn ghost" onClick={()=>setEditing(null)}>Cancel</button></div></div>}
 </div>;
}
