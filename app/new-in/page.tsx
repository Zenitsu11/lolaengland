import { getPublicProducts } from '@/lib/catalog';
import { NewInPage } from '@/components/menu-landing';
export default async function Page(){ return <NewInPage products={await getPublicProducts()}/>; }
export const metadata={title:'New In — LOLA ENGLAND',description:'The latest women’s T-shirts and fresh edits from LOLA ENGLAND.'};