'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ExternalLink, Package, Settings, ShoppingBag, Plus, Pencil, Trash2, Save, LogOut, Upload, X, Images, WalletCards } from 'lucide-react';
import { products as demoProducts } from '@/data/products';

type Product = {
  id: string | number;
  name: string;
  slug?: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number | string;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  categories?: string[];
  amazon_url?: string;
  flipkart_url?: string;
  featured?: boolean;
  active?: boolean;
  sort_order?: number;
};

type StoreSettings = {
  brand_name: string;
  shipping_message: string;
  instagram_url: string;
  whatsapp_url: string;
  contact_email: string;
  amazon_seller_url: string;
  flipkart_seller_url: string;
};

const emptyProduct: Product = {
  id: 'new', name: '', slug: '', price: 599, mrp: 899, rating: 4.5, reviews: 0,
  description: '', image_url: '', image_urls: [], categories: ['everyday'],
  amazon_url: '', flipkart_url: '', featured: true, active: true, sort_order: 0,
};

const defaultSettings: StoreSettings = {
  brand_name: 'LOLA ENGLAND',
  shipping_message: 'FREE SHIPPING ON ORDERS OVER ₹799',
  instagram_url: '', whatsapp_url: '', contact_email: '',
  amazon_seller_url: '', flipkart_seller_url: '',
};

const sections = [
  { key: 'all', label: 'All Tees' },
  { key: 'oversized', label: 'Oversized' },
  { key: 'graphics', label: 'Graphics' },
  { key: 'everyday', label: 'Everyday' },
] as const;

const categoryOptions = sections.slice(1);

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [catalogSection, setCatalogSection] = useState('all');
  const [items, setItems] = useState<Product[]>(demoProducts as Product[]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);\n  const [orders, setOrders] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({id:'',name:'',key_id:'',secret_key:'',upi_id:'',active:true,sort_order:0});

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setItems((data.products ?? []).map((p: Product) => ({
        ...p,
        image_urls: Array.isArray(p.image_urls) ? p.image_urls : (p.image_url ? [p.image_url] : []),
        categories: Array.isArray(p.categories) ? p.categories : [],
      })));
      setConnected(true);
    } catch {}
  }

  async function loadSettings() {
    try {
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setSettings(data.settings ?? defaultSettings);
    } catch {}
  }

  async function loadPayments() { try { const response=await fetch('/api/admin/payments',{cache:'no-store'}); if(!response.ok)return; const data=await response.json(); setPaymentAccounts(data.accounts||[]); } catch {} }\n  async function loadOrders() { try { const response=await fetch('/api/admin/orders',{cache:'no-store'}); if(!response.ok)return; const data=await response.json(); setOrders(data.orders||[]); } catch {} }
  useEffect(() => { loadProducts(); loadSettings(); loadPayments(); loadOrders(); }, []);
  async function savePaymentAccount() {
    setLoading(true); setMessage('');
    const method=paymentForm.id?'PUT':'POST';
    const response=await fetch('/api/admin/payments',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(paymentForm)});
    const data=await response.json(); setLoading(false);
    if(!response.ok)return setMessage(data.error||'Could not save payment account.');
    setPaymentForm({id:'',name:'',key_id:'',secret_key:'',upi_id:'',active:false,sort_order:paymentAccounts.length}); await loadPayments(); setMessage('Payment account saved securely.');
  }
  async function deletePaymentAccount(id:string){ if(!confirm('Remove this payment account?'))return; const response=await fetch('/api/admin/payments',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); if(response.ok){await loadPayments();setMessage('Payment account removed.');} }


  async function saveProduct() {
    if (!editing?.name.trim()) return setMessage('Product name is required.');
    if (editing.mrp < editing.price) return setMessage('MRP must be equal to or higher than price.');
    const imageUrls = (editing.image_urls ?? []).filter(Boolean).slice(0, 12);
    setLoading(true); setMessage('');
    const isNew = editing.id === 'new';
    const payload = { ...editing, image_urls: imageUrls, image_url: imageUrls[0] ?? '' };
    const response = await fetch(isNew ? '/api/admin/products' : `/api/admin/products/${editing.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setMessage(data.error || 'Could not save product.');
    setEditing(null); setMessage('Product saved.'); await loadProducts();
  }

  async function removeProduct(id: string | number) {
    if (!confirm('Delete this product permanently?')) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (response.ok) { setMessage('Product deleted.'); await loadProducts(); }
    else { const data = await response.json(); setMessage(data.error || 'Delete failed.'); }
  }

  async function uploadImages(files: File[]) {
    if (!files.length || !editing) return;
    const remaining = Math.max(0, 12 - (editing.image_urls?.length ?? 0));
    if (!remaining) return setMessage('Maximum 12 product images reached.');
    const selected = files.slice(0, remaining);
    setUploading(true); setMessage(`Uploading ${selected.length} image${selected.length > 1 ? 's' : ''}…`);
    const uploaded: string[] = [];
    for (const file of selected) {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) {
        setUploading(false);
        return setMessage(data.error || `Upload failed for ${file.name}.`);
      }
      uploaded.push(data.url);
    }
    setUploading(false);
    setEditing(current => {
      if (!current) return current;
      const image_urls = [...(current.image_urls ?? []), ...uploaded].slice(0, 12);
      return { ...current, image_urls, image_url: image_urls[0] ?? '' };
    });
    setMessage(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} added. Save the product to keep them.`);
  }

  function removeImage(index: number) {
    setEditing(current => {
      if (!current) return current;
      const image_urls = (current.image_urls ?? []).filter((_, i) => i !== index);
      return { ...current, image_urls, image_url: image_urls[0] ?? '' };
    });
  }

  async function saveStoreSettings() {
    setLoading(true); setMessage('');
    const response = await fetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings),
    });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.error || 'Could not save settings.');
    setSettings(data.settings); setMessage('Store settings saved.');
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  const filteredItems = useMemo(() => catalogSection === 'all'
    ? items
    : items.filter(product => product.categories?.includes(catalogSection)), [items, catalogSection]);

  const field = (label: string, value: string | number, onChange: (value: string) => void, type = 'text') => (
    <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>
  );

  return (
    <div className="admin-shell">
      <aside>
        <div className="admin-logo">LOLA <small>OWNER</small></div>
        <button onClick={() => setTab('overview')} className={tab === 'overview' ? 'active' : ''}><BarChart3 /> Overview</button>
        <button onClick={() => setTab('products')} className={tab === 'products' ? 'active' : ''}><Package /> Products</button>
        <button onClick={() => setTab('marketplaces')} className={tab === 'marketplaces' ? 'active' : ''}><ShoppingBag /> Marketplaces</button>
        <button onClick={() => setTab('payments')} className={tab === 'payments' ? 'active' : ''}><WalletCards /> Payments</button>
        <button onClick={() => setTab('settings')} className={tab === 'settings' ? 'active' : ''}><Settings /> Store settings</button>
        <a href="/"><ExternalLink /> View store</a>
        <button onClick={logout}><LogOut /> Logout</button>
      </aside>

      <section className="admin-main">
        <div className="admin-top">
          <div><p className="eyebrow">PRIVATE OWNER AREA</p><h1>{tab === 'overview' ? 'Good evening.' : tab === 'products' ? 'Products'  : tab === 'marketplaces' ? 'Marketplace links' : tab === 'payments' ? 'Payment methods' : 'Store settings'}</h1></div>
          <span className="secure">{connected ? 'DATABASE CONNECTED' : 'DEMO MODE'}</span>
        </div>
        {message && <div className="admin-message">{message}</div>}

        {tab === 'overview' && (
          <>
            <div className="stats">
              <div><span>Products</span><strong>{String(items.length).padStart(2, '0')}</strong></div>
              <div><span>Live listings</span><strong>{String(items.filter((p) => p.active !== false).length).padStart(2, '0')}</strong></div>
              <div><span>Amazon links</span><strong>{String(items.filter((p) => p.amazon_url).length).padStart(2, '0')}</strong></div>
              <div><span>Flipkart links</span><strong>{String(items.filter((p) => p.flipkart_url).length).padStart(2, '0')}</strong></div>
            </div>
            <div className="admin-card"><h2>Quick actions</h2><p>Manage products, prices, images, descriptions, categories and marketplace links from one place.</p><button className="admin-btn" onClick={() => setTab('products')}>Manage products →</button></div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="admin-card">
              <div className="admin-row">
                <div><h2>Product catalogue</h2><p>One product can have up to 12 images. The first image is Front, second is Back, third is Side.</p></div>
                <button className="admin-btn" onClick={() => setEditing({ ...emptyProduct })}><Plus /> Add product</button>
              </div>
              <div className="catalog-tabs">
                {sections.map(section => (
                  <button key={section.key} className={catalogSection === section.key ? 'active' : ''} onClick={() => setCatalogSection(section.key)}>
                    {section.label} <span>{section.key === 'all' ? items.length : items.filter(p => p.categories?.includes(section.key)).length}</span>
                  </button>
                ))}
              </div>
              <div className="catalog-heading">{sections.find(s => s.key === catalogSection)?.label}</div>
              {filteredItems.map((product) => {
                const images = product.image_urls?.length ? product.image_urls : (product.image_url ? [product.image_url] : []);
                return <div className="product-row" key={String(product.id)}>
                  {images[0] ? <img className="admin-thumb" src={images[0]} alt="" /> : <div className="admin-thumb placeholder">TEE</div>}
                  <span><b>{product.name}</b><small>{product.active === false ? 'Hidden' : 'Live'} · {images.length} image{images.length === 1 ? '' : 's'}</small></span>
                  <b>₹{product.price}</b>
                  <div className="product-actions"><button onClick={() => setEditing({ ...product, image_urls: images })} aria-label={`Edit ${product.name}`}><Pencil /></button><button onClick={() => removeProduct(product.id)} aria-label={`Delete ${product.name}`}><Trash2 /></button></div>
                </div>;
              })}
              {!filteredItems.length && <p className="empty-catalog">No products in this section yet.</p>}
            </div>

            {editing && (
              <div className="admin-card">
                <div className="admin-row"><div><h2>{editing.id === 'new' ? 'Add product' : 'Edit product'}</h2><p>Upload Front + Back together, then add Side or extra detail views whenever needed.</p></div><div className="admin-actions"><button className="admin-btn ghost" onClick={() => setEditing(null)}><X /> Cancel</button><button className="admin-btn" onClick={saveProduct} disabled={loading || uploading}><Save /> {loading ? 'Saving…' : 'Save product'}</button></div></div>

                <div className="gallery-uploader">
                  <div className="gallery-header"><div><b>Product image gallery</b><span>{editing.image_urls?.length ?? 0}/12 images</span></div><label className="admin-btn upload-label"><Images /> {uploading ? 'Uploading…' : 'Upload images'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={uploading} onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) uploadImages(files); event.currentTarget.value = ''; }} /></label></div>
                  <div className="gallery-grid">
                    {(editing.image_urls ?? []).map((url, index) => (
                      <div className="gallery-item" key={url + index}>
                        <img src={url} alt={`Product view ${index + 1}`} />
                        <span>{index === 0 ? 'FRONT' : index === 1 ? 'BACK' : index === 2 ? 'SIDE' : `VIEW ${index + 1}`}</span>
                        <button type="button" onClick={() => removeImage(index)} aria-label="Remove image"><X /></button>
                      </div>
                    ))}
                    {!editing.image_urls?.length && <div className="gallery-empty"><Upload /> Select multiple images to start the gallery.</div>}
                  </div>
                  <p className="gallery-help">Tip: select files in this order: <b>Front → Back → Side → extra views</b>. You can upload up to 12 images.</p>
                </div>

                <div className="admin-form-grid">
                  {field('Product name', editing.name, (v) => setEditing({ ...editing, name: v }))}
                  {field('Slug', editing.slug || '', (v) => setEditing({ ...editing, slug: v }))}
                  {field('Price', editing.price, (v) => setEditing({ ...editing, price: Number(v) }), 'number')}
                  {field('MRP', editing.mrp, (v) => setEditing({ ...editing, mrp: Number(v) }), 'number')}
                  {field('Rating', editing.rating, (v) => setEditing({ ...editing, rating: Number(v) }), 'number')}
                  {field('Reviews', editing.reviews, (v) => setEditing({ ...editing, reviews: Number(v) }), 'number')}
                  {field('Sort order', editing.sort_order || 0, (v) => setEditing({ ...editing, sort_order: Number(v) }), 'number')}
                  <label>Visibility<select value={editing.active === false ? 'hidden' : 'live'} onChange={(event) => setEditing({ ...editing, active: event.target.value === 'live' })}><option value="live">Live</option><option value="hidden">Hidden</option></select></label>
                  <label className="wide">Description<textarea value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label>
                  <div className="wide category-picker"><b>Catalogue sections</b><small>Choose where this tee should appear. All Tees is automatic.</small><div>{categoryOptions.map(option => <label key={option.key}><input type="checkbox" checked={editing.categories?.includes(option.key) ?? false} onChange={(event) => { const current = new Set(editing.categories ?? []); event.target.checked ? current.add(option.key) : current.delete(option.key); setEditing({ ...editing, categories: Array.from(current) }); }} />{option.label}</label>)}</div></div>
                  {field('Amazon listing URL', editing.amazon_url || '', (v) => setEditing({ ...editing, amazon_url: v }))}
                  {field('Flipkart listing URL', editing.flipkart_url || '', (v) => setEditing({ ...editing, flipkart_url: v }))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'marketplaces' && (
          <div className="admin-card">
            <div className="admin-row"><div><h2>Marketplace seller accounts</h2><p>Paste your official seller/store URLs here. These links are saved with your store settings.</p></div><button className="admin-btn" onClick={saveStoreSettings} disabled={loading}><Save /> {loading ? 'Saving…' : 'Save marketplace links'}</button></div>
            <div className="admin-form-grid">
              <label>Amazon Seller Account URL<input type="url" value={settings.amazon_seller_url} onChange={(event) => setSettings({ ...settings, amazon_seller_url: event.target.value })} placeholder="https://sellercentral.amazon.in/..." /></label>
              <label>Flipkart Seller Account URL<input type="url" value={settings.flipkart_seller_url} onChange={(event) => setSettings({ ...settings, flipkart_seller_url: event.target.value })} placeholder="https://seller.flipkart.com/..." /></label>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="admin-card">
            <div className="admin-row"><div><h2>Payment & checkout settings</h2><p>All customer-facing checkout charges are editable here. Changes apply to new orders.</p></div></div>
            <div className="admin-form-grid">
              <label>Shipping fee (₹)<input type="number" min="0" value={settings.shipping_fee} onChange={e=>setSettings({...settings,shipping_fee:Number(e.target.value)})}/></label>
              <label>Free shipping above (₹)<input type="number" min="0" value={settings.free_shipping_threshold} onChange={e=>setSettings({...settings,free_shipping_threshold:Number(e.target.value)})}/></label>
              <label>Platform fee (₹)<input type="number" min="0" value={settings.platform_fee} onChange={e=>setSettings({...settings,platform_fee:Number(e.target.value)})}/></label>
              <label>GST rate (%)<input type="number" min="0" max="100" step="0.01" value={settings.gst_rate} onChange={e=>setSettings({...settings,gst_rate:Number(e.target.value)})}/></label>
            </div>
            <button className="admin-btn" onClick={saveStoreSettings} disabled={loading}><Save/> {loading?'Saving…':'Save charges'}</button>
            <div className="payment-note"><b>Current defaults:</b> ₹40 shipping below ₹799, ₹10 platform fee, and 5% GST. For readymade apparel sold at a transaction value of ₹2,500 or less per piece, the current GST Council notification places apparel in the 5% slab. Confirm the tax treatment for your specific registration/HSN with your tax professional.</div>

            <div className="payment-form"><h3>UPI QR payment</h3><p>Customers see a QR for the exact final order amount. No UTR field is shown to customers. The owner verifies the payment from the bank/payment account and can record the UTR here.</p></div>
            <div className="payment-account-list">
              {orders.map(order=><div className="payment-account" key={order.id}>
                <div><b>{order.customer_name} · ₹{Number(order.total_amount||order.amount).toLocaleString('en-IN')}</b><small>{String(order.status).toUpperCase()} · {new Date(order.created_at).toLocaleString('en-IN')} · {order.customer_phone}</small><small>Subtotal ₹{Number(order.subtotal||0).toLocaleString('en-IN')} · Shipping ₹{Number(order.shipping_fee||0).toLocaleString('en-IN')} · Platform ₹{Number(order.platform_fee||0).toLocaleString('en-IN')} · GST ₹{Number(order.gst_amount||0).toLocaleString('en-IN')}</small></div>
                <div className="admin-actions">
                  <button className="admin-btn ghost" onClick={async()=>{const utr=prompt('Enter bank UTR / transaction reference:');if(utr===null)return;const res=await fetch('/api/admin/orders',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:order.id,utr,status:'paid'})});if(res.ok){await loadOrders();setMessage('Payment verified and UTR saved.');}else{const d=await res.json();setMessage(d.error||'Could not verify payment.');}}}>Mark paid + UTR</button>
                  {order.status!=='cancelled'?<button className="admin-btn ghost" onClick={async()=>{const res=await fetch('/api/admin/orders',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:order.id,status:'cancelled'})});if(res.ok){await loadOrders();setMessage('Order cancelled.');}}}>Cancel</button>:null}
                </div>
              </div>)}
              {!orders.length&&<p>No orders yet.</p>}
            </div>
          </div>
        )}

