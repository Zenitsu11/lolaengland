import Link from 'next/link';
import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { SafeImage } from '@/components/safe-image';
import { NewsletterForm } from '@/components/store-experience';

const looks = [
  { image:'/products/lola-mint-front.webp?v=6', tag:'01 · SOFT MINT', title:'Pretty, playful, effortless.', copy:'Soft colour, relaxed energy and a tee that does the talking.', slug:'soft-pink' },
  { image:'/products/lola-navy-front.webp?v=6', tag:'02 · AFTER DARK', title:'Bold looks. Easy confidence.', copy:'A darker mood for evenings, city walks and everything after sunset.', slug:'after-dark' },
  { image:'/products/lola-olive-front.webp?v=6', tag:'03 · GRAPHIC GIRL', title:'Say it with your tee.', copy:'Statement graphics, easy silhouettes and main-character energy.', slug:'graphic-girl' },
  { image:'/products/lola-brown-back.webp?v=8', tag:'04 · NEW MOOD', title:'Cute today. Confident always.', copy:'Fresh styling, relaxed fits and a little extra personality.', slug:'new-mood' },
];

function Shell({eyebrow,title,children,lead}:{eyebrow:string;title:React.ReactNode;children:React.ReactNode;lead?:string}){
  return <main className="menu-landing">
    <section className="menu-landing-hero">
      <div className="container">
        <p className="editorial-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
      </div>
    </section>
    {children}
  </main>;
}

export function NewInPage({products}:{products:Parameters<typeof ProductCard>[0]['product'][]}){
  return <Shell eyebrow="THE LATEST LOLA EDIT" title={<>New <em>in.</em></>} lead="Fresh women’s T-shirts, new moods and easy pieces to wear on repeat.">
    <section className="menu-landing-section"><div className="container">
      <div className="menu-section-head"><div><p className="editorial-eyebrow">JUST DROPPED</p><h2>Meet the latest.</h2></div><Link className="text-link" href="/collection/all">SHOP ALL →</Link></div>
      <div className="product-grid menu-product-grid">{products.slice(0,8).map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</div>
    </div></section>
  </Shell>;
}

export function TshirtsPage({products}:{products:Parameters<typeof ProductCard>[0]['product'][]}){
  return <Shell eyebrow="THE LOLA COLLECTION" title={<>T-<em>shirts.</em></>} lead="Oversized, graphic, printed and everyday women’s T-shirts — made to move with your mood.">
    <section className="menu-landing-section"><div className="container">
      <div className="category-pills"><Link href="/collection/all">ALL TEES</Link><Link href="/collection/oversized">OVERSIZED</Link><Link href="/collection/graphics">GRAPHIC</Link><Link href="/collection/everyday">EVERYDAY</Link></div>
      <div className="product-grid menu-product-grid">{products.map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</div>
    </div></section>
  </Shell>;
}

export function LookbookPage(){
  return <Shell eyebrow="THE LOLA LOOKBOOK" title={<>She wears<br/><em>the mood.</em></>} lead="Different days. Different energy. One easy wardrobe of women’s T-shirts made to move with you.">
    <section className="menu-landing-section"><div className="container">
      <div className="menu-lookbook-grid">{looks.map((look,index)=><Link className="menu-look-card" href={'/collection/'+look.slug} key={look.tag}>
        <div className="menu-look-media"><SafeImage src={look.image} fallbackSrc={look.image} alt={'LOLA ENGLAND '+look.tag.toLowerCase()} width={900} height={1100}/><span>{String(index+1).padStart(2,'0')}</span></div>
        <div className="menu-look-copy"><p>{look.tag}</p><h2>{look.title}</h2><span>{look.copy}</span><b>SHOP THIS MOOD <ArrowRight size={15}/></b></div>
      </Link>)}</div>
    </div></section>
  </Shell>;
}

export function OurStoryPage(){
  return <Shell eyebrow="OUR STORY" title={<>Wear your<br/><em>mood.</em></>} lead="LOLA ENGLAND is a women’s T-shirt label built around easy confidence, expressive graphics and everyday comfort.">
    <section className="menu-story-feature"><div className="container menu-story-grid">
      <div className="menu-story-image"><SafeImage src="/products/lola-brown-front.webp?v=8" fallbackSrc="/products/lola-brown-front.webp?v=8" alt="LOLA ENGLAND women’s T-shirt" width={1000} height={1200}/></div>
      <div className="menu-story-copy"><p className="editorial-eyebrow">MORE THAN A TEE</p><h2>Good outfits.<br/><em>Brighter days.</em></h2><p>LOLA is about clothes that fit into real life — coffee runs, late nights, slow Sundays, spontaneous plans and every version of you in between.</p><p>We keep the silhouettes relaxed, the graphics expressive and the styling easy. The goal is simple: put on a tee and feel like yourself.</p><Link className="btn btn-dark" href="/collection/all">SHOP THE COLLECTION <ArrowRight size={18}/></Link></div>
    </div></section>
    <section className="menu-values"><div className="container menu-values-grid">
      <div><Heart/><h3>Easy confidence</h3><p>Relaxed fits and expressive details made for everyday wear.</p></div>
      <div><Sparkles/><h3>Fresh edits</h3><p>New colours, moods and curated pieces keep the wardrobe moving.</p></div>
      <div><Star/><h3>Made to express</h3><p>Your T-shirt can say a lot without saying a word.</p></div>
    </div></section>
  </Shell>;
}

export function FaqPage(){
  const faqs=[
    ['Where can I buy LOLA ENGLAND?','Open any product to see its detail page and available shopping links.'],
    ['Do you offer women’s oversized T-shirts?','Yes. Oversized, graphic, printed and everyday women’s T-shirts are part of the LOLA collection.'],
    ['How do I choose my size?','Use the Size Guide before ordering. Product pages also show the available sizes when configured by the owner.'],
    ['How does shipping work?','Orders over ₹799 qualify for free shipping. Smaller orders use the configured delivery charge shown at checkout.'],
    ['How do returns and refunds work?','You can start a return from the Returns page. Eligibility and refund timing are explained in the return and refund policies.'],
    ['Can product prices, images and links change?','Yes. The private owner dashboard controls product pricing, images, descriptions, visibility, inventory and marketplace links.'],
  ];
  return <Shell eyebrow="NEED TO KNOW" title={<>Questions,<br/><em>answered.</em></>} lead="Everything you need to know before you pick your next LOLA tee.">
    <section className="menu-faq"><div className="container">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    <section className="menu-faq-cta"><div className="container"><div><p className="editorial-eyebrow">STILL CURIOUS?</p><h2>We’ve got you.</h2><p>Need help with an order, sizing or anything else?</p></div><Link className="btn btn-dark" href="/contact">CONTACT LOLA <ArrowRight size={18}/></Link></div></section>
  </Shell>;
}

export function JoinLolaPage(){
  return <Shell eyebrow="JOIN LOLA" title={<>First look.<br/><em>First picks.</em></>} lead="New drops, limited edits and easy everyday style — straight to your inbox.">
    <section className="menu-newsletter"><div className="container"><div className="menu-newsletter-card"><SafeImage src="/products/lola-brown-back.webp?v=8" fallbackSrc="/products/lola-brown-back.webp?v=8" alt="LOLA ENGLAND women’s T-shirt" width={900} height={1100}/><div><p className="editorial-eyebrow">THE LOLA LIST</p><h2>Be first<br/><em>in the mood.</em></h2><p>Sign up for new drops, limited edits and little LOLA updates.</p><NewsletterForm compact/></div></div></div></section>
  </Shell>;
}