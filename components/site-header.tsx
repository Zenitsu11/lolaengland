'use client';

import Link from 'next/link';
import { Heart, Search, ShoppingBag, X, Menu, UserRound, ChevronDown } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useEffect, useState } from 'react';

const clothing = [
  { label: 'Tops & T-Shirts', href: '/collection/tops-t-shirts' },
  { label: 'Dresses & Jumpsuits', href: '/collection/dresses' },
  { label: 'Trousers, Skirts & Shorts', href: '/collection/bottoms' },
  { label: 'Knitwear', href: '/collection/knitwear' },
  { label: 'Coats & Jackets', href: '/collection/outerwear' },
  { label: 'Activewear', href: '/collection/activewear' },
  { label: 'Swimwear', href: '/collection/swimwear' },
  { label: 'Accessories', href: '/collection/accessories' },
];
const intimates = [
  { label: 'Lingerie & Intimates', href: '/collection/lingerie' },
  { label: 'Nightwear & Loungewear', href: '/collection/nightwear' },
];
const editorial = [
  { label: 'New In', href: '/new-in' },
  { label: 'The Lookbook', href: '/lookbook' },
  { label: 'Our Story', href: '/our-story' },
];

export function SiteHeader({ logoUrl = '/logo.svg' }: { logoUrl?: string }) {
  const [open, setOpen] = useState(false);
  const { items } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  useEffect(() => {
    const sync = () => {
      try { setWishlistCount(JSON.parse(localStorage.getItem('lola-wishlist') || '[]').length); }
      catch { setWishlistCount(0); }
    };
    sync();
    window.addEventListener('lola-wishlist-change', sync);
    return () => window.removeEventListener('lola-wishlist-change', sync);
  }, []);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const closeMenu = () => setOpen(false);

  return <>
    <div className="announcement british-announcement">
      <span>THE LOLA ENGLAND EDIT</span><i aria-hidden="true">✦</i><span>CONTEMPORARY WOMENSWEAR</span><i aria-hidden="true">✦</i><span>DISCOVER YOUR NEW FAVOURITES</span>
    </div>
    <header className="header british-header">
      <div className="nav container british-nav">
        <button className="menu british-menu-toggle" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
        <Link className="brand" href="/" aria-label="LOLA ENGLAND home" onClick={closeMenu}>
          <span className="brand-frame"><img className="brand-logo" src={logoUrl} alt="LOLA ENGLAND" /></span>
        </Link>
        <nav className="desktop-nav british-desktop-nav" aria-label="Main navigation">
          <Link href="/new-in">New In</Link>
          <details className="nav-dropdown">
            <summary>Clothing <ChevronDown size={13} /></summary>
            <div className="nav-mega">
              <div><p className="nav-mega-heading">Clothing</p>{clothing.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
              <div><p className="nav-mega-heading">Intimates</p>{intimates.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
              <div className="nav-mega-feature"><span>THE LOLA EDIT</span><strong>A wardrobe, with a point of view.</strong><Link href="/collection/all">Explore all available styles ↗</Link></div>
            </div>
          </details>
          <Link href="/collection/lingerie">Lingerie</Link>
          <Link href="/collection/nightwear">Nightwear</Link>
          <Link href="/lookbook">The Edit</Link>
          <Link href="/our-story">Our Story</Link>
        </nav>
        <div className="actions british-actions">
          <Link href="/search" aria-label="Search products"><Search /></Link>
          <Link href="/account" aria-label="My account"><UserRound /></Link>
          <Link href="/wishlist" className="wishlist-action" aria-label={`Wishlist, ${wishlistCount} saved`}><Heart />{wishlistCount > 0 ? <span className="wishlist-count">{wishlistCount > 99 ? '99+' : wishlistCount}</span> : null}</Link>
          <Link href="/cart" className="cart-action" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag />{cartCount > 0 ? <span className="cart-count">{cartCount > 99 ? '99+' : cartCount}</span> : null}</Link>
        </div>
      </div>
    </header>
    {open && <div className="mobile-menu british-mobile-menu">
      <div className="mobile-menu-top">
        <Link href="/" className="mobile-brand-link" onClick={closeMenu} aria-label="LOLA ENGLAND home"><img className="mobile-logo" src={logoUrl} alt="LOLA ENGLAND" /></Link>
        <button className="close" onClick={closeMenu} aria-label="Close menu"><X /></button>
      </div>
      <Link href="/new-in" onClick={closeMenu}>New In</Link>
      <details><summary>Clothing <ChevronDown size={16} /></summary><div className="mobile-submenu">{clothing.map(item => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>)}</div></details>
      <details><summary>Intimates <ChevronDown size={16} /></summary><div className="mobile-submenu">{intimates.map(item => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>)}</div></details>
      {editorial.slice(1).map(item => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>)}
      <Link href="/collection/all" onClick={closeMenu}>Shop Available Styles</Link>
      <Link href="/account" onClick={closeMenu}>My Account</Link>
    </div>}
  </>;
}
