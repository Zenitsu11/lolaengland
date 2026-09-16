import { ArrowRight, Heart, Sparkles, Zap } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { products } from '@/data/products';

export default function Home(){
 return <div id="top">
  <section className="hero"><div className="container hero-inner"><div className="hero-copy"><p className="eyebrow">LOLA ENGLAND · WOMEN’S EDIT</p><h1>Wear your<br/><em>mood.</em></h1><p className="hero-text">Elegant everyday T-shirts with a soft, feminine identity. Designed to feel effortless, look elevated, and live beautifully in your everyday wardrobe.</p><a className="btn btn-dark" href="#shop">SHOP T-SHIRTS <ArrowRight/></a></div><div className="hero-visual"><div className="halo"/><div className="fashion-tee"><div className="sleeve left"/><div className="sleeve right"/><div className="body"><div className="body-logo">LOLA<br/><small>ENGLAND</small></div></div></div><div className="hero-note">NEW SEASON<br/><strong>ESSENTIALS</strong></div></div></div></section>

  <section className="section" id="shop"><div className="container"><div className="section-head"><div><h2>Trending now</h2><p>Curated women’s T-shirts</p></div><a className="arrow-link" href="#shop">View all →</a></div><div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>

  <section className="section features" id="about"><div className="container feature-grid"><div className="feature-card"><Sparkles/><h3>Marketplace ready</h3><p>Connect approved Amazon, Flipkart and other marketplace links product-by-product.</p></div><div className="feature-card"><Heart/><h3>Made for mobile</h3><p>Built around social traffic from Instagram, WhatsApp and short-form content.</p></div><div className="feature-card"><Zap/><h3>Easy to manage</h3><p>Owner tools are designed so products, prices and marketplace links can change without editing code.</p></div></div></section>

  <section className="container join"><div><p className="eyebrow">JOIN THE LOLA LIST</p><h2>First look.<br/>First picks.</h2><p>Get new drops, limited edits and early access in your inbox.</p><form><input type="email" placeholder="Your email address" aria-label="Your email address"/><button className="btn btn-light" type="submit">JOIN</button></form></div></section>

  <section className="section faq" id="faq"><div className="container"><div className="section-head"><div><p className="eyebrow">NEED TO KNOW</p><h2>Questions, answered.</h2></div></div><details><summary>Where can I buy LOLA ENGLAND?</summary><p>Products will be available through approved marketplace listings. Amazon and Flipkart links can be added product-by-product from the owner dashboard.</p></details><details><summary>Do you offer women’s oversized T-shirts?</summary><p>Yes. Oversized, graphic and everyday women’s T-shirts are part of the current collection.</p></details><details><summary>Can prices change?</summary><p>Yes. Product pricing is designed to be managed from the private owner dashboard.</p></details></div></section>
 </div>
}
