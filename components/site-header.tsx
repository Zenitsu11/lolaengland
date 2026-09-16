'use client';
import { Heart, Search, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader(){const [open,setOpen]=useState(false);return <>
<div className="announcement">FREE SHIPPING ON ORDERS OVER ₹799 <span>•</span> LOLA ENGLAND</div>
<header className="header"><div className="nav container"><a className="brand" href="#top"><img className="brand-mark" src="/logo.jpg" alt="LOLA ENGLAND" style={{objectFit:'cover',objectPosition:'center',padding:0}}/><span>LOLA</span></a><nav className="desktop-nav"><a href="#shop">Shop</a><a href="#about">Our story</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></nav><div className="actions"><button aria-label="Search"><Search/></button><button aria-label="Wishlist"><Heart/></button><button aria-label="Shopping bag"><ShoppingBag/></button><button className="menu" onClick={()=>setOpen(true)} aria-label="Open menu"><span/><span/></button></div></div></header>
{open&&<div className="mobile-menu"><button className="close" onClick={()=>setOpen(false)} aria-label="Close"><X/></button><div className="mobile-brand">LOLA <small>ENGLAND</small></div><a href="#shop" onClick={()=>setOpen(false)}>Shop T-Shirts</a><a href="#about" onClick={()=>setOpen(false)}>Our story</a><a href="#faq" onClick={()=>setOpen(false)}>FAQ</a><a href="#contact" onClick={()=>setOpen(false)}>Contact</a></div>}
</>}
