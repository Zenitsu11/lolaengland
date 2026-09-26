import { getPublicProducts } from '@/lib/catalog';
import { WishlistClient } from '@/components/wishlist-client';

export default async function WishlistPage(){
  const products=await getPublicProducts();
  return <WishlistClient products={products}/>;
}
