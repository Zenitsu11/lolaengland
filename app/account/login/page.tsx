'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function AccountLoginPage(){
  const router=useRouter();
  const [email,setEmail]=useState('');
  const [code,setCode]=useState('');
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function send(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage('');
    try{
      const supabase=getSupabaseClient();
      const {error}=await supabase.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{shouldCreateUser:true,emailRedirectTo:window.location.origin+'/account'}});
      if(error) throw error;
      setSent(true); setMessage('We sent a 6-digit login code to your email.');
    }catch(err){setMessage(err instanceof Error?err.message:'Could not send the login code.');}
    finally{setBusy(false)}
  }
  async function verify(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage('');
    try{
      const supabase=getSupabaseClient();
      const {error}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:code.trim(),type:'email'});
      if(error) throw error;
      router.replace('/account');
      router.refresh();
    }catch(err){setMessage(err instanceof Error?err.message:'That code is invalid or expired.');}
    finally{setBusy(false)}
  }
  return <main className="account-auth-page"><div className="account-auth-card">
    <div className="account-auth-mark"><ShieldCheck size={22}/></div>
    <p className="account-eyebrow">LOLA ENGLAND</p>
    <h1>Welcome back.</h1>
    <p className="account-auth-copy">Sign in to view your orders, addresses, returns and wishlist.</p>
    {!sent ? <form onSubmit={send} className="account-auth-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></label><button disabled={busy}>{busy?'Sending…':<>Continue with email <ArrowRight size={17}/></>}</button></form> : <form onSubmit={verify} className="account-auth-form"><label>6-digit code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} placeholder="123456" required autoComplete="one-time-code"/></label><button disabled={busy}>{busy?'Verifying…':<>Verify & continue <ArrowRight size={17}/></>}</button><button type="button" className="account-secondary" onClick={()=>{setSent(false);setCode('');setMessage('')}}>Use another email</button></form>}
    {message&&<p className="account-auth-message">{message}</p>}
    <p className="account-auth-note"><Mail size={14}/> Password-free sign in. Your email stays protected.</p>
  </div></main>
}
