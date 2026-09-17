import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { getPublicProducts } from '@/lib/catalog';

const looks = [
  { image: '/models/model-pink.webp', tag: '01 · SOFT PINK', quote: 'Pretty, playful, effortless.', copy: 'A little pink. A lot of personality.' },
  { image: '/models/model-dark.webp', tag: '02 · AFTER DARK', quote: 'Bold looks. Easy confidence.', copy: 'For nights that deserve a little edge.' },
  { image: '/models/model-white.svg', tag: '03 · CLEAN GIRL', quote: 'Less effort. More style.', copy: 'Clean, comfortable and always on point.' },
  { image: '/models/model-rose.svg', tag: '04 · ROSE EDIT', quote: 'Cute today. Confident always.', copy: 'Soft colour, relaxed fit, main-character energy.' },
];

const railLooks = [
  { image: '/models/hero-model.webp', label: 'THE NEW', title: 'LOLA GIRL' },
  { image: '/models/model-black.svg', label: 'BLACK EDIT', title: 'Own the night.' },
  { image: '/models/model-white.svg', label: 'CLEAN EDIT', title: 'Keep it easy.' },
];

export default async function Home() {
  const products = await getPublicProducts();

  return (
    <div id="top" className="editorial-home">
      <section className="editorial-hero">
        <div className="container editorial-hero-grid">
          <div className="editorial-hero-copy">
            <p className="editorial-kicker">LOLA ENGLAND · WOMEN’S EDIT</p>
            <h1>Wear your<br /><em>mood.</em></h1>
            <p>Trendy, comfortable and made for every version of you. Express yourself with women’s T-shirts that speak louder.</p>
            <div className="editorial-hero-quote">
              <Sparkles />
              <div><strong>“Good outfits. Brighter days.”</strong><span>More than just a tee.</span></div>
            </div>
            <a className="btn btn-dark" href="#shop">SHOP THE EDIT <ArrowRight /></a>
          </div>

          <div className="editorial-hero-image image-safe">
            <img src="/models/hero-model.webp" alt="AI-generated LOLA ENGLAND female fashion model wearing a women's T-shirt" width="1200" height="1500" fetchPriority="high" />
            <div className="editorial-badge"><strong>LOLA</strong><small>ENGLAND</small></div>
            <div className="editorial-image-note"><span>THE NEW</span><strong>LOLA GIRL</strong></div>
          </div>
        </div>
      </section>

      <div className="mood-bar" aria-label="LOLA ENGLAND style highlights">
        <div className="mood-track container"><span>WOMEN’S TEES</span><b>✦</b><span>OVERSIZED FITS</span><b>✦</b><span>EVERYDAY STYLE</span><b>✦</b><span>LOLA ENGLAND</span><b>✦</b><span>WEAR YOUR MOOD</span></div>
      </div>

      <section className="editorial-section" id="models">
        <div className="container">
          <div className="editorial-section-head">
            <div><p className="editorial-eyebrow">THE LOLA LOOKBOOK</p><h2>She wears<br /><em>the mood.</em></h2></div>
            <p>Different days. Different energy. One easy wardrobe of women’s T-shirts made to move with you.</p>
          </div>

          <div className="editorial-lookbook">
            {looks.map((look) => (
              <article className="editorial-look" key={look.tag}>
                <div className="editorial-look-media image-safe">
                  <img src={look.image} alt={`AI-generated female fashion model for LOLA ENGLAND, ${look.tag.toLowerCase()}`} width="900" height="1200" loading="lazy" />
                  <span className="editorial-look-index">{look.tag.split(' ')[0]}</span>
                  <img className="editorial-look-logo" src="/logo.jpg" alt="LOLA ENGLAND logo" width="160" height="80" loading="lazy" />
                </div>
                <div className="editorial-look-copy">
                  <span>{look.tag}</span>
                  <h3>“{look.quote}”</h3>
                  <p>{look.copy}</p>
                  <a href="#shop">SHOP THIS MOOD →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-campaign">
        <div className="container campaign-grid">
          <article className="campaign-card image-safe">
            <img src="/models/model-pink.webp" alt="AI-generated female fashion model in a soft pink LOLA ENGLAND look" width="1000" height="1300" loading="lazy" />
            <div className="campaign-copy"><span>01 · SOFT PINK</span><h3>Pretty, but never predictable.</h3><p>Soft colour, relaxed energy and a tee you will actually want to wear again tomorrow.</p></div>
          </article>
          <article className="campaign-card campaign-quote">
            <div><p className="editorial-eyebrow">THE LOLA ATTITUDE</p><h3>“Your outfit doesn’t <em>need permission.</em>”</h3><p>Wear the colour. Take the space. Make the everyday yours.</p></div>
          </article>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="style-rail-title">
        <div className="container">
          <div className="editorial-section-head">
            <div><p className="editorial-eyebrow">MORE WAYS TO WEAR IT</p><h2 id="style-rail-title">One tee.<br /><em>Many moods.</em></h2></div>
            <p>Scroll through the LOLA girl edit — soft, clean, bold and always a little bit extra.</p>
          </div>
          <div className="model-rail">
            {railLooks.map((look) => (
              <article className="model-rail-card image-safe" key={look.title}>
                <img src={look.image} alt={`AI-generated LOLA ENGLAND female model, ${look.title}`} width="1000" height="1300" loading="lazy" />
                <div className="rail-copy"><span>{look.label}</span><strong>{look.title}</strong></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section editorial-products" id="shop">
        <div className="container">
          <div className="editorial-section-head">
            <div><p className="editorial-eyebrow">THE EVERYDAY EDIT</p><h2>Trending now</h2></div>
            <p>Curated women’s T-shirts for every mood, from oversized graphics to easy everyday essentials.</p>
          </div>
          <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="container">
          <div className="editorial-section-head"><div><p className="editorial-eyebrow">WHY LOLA</p><h2>Made for<br /><em>real days.</em></h2></div><p>Style should feel good before it looks good. LOLA keeps the mood easy.</p></div>
          <div className="editorial-values">
            <article className="editorial-value"><Heart size={22} /><strong>Easy confidence</strong><p>Relaxed silhouettes and expressive graphics built for everyday wear.</p></article>
            <article className="editorial-value"><Sparkles size={22} /><strong>Fresh edits</strong><p>New colours, moods and curated pieces keep the wardrobe feeling fresh.</p></article>
            <article className="editorial-value"><Star size={22} /><strong>Marketplace ready</strong><p>Amazon and Flipkart links can be managed product-by-product from the private owner dashboard.</p></article>
          </div>
        </div>
      </section>

      <section className="container editorial-join" id="contact">
        <div className="editorial-join-image"><img src="/models/model-dark.webp" alt="AI-generated LOLA ENGLAND female fashion model in an evening-inspired T-shirt look" width="1000" height="1300" loading="lazy" /></div>
        <div className="editorial-join-copy">
          <p className="editorial-eyebrow">JOIN THE LOLA LIST</p>
          <h2>First look.<br /><em>First picks.</em></h2>
          <p>New drops, limited edits and easy everyday style — straight to your inbox.</p>
          <form onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Your email address" required /><button type="submit">JOIN</button></form>
        </div>
      </section>

      <section className="editorial-section editorial-faq" id="faq">
        <div className="container">
          <div className="editorial-section-head"><div><p className="editorial-eyebrow">NEED TO KNOW</p><h2>Questions,<br /><em>answered.</em></h2></div></div>
          <details><summary>Where can I buy LOLA ENGLAND?</summary><p>Products can connect to approved marketplace listings. Amazon and Flipkart links can be added product-by-product from the private owner dashboard.</p></details>
          <details><summary>Do you offer women’s oversized T-shirts?</summary><p>Yes. Oversized, graphic, printed and everyday women’s T-shirts are part of the LOLA collection.</p></details>
          <details><summary>Can prices, images and links change?</summary><p>Yes. Product pricing, images, descriptions, visibility and marketplace links can be managed from the private owner dashboard.</p></details>
        </div>
      </section>
    </div>
  );
}
