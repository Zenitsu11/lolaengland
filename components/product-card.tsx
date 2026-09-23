'use client';

import Link from 'next/link';
import { ArrowUpRight, Star, Repeat2 } from 'lucide-react';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';
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
  amazon?: string;
  flipkart?: string;
};

const fallbackModels = ['/models/generated-pink.webp','/models/generated-pink-2.webp','/models/generated-black.webp','/models/generated-floral.webp'];

export function ProductCard({ product, visualIndex = 0 }: { product: Product; visualIndex?: number }) {
  const [showBack, setShowBack] = useState(false);
  const reviews = Number(product.reviews || 0).toLocaleString('en-IN');
  const fallback = fallbackModels[visualIndex % fallbackModels.length];
  const hasBack = Boolean(product.secondary_image_url);
  const toggleView = (event?: MouseEvent | KeyboardEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (hasBack) setShowBack(value => !value);
  };

  return <article className="product-card">
    <Link className="product-card-main" href={`/product/${encodeURIComponent(String(product.id))}`}>
      <div
        className="product-art"
        style={{ background: product.tone }}
        onMouseEnter={() => hasBack && setShowBack(true)}
        onMouseLeave={() => hasBack && setShowBack(false)}
      >
        <span className="pill">TRENDING</span>
        <div
          className="product-image-wrap"
          role={hasBack ? 'button' : undefined}
          tabIndex={hasBack ? 0 : undefined}
          aria-label={hasBack ? `Show ${showBack ? 'front' : 'back'} view` : undefined}
          onClick={toggleView}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') toggleView(event);
          }}
        >
          <SafeImage className={`product-image product-image-primary${showBack ? ' is-hidden' : ''}`} src={product.image_url || fallback} fallbackSrc="/models/hero-model.webp" alt={`${product.name} — LOLA ENGLAND women's T-shirt front view`} width={800} height={900} loading="eager" decoding="async" />
          {hasBack ? <SafeImage className={`product-image product-image-secondary${showBack ? ' is-visible' : ''}`} src={product.secondary_image_url!} fallbackSrc="/models/hero-model.webp" alt={`${product.name} — LOLA ENGLAND women's T-shirt back view`} width={800} height={900} loading="eager" decoding="async" /> : null}
          {hasBack ? <span className="image-flip-hint"><Repeat2 size={14}/> {showBack ? 'BACK' : 'FRONT'}</span> : null}
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div>
        <div className="rating"><span aria-label={`${product.rating} out of 5 stars`}><Star/><Star/><Star/><Star/><Star/></span> {product.rating} · {reviews} ratings</div>
      </div>
    </Link>
    <div className="market-buttons">
      {product.amazon ? <a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Amazon <ArrowUpRight/></a> : null}
      {product.flipkart ? <a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Flipkart <ArrowUpRight/></a> : null}
    </div>
  </article>;
}
