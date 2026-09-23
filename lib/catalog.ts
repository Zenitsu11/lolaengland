import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/components/product-card';
import { products as demoProducts } from '@/data/products';

function pairFrontAndBack(items: Product[]): Product[] {
  const groups = new Map<string, Product[]>();
  for (const item of items) {
    const key = item.name.replace(/\s*\(Back\)\s*$/i, '').trim();
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return Array.from(groups.values()).map(group => {
    const front = group.find(item => !/\(Back\)\s*$/i.test(item.name)) ?? group[0];
    const back = group.find(item => /\(Back\)\s*$/i.test(item.name));
    return {
      ...front,
      name: front.name.replace(/\s*\(Back\)\s*$/i, '').trim(),
      secondary_image_url: back?.image_url,
      description: front.description,
    };
  });
}

export async function getPublicProducts():Promise<Product[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url || !key) return pairFrontAndBack(demoProducts);
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('products').select('id,name,price,mrp,rating,reviews,description,image_url,amazon_url,flipkart_url,featured,active').eq('active',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  if(error || !data?.length) return pairFrontAndBack(demoProducts);
  const mapped=data.map(p=>({id:p.id,name:p.name,price:p.price,mrp:p.mrp,rating:p.rating,reviews:p.reviews,description:p.description,image_url:p.image_url,amazon:p.amazon_url,flipkart:p.flipkart_url,tone:'#f0e2e5'}));
  return pairFrontAndBack(mapped);
}
