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
    return {...front,name:front.name.replace(/\s*\(Back\)\s*$/i,'').trim(),secondary_image_url:back?.image_url,image_urls:[front.image_url,back?.image_url].filter(Boolean) as string[]};
  });
}

export async function getPublicProducts():Promise<Product[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url || !key) return pairFrontAndBack(demoProducts);
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('products').select('id,name,price,mrp,rating,reviews,description,image_url,image_urls,video_urls,categories,amazon_url,flipkart_url,featured,active').eq('active',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
  const hasUsableImages=Boolean(data?.some(p=>typeof p.image_url==='string'&&p.image_url.trim()));
  if(error||!data?.length||!hasUsableImages) return pairFrontAndBack(demoProducts);
  return data.map(p=>{const urls=Array.isArray(p.image_urls)?p.image_urls.filter((v:unknown)=>typeof v==='string'&&v.trim()) as string[]:[];const front=p.image_url||urls[0]||'';return {id:p.id,name:p.name,price:p.price,mrp:p.mrp,rating:p.rating,reviews:p.reviews,description:p.description,image_url:front,image_urls:urls,secondary_image_url:urls[1],video_urls:Array.isArray(p.video_urls)?p.video_urls.filter((v:unknown)=>typeof v==='string'&&v.trim()) as string[]:[],categories:Array.isArray(p.categories)?p.categories:[],amazon:p.amazon_url,flipkart:p.flipkart_url,tone:'#f0e2e5'};});
}

export type ProductVariant={id:string;product_id:string;size:string;color:string;color_hex:string|null;sku:string|null;stock_qty:number;reserved_qty:number;low_stock_threshold:number;track_inventory:boolean;active:boolean};

export async function getPublicProductVariants(productId:string):Promise<ProductVariant[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return [];
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('product_variants').select('id,product_id,size,color,color_hex,sku,stock_qty,reserved_qty,low_stock_threshold,track_inventory,active').eq('product_id',productId).eq('active',true).order('size').order('color');
  if(error||!data)return [];
  return data as ProductVariant[];
}

export async function getStoreSettings(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const fallback={hero_image_urls:[],hero_video_urls:[]};
  if(!url||!key)return fallback;
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('store_settings').select('hero_image_urls,hero_video_urls').eq('id',true).single();
  if(error||!data)return fallback;
  return {hero_image_urls:Array.isArray(data.hero_image_urls)?data.hero_image_urls.filter((x:unknown)=>typeof x==='string'&&x.trim()).slice(0,4):[],hero_video_urls:Array.isArray(data.hero_video_urls)?data.hero_video_urls.filter((x:unknown)=>typeof x==='string'&&x.trim()).slice(0,2):[]};
}

export type SiteMedia={id:string;section:string;slot_key:string;title:string;url:string;alt_text:string;href:string;active:boolean;sort_order:number};
export async function getSiteMedia(section:string):Promise<SiteMedia[]>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if(!url||!key)return [];
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('site_media').select('id,section,slot_key,title,url,alt_text,href,active,sort_order').eq('section',section).eq('active',true).order('sort_order',{ascending:true});
  if(error||!data)return []; return data as SiteMedia[];
}
