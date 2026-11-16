import type { Metadata } from 'next';

export const revalidate = 30;
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CollectionFilters } from '@/components/collection-filters';
import { getPublicProductVariantsForProducts, getPublicProducts } from '@/lib/catalog';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lolaengland.com';

type Collection = { title: string; eyebrow: string; copy: string; description: string; category?: string };
const collections: Record<string, Collection> = {
  'soft-pink': { title: 'The Soft Edit', eyebrow: 'THE LOLA EDIT', copy: 'Soft colour, considered details and effortless pieces for everyday dressing.', description: 'Discover the soft edit from LOLA ENGLAND: relaxed womenswear and easy everyday styling.', category: 'soft-pink' },
  'after-dark': { title: 'After Dark', eyebrow: 'THE LOLA EDIT', copy: 'A more considered mood for evenings, city plans and everything after sunset.', description: 'Explore the After Dark edit from LOLA ENGLAND.', category: 'after-dark' },
  'graphic-girl': { title: 'Graphic Girl', eyebrow: 'THE LOLA EDIT', copy: 'Expressive graphics and confident everyday pieces.', description: 'Shop expressive graphic womenswear from LOLA ENGLAND.', category: 'graphic-girl' },
  'new-mood': { title: 'New Mood', eyebrow: 'JUST LANDED', copy: 'Fresh pieces for whatever mood the day brings.', description: 'Discover new arrivals from LOLA ENGLAND.', category: 'new-mood' },
  oversized: { title: 'Relaxed & Oversized', eyebrow: 'THE FIT EDIT', copy: 'Relaxed silhouettes and easy proportions, made for off-duty days.', description: 'Shop relaxed and oversized women’s clothing from LOLA ENGLAND.', category: 'oversized' },
  graphics: { title: 'Graphic Tees', eyebrow: 'THE T-SHIRT EDIT', copy: 'Statement graphics and expressive everyday styling.', description: 'Shop women’s graphic T-shirts from LOLA ENGLAND.', category: 'graphics' },
  everyday: { title: 'Everyday Essentials', eyebrow: 'THE WARDROBE EDIT', copy: 'Easy-to-wear pieces for the rhythm of everyday life.', description: 'Discover everyday womenswear essentials from LOLA ENGLAND.', category: 'everyday' },
  'tops-t-shirts': { title: 'Tops & T-Shirts', eyebrow: 'CLOTHING', copy: 'The foundations of a considered wardrobe, from everyday tops to statement tees.', description: 'Shop women’s tops and T-shirts from LOLA ENGLAND.', category: 'tops-t-shirts' },
  lingerie: { title: 'Lingerie & Intimates', eyebrow: 'LINGERIE', copy: 'A considered intimates edit, designed around comfort, fit and feeling good.', description: 'Explore women’s lingerie and intimates from LOLA ENGLAND.', category: 'lingerie' },
  nightwear: { title: 'Nightwear & Loungewear', eyebrow: 'AT HOME', copy: 'Comfort-led layers for slower mornings and softer evenings.', description: 'Discover women’s nightwear and loungewear from LOLA ENGLAND.', category: 'nightwear' },
  dresses: { title: 'Dresses & Jumpsuits', eyebrow: 'CLOTHING', copy: 'One-piece dressing, from easy daytime shapes to occasion-ready looks.', description: 'Shop women’s dresses and jumpsuits from LOLA ENGLAND.', category: 'dresses' },
  bottoms: { title: 'Trousers, Skirts & Shorts', eyebrow: 'CLOTHING', copy: 'The pieces that bring every outfit together.', description: 'Explore women’s trousers, skirts and shorts from LOLA ENGLAND.', category: 'bottoms' },
  knitwear: { title: 'Knitwear', eyebrow: 'CLOTHING', copy: 'Soft layers and considered textures for every season.', description: 'Shop women’s knitwear from LOLA ENGLAND.', category: 'knitwear' },
  outerwear: { title: 'Coats & Jackets', eyebrow: 'CLOTHING', copy: 'Finishing layers with a little more presence.', description: 'Discover women’s coats and jackets from LOLA ENGLAND.', category: 'outerwear' },
  activewear: { title: 'Activewear', eyebrow: 'MOVE YOUR WAY', copy: 'Comfortable pieces for movement, rest and everything between.', description: 'Explore women’s activewear from LOLA ENGLAND.', category: 'activewear' },
  swimwear: { title: 'Swimwear', eyebrow: 'HOLIDAY EDIT', copy: 'Swim and holiday essentials for time in the sun.', description: 'Discover women’s swimwear from LOLA ENGLAND.', category: 'swimwear' },
  accessories: { title: 'Accessories', eyebrow: 'THE FINISHING TOUCH', copy: 'The details that make a look your own.', description: 'Shop women’s fashion accessories from LOLA ENGLAND.', category: 'accessories' },
  all: { title: 'The LOLA Edit', eyebrow: 'LOLA ENGLAND · WOMENSWEAR', copy: 'Discover the LOLA ENGLAND edit of women’s clothing and everyday style.', description: 'Shop contemporary womenswear from LOLA ENGLAND: clothing, everyday essentials and considered style.' },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections[slug] ?? collections.all;
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `${SITE_URL}/collection/${encodeURIComponent(slug in collections ? slug : 'all')}` },
    openGraph: { type: 'website', siteName: 'LOLA ENGLAND', title: `${collection.title} | LOLA ENGLAND`, description: collection.description },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections[slug] ?? collections.all;
  const products = (await getPublicProducts()).filter(product => {
    const categories = (product.categories || []).map(value => value.toLowerCase().replace(/\s+/g, '-'));
    if (slug === 'all') return true;
    if (slug === 'tops-t-shirts') return !categories.length || categories.includes('tops-t-shirts') || categories.some(value => ['soft-pink','after-dark','graphic-girl','new-mood','oversized','graphics','everyday'].includes(value));
    if (!collections[slug]?.category) return false;
    return categories.includes(collection.category!.toLowerCase()) || categories.includes(slug);
  });
  const variants = products.flatMap(product => product.variants || []) as Awaited<ReturnType<typeof getPublicProductVariantsForProducts>>;
  return <main className="inner-page collection-page">
    <div className="container">
      <Link className="back-link" href="/"><ArrowLeft /> Back to LOLA</Link>
      <header className="inner-hero collection-hero">
        <p className="editorial-eyebrow">{collection.eyebrow}</p>
        <h1>{collection.title}</h1>
        <p>{collection.copy}</p>
      </header>
      <div className="collection-toolbar"><span>{products.length} {products.length === 1 ? 'style' : 'styles'}</span><Link href="/#shop">Explore the edit <ArrowRight /></Link></div>
      {products.length ? <CollectionFilters products={products} variants={variants} /> : <section className="collection-coming-soon"><p className="editorial-eyebrow">A NEW CHAPTER IS TAKING SHAPE</p><h2>Something lovely is on its way.</h2><p>We’re carefully curating this collection. In the meantime, explore the pieces currently available in the LOLA edit.</p><Link className="btn btn-dark" href="/collection/all">Explore available styles</Link></section>}
    </div>
  </main>;
}
