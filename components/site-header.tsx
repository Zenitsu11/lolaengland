'use client';
import { Heart, Search, ShoppingBag, X, Menu } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader(){const [open,setOpen]=useState(false);return <>
<div className="announcement">FREE SHIPPING ON ORDERS OVER ₹799 <span>•</span> LOLA ENGLAND <span>•</span> MADE FOR WOMEN</div>
<header className="header"><div className="nav container">
<a className="brand" href="#top" aria-label="LOLA ENGLAND home"><span className="brand-frame"><img className="brand-logo" src="/logo.jpg" alt="LOLA ENGLAND"/></span></a>
<nav className="desktop-nav"><a href="#top">Home</a><a href="#shop">Shop</a><a href="#models">Lookbook</a><a href="#about">Our story</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></nav>
<div className="actions"><a href="#shop" aria-label="Search products"><Search/></a><a href="/wishlist" aria-label="Wishlist"><Heart/></a><a href="/cart" aria-label="Shopping bag"><ShoppingBag/></a><button className="menu" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button></div>
</div></header>
{open&&<div className="mobile-menu"><button className="close" onClick={()=>setOpen(false)} aria-label="Close"><X/></button><span className="brand-frame mobile-brand-frame"><img className="mobile-logo" src="/logo.jpg" alt="LOLA ENGLAND"/></span><a href="#top" onClick={()=>setOpen(false)}>Home</a><a href="#shop" onClick={()=>setOpen(false)}>Shop T-Shirts</a><a href="#models" onClick={()=>setOpen(false)}>Lookbook</a><a href="#faq" onClick={()=>setOpen(false)}>FAQ</a><a href="#contact" onClick={()=>setOpen(false)}>Contact</a></div>}
</>}
