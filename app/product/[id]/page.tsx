import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { getPublicProducts } from '@/lib/catalog';
import { ProductGallery } from '@/components/product-gallery';
import { ProductPurchase } from '@/components/product-purchase';

export default async function ProductPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const products=await getPublicProducts();
  const product=products.find(p=>String(p.id)===id) ?? products[0];
  if(!product) return <main className="inner-page"><div className="container"><h1>Product not found</h1></div></main>;
  return <main className="inner-page product-detail-page"><div className="container">
    <Link className="back-link" href="/collection/all"><ArrowLeft/> Back to shop</Link>
    <div className="product-detail"><ProductGallery name={product.name} front={product.image_url} back={product.secondary_image_url} images={product.image_urls}/>
      <div className="product-detail-copy"><p className="editorial-eyebrow">LOLA ENGLAND · WOMEN’S T-SHIRT</p><h1>{product.name}</h1>
        <div className="detail-rating"><Star/><Star/><Star/><Star/><Star/> <span>{product.rating} · {Number(product.reviews||0).toLocaleString('en-IN')} ratings</span></div>
        <div className="detail-price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div>
        <p className="detail-description">{product.description || 'A relaxed women’s T-shirt made for easy everyday styling. Pair it with denim, cargos or your favourite layers.'}</p>
        <div className="size-note"><strong>Available sizes</strong><span>S · M · L · XL · XXL</span></div>
        <ProductPurchase product={{id:product.id,name:product.name,price:product.price,image_url:product.image_url,image_urls:product.image_urls,amazon:product.amazon,flipkart:product.flipkart}}/>
      </div>
    </div>
  </div></main>;
}