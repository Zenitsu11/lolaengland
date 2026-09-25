'use client';
import Link from 'next/link';
import { Heart, Search, ShoppingBag, X, Menu } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader(){
  const [open,setOpen]=useState(false);
  const links=[
    ['NEW IN','#shop'],
    ['T-SHIRTS','#shop'],
    ['LOOKBOOK','#models'],
    ['OUR STORY','#about'],
    ['FAQ','#faq'],
  ];
  return <>
    <div className="announcement">FREE SHIPPING ON ORDERS OVER ₹799 <span>•</span> NEW DROP LIVE <span>•</span> LOLA ENGLAND</div>
    <header className="header">
      <div className="nav container">
        <button className="menu" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button>
        <Link className="brand" href="/" aria-label="LOLA ENGLAND home" onClick={()=>setOpen(false)}>
          <span className="brand-frame"><img className="brand-logo" src="/Lola england.jpg" alt="LOLA ENGLAND"/></span>
        </Link>
        <nav className="desktop-nav">
          {links.map(([label,href])=><a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="actions">
          <a href="#shop" aria-label="Search products"><Search/></a>
          <Link href="/wishlist" aria-label="Wishlist"><Heart/></Link>
          <Link href="/cart" aria-label="Shopping bag"><ShoppingBag/></Link>
        </div>
      </div>
    </header>
    <div className="category-strip">
      <div className="container category-strip-inner">
        <Link href="/collection/all">ALL TEES</Link><Link href="/collection/oversized">OVERSIZED</Link><Link href="/collection/graphics">GRAPHIC</Link><Link href="/collection/everyday">EVERYDAY</Link><a href="#contact">JOIN LOLA</a>
      </div>
    </div>
    {open&&<div className="mobile-menu">
      <button className="close" onClick={()=>setOpen(false)} aria-label="Close"><X/></button>
      <Link href="/" className="mobile-brand-link" onClick={()=>setOpen(false)} aria-label="LOLA ENGLAND home">
        <span className="brand-frame mobile-brand-frame"><img className="mobile-logo" src="/Lola england.jpg" alt="LOLA ENGLAND"/></span>
      </Link>
      {links.map(([label,href])=><a key={label} href={href} onClick={()=>setOpen(false)}>{label}</a>)}
      <Link href="/collection/all" onClick={()=>setOpen(false)}>SHOP ALL T-SHIRTS</Link>
    </div>}
  </>;
}