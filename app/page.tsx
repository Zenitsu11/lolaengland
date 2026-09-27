import Link from 'next/link';
import type { Metadata } from 'next';
import { Heart, Sparkles, Star } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { SafeImage } from '@/components/safe-image';
import { getPublicProducts, getSiteMedia, getStoreSettings, type SiteMedia } from '@/lib/catalog';
import { NewsletterForm } from '@/components/store-experience';
import { MoodHero } from '@/components/mood-hero';

const fallbackLooks = [
  { image: '/products/lola-mint-front.webp?v=6', tag: '01 · SOFT MINT', quote: 'Pretty, playful, effortless.', copy: 'Soft colour, relaxed energy and a tee that does the talking.', slug:'soft-pink' },
  { image: '/products/lola-navy-front.webp?v=6', tag: '02 · AFTER DARK', quote: 'Bold looks. Easy confidence.', copy: 'A darker mood for evenings, city walks and everything after sunset.', slug:'after-dark' },
  { image: '/products/lola-olive-front.webp?v=6', tag: '03 · GRAPHIC GIRL', quote: 'Say it with your tee.', copy: 'Statement graphics, easy silhouettes and main-character energy.', slug:'graphic-girl' },
  { image: '/products/lola-brown-back.webp?v=8', tag: '04 · NEW MOOD', quote: 'Cute today. Confident always.', copy: 'Fresh styling, relaxed fits and a little extra personality.', slug:'new-mood' },
];

const fallbackRail = [
  { image: '/products/lola-mint-back.webp?v=6', label: 'THE NEW', title: 'LOLA GIRL', slug:'all' },
  { image: '/products/lola-navy-back.webp?v=6', label: 'SOFT EDIT', title: 'Pretty energy.', slug:'soft-pink' },
  { image: '/products/lola-olive-back.webp?v=6', label: 'NIGHT EDIT', title: 'Own the night.', slug:'after-dark' },
  { image: '/products/lola-brown-back.webp?v=8', label: 'GRAPHIC EDIT', title: 'Make a statement.', slug:'graphic-girl' },
];

const fallbackCampaign = [
  { image:'/products/lola-mint-front.webp?v=6', label:'01 · SOFT MINT', title:'Pretty, but never predictable.', copy:'Soft colour, relaxed energy and a tee you will actually want to wear again tomorrow.', href:'/collection/soft-pink' },
  { image:'/products/lola-olive-front.webp?v=6', label:'02 · GRAPHIC MOOD', title:'Style that feels like you.', copy:'Easy fits, expressive graphics and confidence without trying too hard.', href:'/collection/graphic-girl' },
];

export const metadata: Metadata = { title: 'LOLA ENGLAND — Women’s T-Shirts', description: 'Shop expressive women’s T-shirts, oversized fits and everyday styles from LOLA ENGLAND.' };

export default async function Home() {
  const [products, storeSettings, lookbookMedia, campaignMedia, railMedia, joinMedia] = await Promise.all([
    getPublicProducts(), getStoreSettings(), getSiteMedia('lookbook'), getSiteMedia('campaign'), getSiteMedia('rail'), getSiteMedia('join-lola')
  ]);

  const looks = (lookbookMedia.length ? lookbookMedia : fallbackLooks.map((x,i)=>({...x,id:String(i),section:'lookbook',slot_key:String(i+1),title:x.tag,url:x.image,alt_text:'LOLA ENGLAND '+x.tag,href:'/collection/'+x.slug,active:true,sort_order:i+1} as SiteMedia))).map((m,index)=>{
    const fallback=fallbackLooks[index%fallbackLooks.length];
    return { ...fallback, image:m.url, tag:m.title||fallback.tag, slug:m.href.replace('/collection/','')||fallback.slug, alt:m.alt_text||('LOLA ENGLAND '+fallback.tag) };
  });

  const campaign = (campaignMedia.length ? campaignMedia : fallbackCampaign.map((x,i)=>({...x,id:String(i),section:'campaign',slot_key:String(i+1),title:x.label,url:x.image,alt_text:x.title,active:true,sort_order:i+1} as SiteMedia))).map((m,index)=>{
    const fallback=fallbackCampaign[index%fallbackCampaign.length];
    return { ...fallback, image:m.url, label:m.title||fallback.label, href:m.href||fallback.href, alt:m.alt_text||fallback.title };
  });

  const rail = (railMedia.length ? railMedia : fallbackRail.map((x,i)=>({...x,id:String(i),section:'rail',slot_key:String(i+1),title:x.label+' · '+x.title,url:x.image,alt_text:x.title,href:'/collection/'+x.slug,active:true,sort_order:i+1} as SiteMedia))).map((m,index)=>{
    const fallback=fallbackRail[index%fallbackRail.length];
    const parts=(m.title||'').split(' · ');
    return { ...fallback, image:m.url, label:parts[0]||fallback.label, title:parts.slice(1).join(' · ')||fallback.title, slug:m.href.replace('/collection/','')||fallback.slug, alt:m.alt_text||fallback.title };
  });

  const joinImage=joinMedia[0]?.url||'/products/lola-brown-back.webp?v=8';
  const joinAlt=joinMedia[0]?.alt_text||'LOLA ENGLAND women’s T-shirt';

  return <div id="top" className="editorial-home">
    <MoodHero imageUrls={storeSettings.hero_image_urls} videoUrls={storeSettings.hero_video_urls} />
    <div className="mood-bar"><div className="mood-track container"><span>WOMEN’S TEES</span><b>✦</b><span>OVERSIZED FITS</span><b>✦</b><span>EVERYDAY STYLE</span><b>✦</b><span>LOLA ENGLAND</span><b>✦</b><span>WEAR YOUR MOOD</span></div></div>
    <section className="editorial-section" id="models"><div className="container"><div className="editorial-section-head"><div><p className="editorial-eyebrow">THE LOLA LOOKBOOK</p><h2>She wears<br /><em>the mood.</em></h2></div><p>Different days. Different energy. One easy wardrobe of women’s T-shirts made to move with you.</p></div><div className="editorial-lookbook">{looks.map((look,index)=><Link className="editorial-look" href={look.href||'/collection/all'} key={look.id||look.tag}><div className="editorial-look-media image-safe"><SafeImage src={look.image} fallbackSrc={look.image} alt={look.alt} width={900} height={1100} loading="eager" decoding="async"/><span className="editorial-look-index">{String(index+1).padStart(2,'0')}</span></div><div className="editorial-look-copy"><span>{look.tag}</span><h3>“{look.quote}”</h3><p>{look.copy}</p><b>SHOP THIS MOOD →</b></div></Link>)}</div></div></section>
    <section className="editorial-campaign"><div className="container campaign-grid">{campaign.map((item,index)=><Link href={item.href} key={item.id||index} className="campaign-card image-safe"><SafeImage src={item.image} fallbackSrc={item.image} alt={item.alt} width={900} height={1100} loading="eager" decoding="async"/><div className="campaign-copy"><span>{item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></div></Link>)}</div></section>
    <section className="editorial-section"><div className="container"><div className="editorial-section-head"><div><p className="editorial-eyebrow">MORE WAYS TO WEAR IT</p><h2>One tee.<br /><em>Many moods.</em></h2></div><p>Meet the LOLA girl edit — soft, clean, bold and always a little bit extra.</p></div><div className="model-rail">{rail.map(look=><Link href={'/collection/' + look.slug} className="model-rail-card image-safe" key={look.id||look.title}><SafeImage src={look.image} fallbackSrc={look.image} alt={look.alt} width={900} height={1100} loading="eager" decoding="async"/><div className="rail-copy"><span>{look.label}</span><strong>{look.title}</strong></div></Link>)}</div></div></section>
    <section className="editorial-section editorial-products" id="shop"><div className="container"><div className="editorial-section-head"><div><p className="editorial-eyebrow">THE EVERYDAY EDIT</p><h2>Trending now</h2></div><p>Curated women’s T-shirts for every mood, from oversized graphics to easy everyday essentials.</p></div><div className="product-grid">{products.map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</div></div></section>
    <section className="editorial-section" id="about"><div className="container"><div className="editorial-section-head"><div><p className="editorial-eyebrow">WHY LOLA</p><h2>Made for<br /><em>real days.</em></h2></div><p>Style should feel good before it looks good. LOLA keeps the mood easy.</p></div><div className="editorial-values"><Link href="/collection/all" className="editorial-value"><Heart size={22}/><strong>Easy confidence</strong><p>Relaxed silhouettes and expressive graphics built for everyday wear.</p></Link><Link href="/collection/all" className="editorial-value"><Sparkles size={22}/><strong>Fresh edits</strong><p>New colours, moods and curated pieces keep the wardrobe feeling fresh.</p></Link><Link href="/collection/all" className="editorial-value"><Star size={22}/><strong>Marketplace ready</strong><p>Every product can open its detail page and connect to Amazon or Flipkart.</p></Link></div></div></section>
    <section className="container editorial-join" id="contact"><Link href="/collection/all" className="editorial-join-image image-safe"><SafeImage src={joinImage} fallbackSrc={joinImage} alt={joinAlt} width={900} height={1100} loading="eager" decoding="async"/></Link><div className="editorial-join-copy"><p className="editorial-eyebrow">JOIN THE LOLA LIST</p><h2>First look.<br /><em>First picks.</em></h2><p>New drops, limited edits and easy everyday style — straight to your inbox.</p><NewsletterForm compact /></div></section>
    <section className="editorial-section editorial-faq" id="faq"><div className="container"><div className="editorial-section-head"><div><p className="editorial-eyebrow">NEED TO KNOW</p><h2>Questions,<br /><em>answered.</em></h2></div></div><details><summary>Where can I buy LOLA ENGLAND?</summary><p>Open any product to see its detail page, then use the Amazon or Flipkart buttons.</p></details><details><summary>Do you offer women’s oversized T-shirts?</summary><p>Yes. Oversized, graphic, printed and everyday women’s T-shirts are part of the LOLA collection.</p></details><details><summary>Can prices, images and links change?</summary><p>Yes. Product pricing, images, descriptions, visibility and marketplace links can be managed from the private owner dashboard.</p></details></div></section>
  </div>;
}
