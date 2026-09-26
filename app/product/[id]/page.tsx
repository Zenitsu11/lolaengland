import Link from 'next/link';
import { ArrowLeft, Star, Ruler } from 'lucide-react';
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
    <div className="product-detail"><ProductGallery name={product.name} front={product.image_url} back={product.secondary_image_url} images={product.image_urls} videos={product.video_urls}/>
      <div className="product-detail-copy"><p className="editorial-eyebrow">LOLA ENGLAND · WOMEN’S T-SHIRT</p><h1>{product.name}</h1>
        <div className="detail-rating"><Star/><Star/><Star/><Star/><Star/> <span>{product.rating} · {Number(product.reviews||0).toLocaleString('en-IN')} ratings</span></div>
        <div className="detail-price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div>
        <p className="detail-description">{product.description || 'A relaxed women’s T-shirt made for easy everyday styling. Pair it with denim, cargos or your favourite layers.'}</p>
        <ProductPurchase product={{id:product.id,name:product.name,price:product.price,image_url:product.image_url,image_urls:product.image_urls,amazon:product.amazon,flipkart:product.flipkart}}/>
      </div>
    </div>
    <section id="lola-size-guide" className="size-guide">
      <div className="size-guide-heading"><div><p className="editorial-eyebrow">LOLA SIZE GUIDE</p><h2>Find your comfortable fit.</h2></div><Ruler/></div>
      <p>Measurements are body/chest references. If you are between sizes, compare with a favourite T-shirt you already own and choose the closest chest measurement.</p>
      <div className="size-table-wrap"><table><thead><tr><th>Size</th><th>India</th><th>International</th><th>Chest</th><th>Chest (cm)</th></tr></thead><tbody>
        <tr><td>XS</td><td>XS</td><td>XS</td><td>32–34 in</td><td>81–86</td></tr><tr><td>S</td><td>S</td><td>S</td><td>34–36 in</td><td>86–91</td></tr><tr><td>M</td><td>M</td><td>M</td><td>36–38 in</td><td>91–97</td></tr><tr><td>L</td><td>L</td><td>L</td><td>38–40 in</td><td>97–102</td></tr><tr><td>XL</td><td>XL</td><td>XL</td><td>40–42 in</td><td>102–107</td></tr><tr><td>XXL</td><td>XXL</td><td>XXL</td><td>42–44 in</td><td>107–112</td></tr><tr><td>3XL</td><td>3XL</td><td>3XL</td><td>44–46 in</td><td>112–117</td></tr>
      </tbody></table></div>
      <small>Tip: T-shirt cuts can vary by fit. The product's actual garment measurements should be treated as the final reference when available.</small>
    </section>
  </div></main>;
}
