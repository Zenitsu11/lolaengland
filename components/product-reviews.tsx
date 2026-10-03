'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Star, Send } from 'lucide-react';

type Review={id:string;rating:number;title:string|null;body:string;photos:string[];verified_purchase:boolean;created_at:string};

function supabase(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}}):null;
}

export function ProductReviews({productId}:{productId:string}){
  const [reviews,setReviews]=useState<Review[]>([]);
  const [rating,setRating]=useState(5);
  const [title,setTitle]=useState('');
  const [body,setBody]=useState('');
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const client=useMemo(()=>supabase(),[]);

  async function load(){
    if(!client)return;
    setLoading(true);
    const {data}=await client.from('product_reviews').select('id,rating,title,body,photos,verified_purchase,created_at').eq('product_id',productId).eq('status','approved').order('created_at',{ascending:false});
    setReviews((data||[]) as Review[]); setLoading(false);
  }
  useEffect(()=>{load();},[productId]);

  const average=reviews.length?reviews.reduce((a,r)=>a+r.rating,0)/reviews.length:0;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMessage('');
    if(!client){setMessage('Reviews are temporarily unavailable.');return;}
    const {data:{user}}=await client.auth.getUser();
    if(!user){window.location.href='/account/login?next='+encodeURIComponent(window.location.pathname);return;}
    if(body.trim().length<10){setMessage('Please write at least 10 characters.');return;}
    setSaving(true);
    const {error}=await client.from('product_reviews').insert({product_id:productId,customer_id:user.id,rating,title:title.trim()||null,body:body.trim()});
    setSaving(false);
    if(error){setMessage(error.message);return;}
    setTitle('');setBody('');setRating(5);setMessage('Thanks! Your review is waiting for approval.');
  }

  return <section className="product-reviews" id="reviews">
    <div className="product-reviews-head"><div><p className="editorial-eyebrow">CUSTOMER REVIEWS</p><h2>What customers say</h2></div><div className="review-summary"><strong>{average?average.toFixed(1):'—'}</strong><span>★★★★★</span><small>{reviews.length} approved review{reviews.length===1?'':'s'}</small></div></div>
    {loading?<p className="review-empty">Loading reviews…</p>:reviews.length===0?<p className="review-empty">No reviews yet. Be the first to share your experience.</p>:<div className="review-list">{reviews.map(r=><article className="review-card" key={r.id}><div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><div className="review-meta"><strong>{r.title||'Customer review'}</strong>{r.verified_purchase&&<span>✓ Verified purchase</span>}<time>{new Date(r.created_at).toLocaleDateString('en-IN')}</time></div><p>{r.body}</p></article>)}</div>}
    <form className="review-form" onSubmit={submit}><div className="review-form-heading"><h3>Share your experience</h3><span>Sign in to leave a review</span></div><div className="review-rating-input"><span>Your rating</span><div>{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={`${n} stars`} className={n<=rating?'selected':''} onClick={()=>setRating(n)}>★</button>)}</div></div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Review title (optional)" maxLength={80}/><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Tell other shoppers about the fit, quality and feel…" rows={5} maxLength={1000}/>{message&&<p className="review-message">{message}</p>}<button type="submit" disabled={saving}>{saving?'Submitting…':<><Send size={16}/> Submit review</>}</button></form>
  </section>;
}
