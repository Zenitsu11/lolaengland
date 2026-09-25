import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { getPublicProducts } from '@/lib/catalog';

const collections: Record<string,{title:string;eyebrow:string;copy:string}> = {
  'soft-pink': { title:'Soft Pink Edit', eyebrow:'01 · SOFT PINK', copy:'Pretty, playful and easy. A curated edit for soft colour days and relaxed styling.' },
  'after-dark': { title:'After Dark', eyebrow:'02 · AFTER DARK', copy:'Black tees, easy layers and a little more attitude for evenings and city plans.' },
  'graphic-girl': { title:'Graphic Girl', eyebrow:'03 · GRAPHIC GIRL', copy:'Statement graphics and expressive everyday tees made to say something.' },
  'new-mood': { title:'New Mood', eyebrow:'04 · NEW MOOD', copy:'Fresh everyday T-shirts for whatever mood you woke up in today.' },
  'oversized': { title:'Oversized Tees', eyebrow:'01 · OVERSIZED', copy:'Relaxed silhouettes and easy oversized fits.' },
  'graphics': { title:'Graphic Tees', eyebrow:'02 · GRAPHICS', copy:'Statement graphics and expressive prints.' },
  'everyday': { title:'Everyday Tees', eyebrow:'03 · EVERYDAY', copy:'Easy-to-wear T-shirts for everyday styling.' },
  'all': { title:'The LOLA Edit', eyebrow:'LOLA ENGLAND · WOMEN’S T-SHIRTS', copy:'Shop the complete women’s T-shirt edit.' },
};

export default async function CollectionPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const collection=collections[slug] ?? collections.all;
  const products=(await getPublicProducts()).filter(product => slug==='all' || product.categories?.includes(slug));
  return <main className="inner-page">
    <div className="container">
      <Link className="back-link" href="/"><ArrowLeft/> Back to LOLA</Link>
      <header className="inner-hero">
        <p className="editorial-eyebrow">{collection.eyebrow}</p>
        <h1>{collection.title}</h1>
        <p>{collection.copy}</p>
      </header>
      <div className="collection-toolbar"><span>{products.length} styles</span><Link href="/#shop">Back to trending <ArrowRight/></Link></div>
      <div className="product-grid">{products.map((product,index)=><ProductCard key={product.id} product={product} visualIndex={index}/>)}</div>
    </div>
  </main>;
}
