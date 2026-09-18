import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
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
  amazon?: string;
  flipkart?: string;
};

const fallbackModels = ['/models/hero-model.webp','/models/hero-model.webp','/models/hero-model.webp','/models/hero-model.webp'];

export function ProductCard({ product, visualIndex = 0 }: { product: Product; visualIndex?: number }) {
  const reviews = Number(product.reviews || 0).toLocaleString('en-IN');
  const fallback = fallbackModels[visualIndex % fallbackModels.length];
  return <article className="product-card">
    <Link className="product-card-main" href={`/product/${encodeURIComponent(String(product.id))}`}>
      <div className="product-art" style={{ background: product.tone }}>
        <span className="pill">TRENDING</span>
        <SafeImage className="product-image" src={product.image_url || fallback} fallbackSrc="/models/hero-model.webp" alt={`${product.name} — LOLA ENGLAND women's T-shirt`} width={800} height={900} loading="lazy" />
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
