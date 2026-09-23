'use client';
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
        <a className="brand" href="#top" aria-label="LOLA ENGLAND home">
          <span className="brand-frame"><img className="brand-logo" src="/Lola england.jpg" alt="LOLA ENGLAND"/></span>
        </a>
        <nav className="desktop-nav">
          {links.map(([label,href])=><a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="actions">
          <a href="#shop" aria-label="Search products"><Search/></a>
          <a href="/wishlist" aria-label="Wishlist"><Heart/></a>
          <a href="/cart" aria-label="Shopping bag"><ShoppingBag/></a>
        </div>
      </div>
    </header>
    <div className="category-strip">
      <div className="container category-strip-inner">
        <a href="#shop">ALL TEES</a><a href="#shop">OVERSIZED</a><a href="#shop">GRAPHIC</a><a href="#shop">EVERYDAY</a><a href="#contact">JOIN LOLA</a>
      </div>
    </div>
    {open&&<div className="mobile-menu">
      <button className="close" onClick={()=>setOpen(false)} aria-label="Close"><X/></button>
      <span className="brand-frame mobile-brand-frame"><img className="mobile-logo" src="/Lola england.jpg" alt="LOLA ENGLAND"/></span>
      {links.map(([label,href])=><a key={label} href={href} onClick={()=>setOpen(false)}>{label}</a>)}
      <a href="#shop" onClick={()=>setOpen(false)}>SHOP ALL T-SHIRTS</a>
    </div>}
  </>;
}