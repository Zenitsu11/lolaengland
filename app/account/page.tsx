'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Package, Heart, LogOut, Plus, Trash2, RotateCcw } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase-client';

type Account={user:{id:string;email:string;name:string;phone:string};orders:any[];addresses:any[];wishlist:any[]};

export default function AccountPage(){
 const router=useRouter(); const [data,setData]=useState<Account|null>(null); const [loading,setLoading]=useState(true); const [message,setMessage]=useState('');
 const [form,setForm]=useState({label:'Home',name:'',phone:'',line1:'',line2:'',city:'',state:'',pincode:'',is_default:true});
 async function load(){
  setLoading(true); try{const supabase=getSupabaseClient(); const {data:sessionData}=await supabase.auth.getSession(); if(!sessionData.session){router.replace('/account/login');return;} const r=await fetch('/api/account',{headers:{Authorization:`Bearer ${sessionData.session.access_token}`},cache:'no-store'}); const d=await r.json(); if(!r.ok) throw new Error(d.error); setData(d); setForm(f=>({...f,name:d.user.name||'',phone:d.user.phone||'',is_default:d.addresses.length===0}));}catch(e){setMessage(e instanceof Error?e.message:'Could not load account.');}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 async function action(body:any){const supabase=getSupabaseClient();const {data:s}=await supabase.auth.getSession();if(!s.session) return router.replace('/account/login');const r=await fetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.session.access_token}`},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error);return d;}
 async function saveAddress(e:React.FormEvent){e.preventDefault();try{await action({action:'address',...form});setMessage('Address saved.');setForm(f=>({...f,label:'Home',name:data?.user.name||'',phone:data?.user.phone||'',line1:'',line2:'',city:'',state:'',pincode:'',is_default:false}));load()}catch(e){setMessage(e instanceof Error?e.message:'Could not save address.')}}
 async function removeAddress(id:string){try{await action({action:'delete_address',id});load()}catch(e){setMessage(e instanceof Error?e.message:'Could not remove address.')}}
 async function signOut(){await getSupabaseClient().auth.signOut();router.replace('/');router.refresh()}
 if(loading) return <main className="account-page"><div className="account-shell"><p>Loading your account…</p></div></main>;
 if(!data) return <main className="account-page"><div className="account-shell"><p>{message||'Please sign in.'}</p></div></main>;
 return <main className="account-page"><div className="account-shell">
  <header className="account-header"><div><p className="account-eyebrow">MY LOLA ENGLAND</p><h1>My account</h1><p>{data.user.email}</p></div><button className="account-signout" onClick={signOut}><LogOut size={16}/> Sign out</button></header>
  {message&&<div className="account-banner">{message}</div>}
  <section className="account-grid">
   <div className="account-panel account-profile"><div className="account-panel-title"><div><Package/><h2>Orders</h2></div><span>{data.orders.length}</span></div>{data.orders.length===0?<p className="account-empty">Your orders will appear here after checkout.</p>:<div className="account-orders">{data.orders.map(o=><article key={o.id} className="account-order"><div><strong>#{String(o.id).slice(0,8).toUpperCase()}</strong><span>{new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span></div><div><b>₹{Number(o.total_amount||0).toLocaleString('en-IN')}</b><span className="account-status">{String(o.status||'created').replaceAll('_',' ')}</span></div><a href={`/track-order?order=${encodeURIComponent(o.id)}`}>Track order →</a>{['delivered','paid','confirmed'].includes(String(o.status))&&<a href={`/returns?order=${encodeURIComponent(o.id)}`}><RotateCcw size={14}/> Return</a>}</article>)}</div>}</div>
   <div className="account-panel"><div className="account-panel-title"><div><MapPin/><h2>Saved addresses</h2></div><span>{data.addresses.length}</span></div>{data.addresses.map(a=><div className="account-address" key={a.id}><div><strong>{a.label}{a.is_default?' · Default':''}</strong><p>{a.name}<br/>{a.line1}{a.line2&&<><br/>{a.line2}</>}<br/>{a.city}, {a.state} — {a.pincode}<br/>{a.phone}</p></div><button onClick={()=>removeAddress(a.id)} aria-label="Delete address"><Trash2 size={16}/></button></div>)}<form className="account-address-form" onSubmit={saveAddress}><h3><Plus size={16}/> Add address</h3><div className="account-form-row"><input placeholder="Label (Home/Work)" value={form.label} onChange={e=>setForm({...form,label:e.target.value})}/><input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div className="account-form-row"><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/><input placeholder="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value.replace(/\D/g,'')})} required/></div><input placeholder="Address line 1" value={form.line1} onChange={e=>setForm({...form,line1:e.target.value})} required/><input placeholder="Address line 2 (optional)" value={form.line2} onChange={e=>setForm({...form,line2:e.target.value})}/><div className="account-form-row"><input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/><input placeholder="State" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} required/></div><label className="account-check"><input type="checkbox" checked={form.is_default} onChange={e=>setForm({...form,is_default:e.target.checked})}/> Make this my default address</label><button className="account-save">Save address</button></form></div>
   <div className="account-panel"><div className="account-panel-title"><div><Heart/><h2>Wishlist</h2></div><span>{data.wishlist.length}</span></div><p className="account-empty">Your account wishlist is synced. Products saved while signed in will stay with your account.</p><a className="account-link" href="/wishlist">Open wishlist →</a></div>
  </section>
 </div></main>
}
