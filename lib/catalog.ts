import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/components/product-card';
import { products as demoProducts } from '@/data/products';

export async function getPublicProducts():Promise<Product[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url || !key) return demoProducts;
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('products').select('id,name,price,mrp,rating,reviews,description,image_url,amazon_url,flipkart_url,featured,active').eq('active',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  if(error || !data?.length) return demoProducts;
  return data.map(p=>({id:p.id,name:p.name,price:p.price,mrp:p.mrp,rating:p.rating,reviews:p.reviews,description:p.description,image_url:p.image_url,amazon:p.amazon_url,flipkart:p.flipkart_url,tone:'#f0e2e5'}));
}
