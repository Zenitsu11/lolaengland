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

export function ProductCard({ product }: { product: Product }) {
  const reviews = Number(product.reviews || 0).toLocaleString('en-IN');
  return <article className="product-card">
    <div className="product-art" style={{ background: product.tone }}>
      <span className="pill">TRENDING</span>
      <SafeImage className="product-image" src={product.image_url || '/models/model-pink.webp'} fallbackSrc="/models/hero-model.webp" alt={`${product.name} — LOLA ENGLAND women's T-shirt`} width={800} height={600} loading="lazy" />
    </div>
    <div className="product-info">
      <h3>{product.name}</h3>
      <div className="price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div>
      <div className="rating"><span aria-label={`${product.rating} out of 5 stars`}><Star/><Star/><Star/><Star/><Star/></span> {product.rating} · {reviews} ratings</div>
      <div className="market-buttons">
        {product.amazon ? <a className="market amazon" href={product.amazon} target="_blank" rel="noopener noreferrer">Amazon <ArrowUpRight/></a> : null}
        {product.flipkart ? <a className="market flipkart" href={product.flipkart} target="_blank" rel="noopener noreferrer">Flipkart <ArrowUpRight/></a> : null}
        {!product.amazon && !product.flipkart ? <span className="market-empty">Marketplace link coming soon</span> : null}
      </div>
    </div>
  </article>;
}
