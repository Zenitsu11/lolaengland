'use client';

import Link from 'next/link';
import { ArrowUpRight, Star, Repeat2, Heart } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { SafeImage } from '@/components/safe-image';

export type Product = {
  id: string | number;
  name: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number | string;
  tone: string;
  description?: string;
  image_url?: string;
  secondary_image_url?: string;
  image_urls?: string[];
  video_urls?: string[];
  categories?: string[];
  amazon?: string;
  flipkart?: string;
};

const fallbackModels = ['/products/lola-mint-front.webp?v=6','/products/lola-navy-front.webp?v=6','/products/lola-olive-front.webp?v=6','/products/lola-brown-front.webp?v=6'];

export function ProductCard({ product, visualIndex = 0 }: { product: Product; visualIndex?: number }) {
  const [showBack, setShowBack] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const reviews = Number(product.reviews || 0).toLocaleString('en-IN');
  const fallback = fallbackModels[visualIndex % fallbackModels.length];
  const hasBack = Boolean(product.secondary_image_url);

  useEffect(() => {
    try { setWishlisted(JSON.parse(localStorage.getItem('lola-wishlist') || '[]').includes(String(product.id))); } catch {}
  }, [product.id]);

  const toggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); event.stopPropagation();
    try {
      const key='lola-wishlist';
      const ids:string[]=JSON.parse(localStorage.getItem(key)||'[]');
      const next=wishlisted ? ids.filter(id=>id!==String(product.id)) : [...new Set([...ids,String(product.id)])];
      localStorage.setItem(key,JSON.stringify(next));
      setWishlisted(!wishlisted);
      window.dispatchEvent(new CustomEvent('lola-wishlist-change'));
    } catch {}
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || !hasBack) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 35) return;
    event.preventDefault();
    didSwipe.current = true;
    setShowBack(delta < 0);
  };

  return <article className="product-card">
    <Link className="product-card-main" href={'/product/' + encodeURIComponent(String(product.id))}>
      <div
        className="product-art"
        style={{ background: product.tone }}
        onMouseEnter={() => hasBack && setShowBack(true)}
        onMouseLeave={() => hasBack && setShowBack(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <span className="pill">TRENDING</span>
        <button type="button" className={"product-wishlist" + (wishlisted ? " is-active" : "")} onClick={toggleWishlist} aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={wishlisted}><Heart/></button>
        <div
          className="product-image-wrap"
          onClick={(event: MouseEvent<HTMLDivElement>) => {
            if (didSwipe.current) {
              event.preventDefault();
              event.stopPropagation();
              didSwipe.current = false;
            }
          }}
        >
          <SafeImage
            className={'product-image product-image-primary' + (showBack ? ' is-hidden' : '')}
            src={product.image_url || fallback}
            fallbackSrc={fallback}
            alt={product.name + ' — LOLA ENGLAND women’s T-shirt front view'}
            width={800}
            height={900}
            loading="eager"
            decoding="async"
          />
          {hasBack ? (
            <SafeImage
              className={'product-image product-image-secondary' + (showBack ? ' is-visible' : '')}
              src={product.secondary_image_url!}
              fallbackSrc={product.secondary_image_url!}
              alt={product.name + ' — LOLA ENGLAND women’s T-shirt back view'}
              width={800}
              height={900}
              loading="eager"
              decoding="async"
            />
          ) : null}
          {hasBack ? <span className="image-flip-hint"><Repeat2 size={14}/> {showBack ? 'BACK' : 'FRONT'}</span> : null}
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div>
        <div className="rating"><span aria-label={product.rating + ' out of 5 stars'}><Star/><Star/><Star/><Star/><Star/></span> {product.rating} · {reviews} ratings</div>
      </div>
    </Link>
    <div className="market-buttons">
      {product.amazon ? <a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Amazon <ArrowUpRight/></a> : null}
      {product.flipkart ? <a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Flipkart <ArrowUpRight/></a> : null}
    </div>
  </article>;
}
