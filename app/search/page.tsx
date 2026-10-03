import { ProductSearch } from '@/components/product-search';
import { getPublicProducts } from '@/lib/catalog';

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const {q=''}=await searchParams;
  const products=await getPublicProducts();
  return <main className="utility-page"><div className="search-page-inner"><p className="editorial-eyebrow">LOLA SEARCH</p><h1>Find your mood.</h1><p className="search-intro">Search our women’s T-shirts by name, style, collection, fabric or occasion.</p><ProductSearch products={products} initialQuery={q}/></div></main>;
}
