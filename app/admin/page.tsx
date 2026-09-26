'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  BarChart3, Package, Layers3, Boxes, ShoppingCart, Users, TicketPercent,
  WalletCards, Settings, ExternalLink, LogOut, Plus, Pencil, Trash2, Save,
  X, Images, Upload, Search, CheckCircle2, Ban
} from 'lucide-react';
import { products as demoProducts } from '@/data/products';

type Product={id:string|number;name:string;slug?:string;price:number;mrp:number;rating:number;reviews:number|string;description?:string;image_url?:string;image_urls?:string[];categories?:string[];amazon_url?:string;flipkart_url?:string;featured?:boolean;active?:boolean;sort_order?:number};
type Category={id:string;name:string;slug:string;description:string;active:boolean;sort_order:number};
type Inventory={product_id:string;stock_qty:number;reserved_qty:number;low_stock_threshold:number;track_inventory:boolean;products?:Product};
type Coupon={id:string;code:string;description:string;discount_type:'percent'|'fixed';discount_value:number;minimum_order_value:number;maximum_discount:number|null;usage_limit:number|null;used_count:number;starts_at:string|null;expires_at:string|null;active:boolean};
type Settings={brand_name:string;shipping_message:string;instagram_url:string;whatsapp_url:string;contact_email:string;amazon_seller_url:string;flipkart_seller_url:string;shipping_fee:number;free_shipping_threshold:number;platform_fee:number;gst_rate:number};

const emptyProduct:Product={id:'new',name:'',slug:'',price:599,mrp:899,rating:4.5,reviews:0,description:'',image_url:'',image_urls:[],categories:[],amazon_url:'',flipkart_url:'',featured:true,active:true,sort_order:0};
const defaultSettings:Settings={brand_name:'LOLA ENGLAND',shipping_message:'FREE SHIPPING ON ORDERS OVER ₹799',instagram_url:'',whatsapp_url:'',contact_email:'',amazon_seller_url:'',flipkart_seller_url:'',shipping_fee:40,free_shipping_threshold:799,platform_fee:10,gst_rate:5};

const nav=[
  ['overview','Overview',BarChart3],['products','Products',Package],['categories','Categories',Layers3],
  ['inventory','Inventory',Boxes],['orders','Orders',ShoppingCart],['customers','Customers',Users],
  ['coupons','Coupons',TicketPercent],['payments','Payments',WalletCards],['settings','Website settings',Settings]
] as const;

export default function AdminPage(){
  const [tab,setTab]=useState('overview');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const [products,setProducts]=useState<Product[]>(demoProducts as Product[]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [inventory,setInventory]=useState<Inventory[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [customers,setCustomers]=useState<any[]>([]);
  const [coupons,setCoupons]=useState<Coupon[]>([]);
  const [settings,setSettings]=useState<Settings>(defaultSettings);
  const [editingProduct,setEditingProduct]=useState<Product|null>(null);
  const [editingCategory,setEditingCategory]=useState<Category|null>(null);
  const [editingCoupon,setEditingCoupon]=useState<Coupon|null>(null);
  const [search,setSearch]=useState('');
  const [uploading,setUploading]=useState(false);
  const [exporting,setExporting]=useState(false);

  const api=async(path:string,options?:RequestInit)=>{
    const r=await fetch(path,{cache:'no-store',...options});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.error||'Request failed');
    return d;
  };

  async function refresh(){
    try{
      const [p,c,i,o,cu,co,s]=await Promise.all([
        api('/api/admin/products'),api('/api/admin/categories'),api('/api/admin/inventory'),
        api('/api/admin/orders'),api('/api/admin/customers'),api('/api/admin/coupons'),api('/api/admin/settings')
      ]);
      setProducts((p.products||[]).map((x:Product)=>({...x,image_urls:Array.isArray(x.image_urls)?x.image_urls:(x.image_url?[x.image_url]:[]),categories:Array.isArray(x.categories)?x.categories:[] })));
      setCategories(c.categories||[]);setInventory(i.inventory||[]);setOrders(o.orders||[]);setCustomers(cu.customers||[]);setCoupons(co.coupons||[]);setSettings({...defaultSettings,...s.settings});
    }catch(e){setMessage(e instanceof Error?e.message:'Could not load admin data.');}
  }
  useEffect(()=>{refresh()},[]);

  async function saveProduct(){
    if(!editingProduct?.name.trim()) return setMessage('Product name is required.');
    if(editingProduct.mrp<editingProduct.price) return setMessage('MRP must be equal to or higher than price.');
    setLoading(true);setMessage('');
    try{
      const isNew=editingProduct.id==='new';
      const urls=(editingProduct.image_urls||[]).filter(Boolean).slice(0,12);
      await api(isNew?'/api/admin/products':'/api/admin/products/'+editingProduct.id,{method:isNew?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...editingProduct,image_urls:urls,image_url:urls[0]||''})});
      setEditingProduct(null);setMessage('Product saved successfully.');await refresh();
    }catch(e){setMessage(e instanceof Error?e.message:'Could not save product.');}finally{setLoading(false);}
  }
  async function deleteProduct(id:string|number){
    if(!confirm('Delete this product permanently?'))return;
    try{await api('/api/admin/products/'+id,{method:'DELETE'});setMessage('Product deleted.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Delete failed.');}
  }
  async function uploadImages(files:File[]){
    if(!editingProduct||!files.length)return;
    const remaining=12-(editingProduct.image_urls?.length||0);
    if(remaining<=0)return setMessage('Maximum 12 images reached.');
    setUploading(true);
    try{
      const urls:string[]=[];
      for(const file of files.slice(0,remaining)){const form=new FormData();form.append('file',file);const d=await api('/api/admin/upload',{method:'POST',body:form});urls.push(d.url);}
      setEditingProduct(p=>p?{...p,image_urls:[...(p.image_urls||[]),...urls],image_url:(p.image_urls?.[0]||urls[0]||'')}:p);
      setMessage('Images uploaded. Save the product to publish them.');
    }catch(e){setMessage(e instanceof Error?e.message:'Image upload failed.');}finally{setUploading(false);}
  }

  async function saveCategory(){
    if(!editingCategory?.name.trim())return setMessage('Category name is required.');
    setLoading(true);
    try{await api('/api/admin/categories',{method:editingCategory.id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(editingCategory)});setEditingCategory(null);setMessage('Category saved.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Could not save category.');}finally{setLoading(false);}
  }
  async function deleteCategory(id:string){if(!confirm('Delete this category? Products using its slug will remain but the category will disappear from the catalogue.'))return;try{await api('/api/admin/categories',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});setMessage('Category deleted.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Delete failed.');}}

  async function saveInventory(x:Inventory){
    try{await api('/api/admin/inventory',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)});setMessage('Inventory updated.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Could not update inventory.');}
  }

  async function saveCoupon(){
    if(!editingCoupon?.code.trim())return setMessage('Coupon code is required.');
    setLoading(true);
    try{await api('/api/admin/coupons',{method:editingCoupon.id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(editingCoupon)});setEditingCoupon(null);setMessage('Coupon saved.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Could not save coupon.');}finally{setLoading(false);}
  }
  async function deleteCoupon(id:string){if(!confirm('Delete this coupon?'))return;try{await api('/api/admin/coupons',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});setMessage('Coupon deleted.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Delete failed.');}}

  async function updateOrder(id:string,status:string,utr?:string){
    try{await api('/api/admin/orders',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status,utr})});setMessage(status==='paid'?'Payment verified.':'Order updated.');await refresh();}catch(e){setMessage(e instanceof Error?e.message:'Could not update order.');}
  }

  async function saveSettings(){
    setLoading(true);
    try{const d=await api('/api/admin/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});setSettings(d.settings);setMessage('Website settings saved.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save settings.');}finally{setLoading(false);}
  }
  async function logout(){await fetch('/api/admin/logout',{method:'POST'});window.location.href='/admin/login';}
  async function exportData(type:'xlsx'|'pdf',dataset:'customers'|'orders'|'products'|'inventory'|'all'){
    setExporting(true); setMessage('');
    try{
      const d=await api('/api/admin/export');
      const rows:any=(d as any)[dataset];
      const stamp=new Date().toISOString().slice(0,10);
      if(type==='xlsx'){
        const wb=XLSX.utils.book_new();
        const add=(name:string,data:any[])=>{const ws=XLSX.utils.json_to_sheet(data);XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));};
        if(dataset==='all'){add('Customers',d.customers);add('Orders',d.orders);add('Products',d.products);add('Inventory',d.inventory);}
        else add(dataset.charAt(0).toUpperCase()+dataset.slice(1),rows||[]);
        XLSX.writeFile(wb,'LOLA-ENGLAND-'+dataset+'-'+stamp+'.xlsx');
      }else{
        const doc=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'});
        const sections:any[] = dataset==='all' ? [['Customers',d.customers],['Orders',d.orders],['Products',d.products],['Inventory',d.inventory]] : [[dataset.charAt(0).toUpperCase()+dataset.slice(1),rows||[]]];
        sections.forEach((section,idx)=>{
          if(idx)doc.addPage();
          doc.setFontSize(16);doc.text('LOLA ENGLAND — '+section[0],40,40);
          const data=section[1]||[]; if(!data.length){doc.setFontSize(10);doc.text('No records.',40,65);return;}
          const headers=Object.keys(data[0]).slice(0,10); const startY=65; const rowH=18; const colW=740/Math.max(headers.length,1);
          doc.setFontSize(7);
          headers.forEach((h,i)=>doc.text(String(h).slice(0,18),40+i*colW,startY));
          data.slice(0,45).forEach((row:any,ri:number)=>headers.forEach((h,i)=>doc.text(String(row[h]??'').replace(/\\s+/g,' ').slice(0,20),40+i*colW,startY+(ri+1)*rowH)));
          if(data.length>45)doc.text('Showing first 45 rows of '+data.length+'. Use Excel for the complete dataset.',40,820);
        });
        doc.save('LOLA-ENGLAND-'+dataset+'-'+stamp+'.pdf');
      }
      setMessage((dataset==='all'?'All data':dataset)+' exported as '+type.toUpperCase()+'.');
    }catch(e){setMessage(e instanceof Error?e.message:'Export failed.');}finally{setExporting(false);}
  }

  const filteredProducts=useMemo(()=>products.filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase())),[products,search]);
  const lowStock=inventory.filter(x=>x.track_inventory&&x.stock_qty-x.reserved_qty<=x.low_stock_threshold).length;
  const paidOrders=orders.filter(x=>x.status==='paid').length;
  const revenue=orders.filter(x=>x.status==='paid').reduce((s,x)=>s+Number(x.total_amount||x.amount||0),0);

  const field=(label:string,value:any,onChange:(v:string)=>void,type='text')=><label>{label}<input type={type} value={value??''} onChange={e=>onChange(e.target.value)}/></label>;
  const title=nav.find(n=>n[0]===tab)?.[1]||'Admin';

  return <div className="admin-shell">
    <aside>
      <div className="admin-logo">LOLA <small>OWNER</small></div>
      {nav.map(([key,label,Icon])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><Icon/>{label}</button>)}
      <a href="/"><ExternalLink/> View store</a>
      <button onClick={logout}><LogOut/> Logout</button>
    </aside>
    <section className="admin-main">
      <div className="admin-top"><div><p className="eyebrow">PRIVATE OWNER AREA</p><h1>{title}</h1></div><span className="secure">DATABASE CONNECTED</span></div>
      {message&&<div className="admin-message">{message}</div>}

      {tab==='overview'&&<><div className="admin-card"><div className="admin-row"><div><h2>Data exports</h2><p>Download owner data for printing, accounting or offline records.</p></div><div className="admin-actions"><button className="admin-btn" disabled={exporting} onClick={()=>exportData('xlsx','all')}>Download Excel</button><button className="admin-btn" disabled={exporting} onClick={()=>exportData('pdf','all')}>Download PDF</button></div></div></div><div className="stats">
        <div><span>Products</span><strong>{products.length}</strong></div><div><span>Paid orders</span><strong>{paidOrders}</strong></div>
        <div><span>Customers</span><strong>{customers.length}</strong></div><div><span>Revenue</span><strong>₹{revenue.toLocaleString('en-IN')}</strong></div>
      </div><div className="admin-card"><h2>Store control centre</h2><p>Products, categories, stock, orders, customers, coupons, payments and website settings are all managed from this owner-only panel.</p><div className="admin-actions">
        <button className="admin-btn" onClick={()=>setTab('products')}>Add / edit products</button><button className="admin-btn ghost" onClick={()=>setTab('orders')}>Open orders</button>
      </div></div><div className="stats">
        <div><span>Low stock items</span><strong>{lowStock}</strong></div><div><span>Active coupons</span><strong>{coupons.filter(c=>c.active).length}</strong></div><div><span>Pending payments</span><strong>{orders.filter(o=>o.status==='payment_submitted'||o.status==='awaiting_payment').length}</strong></div><div><span>Live products</span><strong>{products.filter(p=>p.active!==false).length}</strong></div>
      </div></>}

      {tab==='products'&&<><div className="admin-card"><div className="admin-row"><div><h2>Products</h2><p>Add, edit, hide or delete products. Upload up to 12 images per product.</p></div><div className="admin-actions"><button className="admin-btn ghost" disabled={exporting} onClick={()=>exportData('xlsx','products')}>Excel</button><button className="admin-btn ghost" disabled={exporting} onClick={()=>exportData('pdf','products')}>PDF</button><button className="admin-btn" onClick={()=>setEditingProduct({...emptyProduct})}><Plus/> Add product</button></div></div><div className="admin-search"><Search size={16}/><input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      {filteredProducts.map(p=><div className="product-row" key={String(p.id)}>{p.image_url?<img className="admin-thumb" src={p.image_url} alt=""/>:<div className="admin-thumb placeholder">TEE</div>}<span><b>{p.name}</b><small>{p.active===false?'Hidden':'Live'} · {(p.image_urls||[]).length} images · {(p.categories||[]).join(', ')||'No category'}</small></span><b>₹{p.price}</b><div className="product-actions"><button onClick={()=>setEditingProduct({...p,image_urls:p.image_urls||[]})}><Pencil size={15}/></button><button onClick={()=>deleteProduct(p.id)}><Trash2 size={15}/></button></div></div>)}
      </div>
      {editingProduct&&<div className="admin-card"><div className="admin-row"><div><h2>{editingProduct.id==='new'?'Add product':'Edit product'}</h2><p>Front, Back, Side and extra product views can all be stored.</p></div><div className="admin-actions"><button className="admin-btn ghost" onClick={()=>setEditingProduct(null)}><X/> Cancel</button><button className="admin-btn" disabled={loading||uploading} onClick={saveProduct}><Save/> Save</button></div></div>
        <div className="gallery-uploader"><div className="gallery-header"><div><b>Product images</b><span>{editingProduct.image_urls?.length||0}/12</span></div><label className="admin-btn upload-label"><Images/> Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const f=Array.from(e.target.files||[]);if(f.length)uploadImages(f);e.currentTarget.value=''}}/></label></div><div className="gallery-grid">{(editingProduct.image_urls||[]).map((u,i)=><div className="gallery-item" key={u+i}><img src={u} alt=""/><span>{i===0?'FRONT':i===1?'BACK':i===2?'SIDE':'VIEW '+(i+1)}</span><button onClick={()=>setEditingProduct(p=>p?{...p,image_urls:(p.image_urls||[]).filter((_,n)=>n!==i),image_url:(p.image_urls||[]).filter((_,n)=>n!==i)[0]||''}:p)}><X size={14}/></button></div>)}</div></div>
        <div className="admin-form-grid">
          {field('Product name',editingProduct.name,v=>setEditingProduct({...editingProduct,name:v}))}
          {field('Slug',editingProduct.slug,v=>setEditingProduct({...editingProduct,slug:v}))}
          {field('Selling price ₹',editingProduct.price,v=>setEditingProduct({...editingProduct,price:Number(v)}),'number')}
          {field('MRP ₹',editingProduct.mrp,v=>setEditingProduct({...editingProduct,mrp:Number(v)}),'number')}
          {field('Rating',editingProduct.rating,v=>setEditingProduct({...editingProduct,rating:Number(v)}),'number')}
          {field('Reviews',editingProduct.reviews,v=>setEditingProduct({...editingProduct,reviews:Number(v)}),'number')}
          {field('Sort order',editingProduct.sort_order||0,v=>setEditingProduct({...editingProduct,sort_order:Number(v)}),'number')}
          <label>Visibility<select value={editingProduct.active===false?'hidden':'live'} onChange={e=>setEditingProduct({...editingProduct,active:e.target.value==='live'})}><option value="live">Live</option><option value="hidden">Hidden</option></select></label>
          <label className="wide">Description<textarea value={editingProduct.description||''} onChange={e=>setEditingProduct({...editingProduct,description:e.target.value})}/></label>
          <div className="wide category-picker"><b>Categories</b><div>{categories.map(c=><label key={c.id}><input type="checkbox" checked={editingProduct.categories?.includes(c.slug)||false} onChange={e=>{const s=new Set(editingProduct.categories||[]);e.target.checked?s.add(c.slug):s.delete(c.slug);setEditingProduct({...editingProduct,categories:[...s]})}}/>{c.name}</label>)}</div></div>
          {field('Amazon product URL',editingProduct.amazon_url,v=>setEditingProduct({...editingProduct,amazon_url:v}))}
          {field('Flipkart product URL',editingProduct.flipkart_url,v=>setEditingProduct({...editingProduct,flipkart_url:v}))}
        </div>
      </div>}</>}

      {tab==='categories'&&<div className="admin-card"><div className="admin-row"><div><h2>Categories</h2><p>Create and manage the catalogue sections shown on the website.</p></div><button className="admin-btn" onClick={()=>setEditingCategory({id:'',name:'',slug:'',description:'',active:true,sort_order:0})}><Plus/> Add category</button></div>
      {categories.map(c=><div className="product-row" key={c.id}><span><b>{c.name}</b><small>/{c.slug} · {c.active?'Live':'Hidden'}</small></span><b>{c.sort_order}</b><div className="product-actions"><button onClick={()=>setEditingCategory(c)}><Pencil size={15}/></button><button onClick={()=>deleteCategory(c.id)}><Trash2 size={15}/></button></div></div>)}
      {editingCategory&&<div className="admin-form-grid">{field('Name',editingCategory.name,v=>setEditingCategory({...editingCategory,name:v}))}{field('Slug',editingCategory.slug,v=>setEditingCategory({...editingCategory,slug:v}))}{field('Sort order',editingCategory.sort_order,v=>setEditingCategory({...editingCategory,sort_order:Number(v)}),'number')}<label>Visibility<select value={editingCategory.active?'live':'hidden'} onChange={e=>setEditingCategory({...editingCategory,active:e.target.value==='live'})}><option value="live">Live</option><option value="hidden">Hidden</option></select></label><label className="wide">Description<textarea value={editingCategory.description} onChange={e=>setEditingCategory({...editingCategory,description:e.target.value})}/></label></div>}
      {editingCategory&&<button className="admin-btn" onClick={saveCategory} disabled={loading}><Save/> Save category</button>}</div>}

      {tab==='inventory'&&<div className="admin-card"><div className="admin-row"><div><h2>Inventory</h2><p>Track stock, reserved quantity and low-stock alerts for every product.</p></div><div className="admin-actions"><button className="admin-btn" disabled={exporting} onClick={()=>exportData('xlsx','inventory')}>Excel</button><button className="admin-btn" disabled={exporting} onClick={()=>exportData('pdf','inventory')}>PDF</button></div></div>
      {inventory.map(x=><div className="inventory-row" key={x.product_id}><div><b>{x.products?.name||x.product_id}</b><small>Available: {Math.max(0,x.stock_qty-x.reserved_qty)} · Reserved: {x.reserved_qty}</small></div><label>Stock<input type="number" min="0" value={x.stock_qty} onChange={e=>setInventory(a=>a.map(y=>y.product_id===x.product_id?{...y,stock_qty:Number(e.target.value)}:y))}/></label><label>Low stock<input type="number" min="0" value={x.low_stock_threshold} onChange={e=>setInventory(a=>a.map(y=>y.product_id===x.product_id?{...y,low_stock_threshold:Number(e.target.value)}:y))}/></label><button className="admin-btn ghost" onClick={()=>saveInventory(x)}><Save/></button></div>)}
      {products.filter(p=>!inventory.some(x=>x.product_id===p.id)).map(p=><div className="inventory-row" key={String(p.id)}><div><b>{p.name}</b><small>No inventory record yet.</small></div><button className="admin-btn" onClick={()=>saveInventory({product_id:String(p.id),stock_qty:0,reserved_qty:0,low_stock_threshold:5,track_inventory:true})}>Initialize</button></div>)}</div>}

      {tab==='orders'&&<div className="admin-card"><div className="admin-row"><div><h2>Orders</h2><p>Review customer details, payment status, charges and UTR. Customer never has to type the UTR.</p></div><div className="admin-actions"><button className="admin-btn ghost" onClick={refresh}>Refresh</button><button className="admin-btn" disabled={exporting} onClick={()=>exportData('xlsx','orders')}>Excel</button><button className="admin-btn" disabled={exporting} onClick={()=>exportData('pdf','orders')}>PDF</button></div></div>
      {orders.map(o=><div className="order-admin-row" key={o.id}><div><b>{o.customer_name} · ₹{Number(o.total_amount||o.amount||0).toLocaleString('en-IN')}</b><small>{String(o.status).toUpperCase()} · {new Date(o.created_at).toLocaleString('en-IN')} · {o.customer_phone}</small><small>{o.customer_email||'No email'} · {o.shipping_address}</small><small>Subtotal ₹{Number(o.subtotal||0).toLocaleString('en-IN')} · Shipping ₹{Number(o.shipping_fee||0).toLocaleString('en-IN')} · Platform ₹{Number(o.platform_fee||0).toLocaleString('en-IN')} · Discount ₹{Number(o.discount_amount||0).toLocaleString('en-IN')} · GST ₹{Number(o.gst_amount||0).toLocaleString('en-IN')}</small>{o.upi_transaction_id&&<small>UTR: <b>{o.upi_transaction_id}</b></small>}</div><div className="admin-actions">{o.status!=='paid'&&o.status!=='cancelled'&&<button className="admin-btn" onClick={()=>{const utr=prompt('Enter bank UTR / transaction reference');if(utr!==null)updateOrder(o.id,'paid',utr)}}><CheckCircle2/> Mark paid</button>}{o.status!=='cancelled'&&<button className="admin-btn ghost" onClick={()=>updateOrder(o.id,'cancelled')}><Ban/> Cancel</button>}</div></div>)}
      {!orders.length&&<p>No orders yet.</p>}</div>}

      {tab==='customers'&&<div className="admin-card"><div className="admin-row"><div><h2>Customers</h2><p>Every checkout creates or updates a persistent customer record. No customer login is required.</p></div><div className="admin-actions"><button className="admin-btn ghost" onClick={refresh}>Refresh</button><button className="admin-btn" disabled={exporting} onClick={()=>exportData('xlsx','customers')}>Excel</button><button className="admin-btn" disabled={exporting} onClick={()=>exportData('pdf','customers')}>PDF</button></div></div>
      {customers.map((c:any)=><div className="customer-row" key={c.id||c.key}><div><b>{c.name||'Customer'}</b><small>{c.phone} · {c.email||'No email'}</small><small>{c.shipping_address||c.address||'No address saved'}</small></div><div><b>{c.total_orders??c.orders??0} orders</b><small>₹{Number(c.total_spent??c.spent??0).toLocaleString('en-IN')} total</small></div></div>)}</div>}

      {tab==='coupons'&&<div className="admin-card"><div className="admin-row"><div><h2>Coupons & discounts</h2><p>Create percentage or fixed discounts, minimum order rules, caps, dates and usage limits.</p></div><button className="admin-btn" onClick={()=>setEditingCoupon({id:'',code:'',description:'',discount_type:'percent',discount_value:10,minimum_order_value:0,maximum_discount:null,usage_limit:null,used_count:0,starts_at:null,expires_at:null,active:true})}><Plus/> Add coupon</button></div>
      {coupons.map(c=><div className="product-row" key={c.id}><span><b>{c.code}</b><small>{c.discount_type==='percent'?c.discount_value+'%':'₹'+c.discount_value} off · Used {c.used_count}{c.usage_limit?'/'+c.usage_limit:''} · {c.active?'Active':'Disabled'}</small></span><b>₹{c.minimum_order_value}+</b><div className="product-actions"><button onClick={()=>setEditingCoupon(c)}><Pencil size={15}/></button><button onClick={()=>deleteCoupon(c.id)}><Trash2 size={15}/></button></div></div>)}
      {editingCoupon&&<div className="admin-form-grid">{field('Coupon code',editingCoupon.code,v=>setEditingCoupon({...editingCoupon,code:v.toUpperCase()}))}{field('Description',editingCoupon.description,v=>setEditingCoupon({...editingCoupon,description:v}))}<label>Discount type<select value={editingCoupon.discount_type} onChange={e=>setEditingCoupon({...editingCoupon,discount_type:e.target.value as 'percent'|'fixed'})}><option value="percent">Percentage</option><option value="fixed">Fixed ₹</option></select></label>{field('Discount value',editingCoupon.discount_value,v=>setEditingCoupon({...editingCoupon,discount_value:Number(v)}),'number')}{field('Minimum order ₹',editingCoupon.minimum_order_value,v=>setEditingCoupon({...editingCoupon,minimum_order_value:Number(v)}),'number')}{field('Maximum discount ₹',editingCoupon.maximum_discount??'',v=>setEditingCoupon({...editingCoupon,maximum_discount:v===''?null:Number(v)}),'number')}{field('Usage limit',editingCoupon.usage_limit??'',v=>setEditingCoupon({...editingCoupon,usage_limit:v===''?null:Number(v)}),'number')}<label>Active<select value={editingCoupon.active?'yes':'no'} onChange={e=>setEditingCoupon({...editingCoupon,active:e.target.value==='yes'})}><option value="yes">Active</option><option value="no">Disabled</option></select></label></div>}
      {editingCoupon&&<button className="admin-btn" onClick={saveCoupon} disabled={loading}><Save/> Save coupon</button>}</div>}

      {tab==='payments'&&<div className="admin-card"><h2>Payment & checkout</h2><p>Everything that changes the amount paid by customers is editable here.</p><div className="admin-form-grid">
        {field('Shipping fee ₹',settings.shipping_fee,v=>setSettings({...settings,shipping_fee:Number(v)}),'number')}
        {field('Free shipping threshold ₹',settings.free_shipping_threshold,v=>setSettings({...settings,free_shipping_threshold:Number(v)}),'number')}
        {field('Platform fee ₹',settings.platform_fee,v=>setSettings({...settings,platform_fee:Number(v)}),'number')}
        {field('GST rate %',settings.gst_rate,v=>setSettings({...settings,gst_rate:Number(v)}),'number')}
      </div><button className="admin-btn" onClick={saveSettings} disabled={loading}><Save/> Save payment settings</button><div className="payment-note"><b>UPI:</b> customers get the exact QR amount. The owner verifies payment and records the bank UTR in Orders. No customer UTR field is used.</div></div>}

      {tab==='settings'&&<div className="admin-card"><h2>Website settings</h2><p>Brand, contact, social, marketplace and checkout messaging.</p><div className="admin-form-grid">
        {field('Brand name',settings.brand_name,v=>setSettings({...settings,brand_name:v}))}{field('Shipping message',settings.shipping_message,v=>setSettings({...settings,shipping_message:v}))}
        {field('Contact email',settings.contact_email,v=>setSettings({...settings,contact_email:v}),'email')}{field('Instagram URL',settings.instagram_url,v=>setSettings({...settings,instagram_url:v}),'url')}
        {field('WhatsApp URL',settings.whatsapp_url,v=>setSettings({...settings,whatsapp_url:v}),'url')}{field('Amazon seller URL',settings.amazon_seller_url,v=>setSettings({...settings,amazon_seller_url:v}),'url')}
        {field('Flipkart seller URL',settings.flipkart_seller_url,v=>setSettings({...settings,flipkart_seller_url:v}),'url')}
      </div><button className="admin-btn" onClick={saveSettings} disabled={loading}><Save/> Save website settings</button></div>}
    </section>
  </div>;
}
