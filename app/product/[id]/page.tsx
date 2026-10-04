import Link from 'next/link';
import { ArrowLeft, Star, Ruler, Shirt, Sparkles } from 'lucide-react';
import { getPublicProducts, getPublicProductVariants } from '@/lib/catalog';
import { ProductGallery } from '@/components/product-gallery';
import { ProductPurchase } from '@/components/product-purchase';
import { ProductReviews } from '@/components/product-reviews';
import { RelatedProducts, RecentlyViewed } from '@/components/product-recommendations';
import './reviews.css';

export default async function ProductPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const products=await getPublicProducts();
  const product=products.find(p=>String(p.id)===id) ?? products[0];
  if(!product) return <main className="inner-page"><div className="container"><h1>Product not found</h1></div></main>;
  const variants=await getPublicProductVariants(String(product.id));
  const currentCategories=new Set((product.categories||[]).map((x)=>String(x).toLowerCase()));
  const related=products.filter((p)=>String(p.id)!==String(product.id) && (p.categories||[]).some((c)=>currentCategories.has(String(c).toLowerCase())));
  const fallbackRelated=products.filter((p)=>String(p.id)!==String(product.id));
  const recommendations=(related.length?related:fallbackRelated).slice(0,4);
  const fabric=product.fabric?.trim() || 'Soft everyday fabric';
  const occasions=product.occasions?.length ? product.occasions.join(' · ') : 'Casual · Everyday · Weekend';

  return <main className="inner-page product-detail-page"><div className="container">
    <Link className="back-link" href="/collection/all"><ArrowLeft/> Back to shop</Link>
    <div className="product-detail"><ProductGallery name={product.name} front={product.image_url} back={product.secondary_image_url} images={product.image_urls} videos={product.video_urls}/>
      <div className="product-detail-copy"><p className="editorial-eyebrow">LOLA ENGLAND · WOMEN’S T-SHIRT</p><h1>{product.name}</h1>
        <div className="detail-rating"><Star/><Star/><Star/><Star/><Star/> <span>{product.rating} · {Number(product.reviews||0).toLocaleString('en-IN')} ratings</span></div>
        <div className="detail-price">₹{product.price.toLocaleString('en-IN')} <del>₹{product.mrp.toLocaleString('en-IN')}</del></div>
        <p className="detail-description">{product.description || 'A relaxed women’s T-shirt made for easy everyday styling. Pair it with denim, cargos or your favourite layers.'}</p>
        <ProductPurchase product={{id:product.id,name:product.name,price:product.price,image_url:product.image_url,image_urls:product.image_urls,amazon:product.amazon,flipkart:product.flipkart,variants}}/>
      </div>
    </div>

    <section className="product-info-panels" aria-label="Product details">
      <article className="product-info-panel"><Shirt/><div><p className="editorial-eyebrow">FABRIC & CARE</p><h2>Made for easy days.</h2><p><strong>Fabric:</strong> {fabric}</p><p>Machine wash cold with similar colours. Do not bleach. Dry in shade. Iron inside out on low heat. Follow the garment label for the final care instructions.</p></div></article>
      <article className="product-info-panel"><Sparkles/><div><p className="editorial-eyebrow">STYLE NOTES</p><h2>How to wear it.</h2><p><strong>Occasion:</strong> {occasions}</p><p>Pair with denim, cargos, skirts or relaxed trousers. Choose your usual size for an easy fit; size up for a more oversized look.</p></div></article>
    </section>

    <section className="model-fit-card"><div><p className="editorial-eyebrow">FIT INFORMATION</p><h2>Find your best fit.</h2><p>Model height and size-worn information will appear here when it is added to this product. Until then, use the garment measurements and the size guide below for the most reliable choice.</p></div><Link href="#lola-size-guide" className="btn btn-dark">Open size guide <Ruler size={16}/></Link></section>

    <section id="lola-size-guide" className="size-guide">
      <div className="size-guide-heading"><div><p className="editorial-eyebrow">LOLA SIZE GUIDE</p><h2>Find your comfortable fit.</h2></div><Ruler/></div>
      <p>Measurements are body/chest references. If you are between sizes, compare with a favourite T-shirt you already own and choose the closest chest measurement.</p>
      <div className="size-table-wrap"><table><thead><tr><th>Size</th><th>India</th><th>International</th><th>Chest</th><th>Chest (cm)</th></tr></thead><tbody>
        <tr><td>XS</td><td>XS</td><td>XS</td><td>32–34 in</td><td>81–86</td></tr><tr><td>S</td><td>S</td><td>S</td><td>34–36 in</td><td>86–91</td></tr><tr><td>M</td><td>M</td><td>M</td><td>36–38 in</td><td>91–97</td></tr><tr><td>L</td><td>L</td><td>L</td><td>38–40 in</td><td>97–102</td></tr><tr><td>XL</td><td>XL</td><td>XL</td><td>40–42 in</td><td>102–107</td></tr><tr><td>XXL</td><td>XXL</td><td>XXL</td><td>42–44 in</td><td>107–112</td></tr><tr><td>3XL</td><td>3XL</td><td>3XL</td><td>44–46 in</td><td>112–117</td></tr>
      </tbody></table></div>
      <small>Tip: T-shirt cuts can vary by fit. The product's actual garment measurements should be treated as the final reference when available.</small>
    </section>
    <ProductReviews productId={String(product.id)}/>
    <RelatedProducts products={recommendations} title="You may also like" eyebrow="MORE LOLA" />
    <RelatedProducts products={recommendations.slice().reverse()} title="Complete the look" eyebrow="STYLE IT WITH" />
    <RecentlyViewed currentId={String(product.id)} products={products} />
  </div></main>;
}
