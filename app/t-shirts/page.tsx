import { getPublicProducts } from '@/lib/catalog';
import { TshirtsPage } from '@/components/menu-landing';
export default async function Page(){ return <TshirtsPage products={await getPublicProducts()}/>; }
export const metadata={title:'T-Shirts — LOLA ENGLAND',description:'Shop women’s T-shirts from LOLA ENGLAND.'};