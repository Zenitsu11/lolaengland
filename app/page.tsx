import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { getPublicProducts } from '@/lib/catalog';

const looks = [
  { image: '/models/model-pink.svg', tag: '01 · SOFT PINK', quote: 'Pretty, playful, effortless.', copy: 'A little pink. A lot of personality.' },
  { image: '/models/model-black.svg', tag: '02 · AFTER DARK', quote: 'Bold looks. Easy confidence.', copy: 'For nights that deserve a little edge.' },
  { image: '/models/model-white.svg', tag: '03 · CLEAN GIRL', quote: 'Less effort. More style.', copy: 'Clean, comfortable and always on point.' },
  { image: '/models/model-rose.svg', tag: '04 · ROSE EDIT', quote: 'Cute today. Confident always.', copy: 'Soft colour, relaxed fit, main-character energy.' },
];

export default async function Home(){
 const products=await getPublicProducts();
 return <div id="top">
  <section className="hero hero-editorial"><div className="container hero-editorial-grid">
    <div className="hero-copy hero-editorial-copy">
      <p className="eyebrow">LOLA ENGLAND · WOMEN’S EDIT</p>
      <h1>Dress like<br/><em>you mean it.</em></h1>
      <p className="hero-text">Everyday women’s T-shirts with a little attitude. Relaxed fits, expressive moods and the LOLA ENGLAND energy you can wear anywhere.</p>
      <div className="hero-quote-block"><Sparkles/><div><strong>“Wear your mood.”</strong><span>Style is a feeling.</span></div></div>
      <a className="btn btn-dark" href="#shop">SHOP THE EDIT <ArrowRight/></a>
    </div>
    <div className="hero-visual hero-model-visual">
      <img src="/models/model-hero.svg" alt="AI-inspired female fashion model wearing a LOLA ENGLAND T-shirt"/>
      <div className="hero-editorial-label"><span>LOLA</span><small>ENGLAND</small></div>
      <div className="hero-caption"><span>THE NEW</span><strong>LOLA GIRL</strong></div>
    </div>
  </div></section>

  <section className="lookbook section" id="models"><div className="container">
    <div className="lookbook-intro"><div><p className="eyebrow">THE LOLA LOOKBOOK</p><h2>She wears<br/><em>the mood.</em></h2></div><p>Different days. Different energy. One easy wardrobe of women's T-shirts made to move with you.</p></div>
    <div className="model-gallery">{looks.map((look)=><article className="fashion-look" key={look.tag}>
      <div className="fashion-look-image"><img src={look.image} alt={`AI-inspired female fashion model, ${look.tag.toLowerCase()}`}/><span className="look-number">{look.tag.split(' ')[0]}</span><div className="shirt-logo"><img src="/logo.jpg" alt="LOLA ENGLAND logo"/></div></div>
      <div className="fashion-look-copy"><span>{look.tag}</span><h3>“{look.quote}”</h3><p>{look.copy}</p><a href="#shop">SHOP THIS MOOD →</a></div>
    </article>)}</div>
  </div></section>

  <section className="quote-banner"><div className="container"><p className="eyebrow">LOLA ENGLAND</p><h2>“Your outfit doesn’t<br/><em>need permission.</em>”</h2><p>Wear the colour. Take the space. Make the everyday yours.</p></div></section>

  <section className="section" id="shop"><div className="container"><div className="section-head"><div><p className="eyebrow">THE EVERYDAY EDIT</p><h2>Trending now</h2><p>Curated women’s T-shirts for every mood.</p></div><a className="arrow-link" href="#shop">View all →</a></div><div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>

  <section className="container join"><div><p className="eyebrow">JOIN THE LOLA LIST</p><h2>First look.<br/>First picks.</h2><p>New drops, limited edits and easy everyday style — straight to your inbox.</p><form><input type="email" placeholder="Your email address" aria-label="Your email address"/><button className="btn btn-light" type="submit">JOIN</button></form></div></section>

  <section className="section faq" id="faq"><div className="container"><div className="section-head"><div><p className="eyebrow">NEED TO KNOW</p><h2>Questions, answered.</h2></div></div><details><summary>Where can I buy LOLA ENGLAND?</summary><p>Products are designed to connect with approved marketplace listings. Amazon and Flipkart links can be added product-by-product from the private owner dashboard.</p></details><details><summary>Do you offer women’s oversized T-shirts?</summary><p>Yes. Oversized, graphic, printed and everyday women’s T-shirts are part of the LOLA collection.</p></details><details><summary>Can prices and links change?</summary><p>Yes. Product pricing, images, descriptions, visibility and marketplace links can be managed from the private owner dashboard.</p></details></div></section>
 </div>
}
