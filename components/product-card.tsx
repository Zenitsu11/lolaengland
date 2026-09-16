import { ArrowUpRight, Star } from 'lucide-react';

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
      {product.image_url ? (
        <img className="product-image" src={product.image_url} alt={product.name} loading="lazy" />
      ) : (
        <div className="tee"><div className="tee-neck"/><div className="tee-logo">LOLA<br/><small>ENGLAND</small></div></div>
      )}
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
