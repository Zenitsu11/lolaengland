import { ArrowUpRight, Star } from 'lucide-react';

export type Product = { id:number; name:string; price:number; mrp:number; rating:number; reviews:string; tone:string; amazon?:string; flipkart?:string };

export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <div className="product-art" style={{background:product.tone}}><span className="pill">TRENDING</span><div className="tee"><div className="tee-neck"/><div className="tee-logo">LOLA<br/><small>ENGLAND</small></div></div></div>
    <div className="product-info"><h3>{product.name}</h3><div className="price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div><div className="rating"><span><Star/> <Star/> <Star/> <Star/> <Star/></span> {product.rating} · {product.reviews} ratings</div><div className="market-buttons"><a className="market amazon" href={product.amazon || '#'} aria-label={`Buy ${product.name} on Amazon`}>Amazon <ArrowUpRight/></a><a className="market flipkart" href={product.flipkart || '#'} aria-label={`Buy ${product.name} on Flipkart`}>Flipkart <ArrowUpRight/></a></div></div>
  </article>;
}
