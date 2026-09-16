'use client';

import { useEffect, useState } from 'react';
import { BarChart3, ExternalLink, Package, Settings, ShoppingBag, Plus, Pencil, Trash2, Save, LogOut, Upload, X } from 'lucide-react';
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
};

const emptyProduct: Product = {
  id: 'new', name: '', slug: '', price: 0, mrp: 0, rating: 0, reviews: 0,
  description: '', image_url: '', amazon_url: '', flipkart_url: '', featured: true,
  active: true, sort_order: 0,
};

const defaultSettings: StoreSettings = {
  brand_name: 'LOLA ENGLAND',
  shipping_message: 'FREE SHIPPING ON ORDERS OVER ₹799',
  instagram_url: '', whatsapp_url: '', contact_email: '',
};

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [items, setItems] = useState<Product[]>(demoProducts as Product[]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setItems(data.products ?? []);
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

  useEffect(() => { loadProducts(); loadSettings(); }, []);

  async function saveProduct() {
    if (!editing?.name.trim()) return setMessage('Product name is required.');
    if (editing.mrp < editing.price) return setMessage('MRP must be equal to or higher than price.');
    setLoading(true); setMessage('');
    const isNew = editing.id === 'new';
    const response = await fetch(isNew ? '/api/admin/products' : `/api/admin/products/${editing.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
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

  async function uploadImage(file: File) {
    setUploading(true); setMessage('Uploading image…');
    const form = new FormData(); form.append('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await response.json(); setUploading(false);
    if (!response.ok) return setMessage(data.error || 'Image upload failed.');
    setEditing((current) => current ? { ...current, image_url: data.url } : current);
    setMessage('Image uploaded. Save the product to keep it.');
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
        <button onClick={() => setTab('settings')} className={tab === 'settings' ? 'active' : ''}><Settings /> Store settings</button>
        <a href="/"><ExternalLink /> View store</a>
        <button onClick={logout}><LogOut /> Logout</button>
      </aside>

      <section className="admin-main">
        <div className="admin-top">
          <div><p className="eyebrow">PRIVATE OWNER AREA</p><h1>{tab === 'overview' ? 'Good evening.' : tab === 'products' ? 'Products' : tab === 'marketplaces' ? 'Marketplace links' : 'Store settings'}</h1></div>
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
            <div className="admin-card"><h2>Quick actions</h2><p>Manage products, prices, images, descriptions and marketplace links from one place.</p><button className="admin-btn" onClick={() => setTab('products')}>Manage products →</button></div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="admin-card">
              <div className="admin-row"><div><h2>Product catalogue</h2><p>Products and images are stored in Supabase.</p></div><button className="admin-btn" onClick={() => setEditing({ ...emptyProduct })}><Plus /> Add product</button></div>
              {items.map((product) => (
                <div className="product-row" key={String(product.id)}>
                  {product.image_url ? <img className="admin-thumb" src={product.image_url} alt="" /> : <div className="admin-thumb placeholder">TEE</div>}
                  <span><b>{product.name}</b><small>{product.active === false ? 'Hidden' : 'Live'}</small></span>
                  <b>₹{product.price}</b>
                  <div><button onClick={() => setEditing({ ...product })} aria-label={`Edit ${product.name}`}><Pencil /></button>{product.id !== 'new' && <button onClick={() => removeProduct(product.id)} aria-label={`Delete ${product.name}`}><Trash2 /></button>}</div>
                </div>
              ))}
            </div>

            {editing && (
              <div className="admin-card">
                <div className="admin-row"><h2>{editing.id === 'new' ? 'Add product' : 'Edit product'}</h2><div className="admin-actions"><button className="admin-btn ghost" onClick={() => setEditing(null)}><X /> Cancel</button><button className="admin-btn" onClick={saveProduct} disabled={loading}><Save /> {loading ? 'Saving…' : 'Save product'}</button></div></div>
                <div className="image-uploader">
                  <div className="image-preview">{editing.image_url ? <img src={editing.image_url} alt="Product preview" /> : <span>No image</span>}</div>
                  <div><b>Product image</b><p>JPG, PNG or WebP · max 5 MB</p><label className="admin-btn upload-label"><Upload /> {uploading ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadImage(file); }} /></label>{editing.image_url && <button className="text-button" onClick={() => setEditing({ ...editing, image_url: '' })}>Remove image</button>}</div>
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
                  {field('Amazon listing URL', editing.amazon_url || '', (v) => setEditing({ ...editing, amazon_url: v }))}
                  {field('Flipkart listing URL', editing.flipkart_url || '', (v) => setEditing({ ...editing, flipkart_url: v }))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'marketplaces' && <div className="admin-card"><h2>Marketplace connections</h2><p>Add the official Amazon or Flipkart listing URL to each product. Buttons appear on the storefront only when a URL exists.</p><button className="admin-btn" onClick={() => setTab('products')}>Open product links →</button></div>}

        {tab === 'settings' && (
          <div className="admin-card">
            <div className="admin-row"><div><h2>Brand settings</h2><p>These settings are stored in Supabase.</p></div><button className="admin-btn" onClick={saveStoreSettings} disabled={loading}><Save /> {loading ? 'Saving…' : 'Save settings'}</button></div>
            <div className="admin-form-grid">
              {field('Brand name', settings.brand_name, (v) => setSettings({ ...settings, brand_name: v }))}
              {field('Shipping message', settings.shipping_message, (v) => setSettings({ ...settings, shipping_message: v }))}
              {field('Instagram URL', settings.instagram_url, (v) => setSettings({ ...settings, instagram_url: v }))}
              {field('WhatsApp URL', settings.whatsapp_url, (v) => setSettings({ ...settings, whatsapp_url: v }))}
              <label className="wide">Contact email<input type="email" value={settings.contact_email} onChange={(event) => setSettings({ ...settings, contact_email: event.target.value })} /></label>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
