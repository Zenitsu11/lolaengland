import type { MetadataRoute } from 'next';
import { getPublicProducts } from '@/lib/catalog';

const BASE_URL = 'https://lolaengland.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    '/',
    '/t-shirts',
    '/new-in',
    '/collection/all',
    '/about',
    '/contact',
    '/faq',
    '/shipping-returns',
    '/returns',
    '/track-order',
  ];

  const products = await getPublicProducts();
  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/product/${encodeURIComponent(String(product.id))}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === '/' ? ('daily' as const) : ('weekly' as const),
      priority: path === '/' ? 1 : 0.7,
    })),
    ...productRoutes,
  ];
}
