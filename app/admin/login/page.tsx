'use client';
import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function AdminLogin(){
 const [error,setError]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');const password=new FormData(e.currentTarget).get('password');const res=await fetch('/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password})});if(res.ok) window.location.href='/admin'; else setError('Incorrect owner password.');}
 return <main className="login-page"><div className="login-card"><div className="login-mark">LOLA</div><p className="eyebrow">PRIVATE OWNER AREA</p><h1>Welcome back.</h1><p>Sign in to manage products, prices and marketplace links.</p><form onSubmit={submit}><label>Owner password<input name="password" type="password" autoComplete="current-password" required placeholder="Enter password"/></label><button className="btn btn-dark" type="submit">ENTER DASHBOARD <ArrowRight/></button>{error&&<div className="login-error">{error}</div>}</form><a className="back-store" href="/">← Back to store</a></div></main>
}
