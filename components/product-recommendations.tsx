'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import type { Product } from '@/components/product-card';
import { ProductCard } from '@/components/product-card';

export function RecentlyViewed({ currentId, products }: { currentId: string; products: Product[] }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const key = 'lola-recently-viewed';
      const current = String(currentId);
      const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const next = [current, ...existing.filter((id) => id !== current)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
      setIds(next.filter((id) => id !== current));
    } catch {}
  }, [currentId]);

  const items = useMemo(() => ids.map((id) => products.find((p) => String(p.id) === id)).filter(Boolean) as Product[], [ids, products]);
  if (!items.length) return null;

  return <section className="recommendation-section recently-viewed">
    <div className="recommendation-heading"><div><p className="editorial-eyebrow">JUST FOR YOU</p><h2>Recently viewed</h2></div><Clock3 /></div>
    <div className="recommendation-grid">{items.slice(0, 4).map((product, index) => <ProductCard key={String(product.id)} product={product} visualIndex={index} />)}</div>
  </section>;
}

export function RelatedProducts({ products, title = 'You may also like', eyebrow = 'MORE LOLA' }: { products: Product[]; title?: string; eyebrow?: string }) {
  if (!products.length) return null;
  return <section className="recommendation-section">
    <div className="recommendation-heading"><div><p className="editorial-eyebrow">{eyebrow}</p><h2>{title}</h2></div><Link href="/collection/all" aria-label="Shop all LOLA products">Shop all <ArrowUpRight /></Link></div>
    <div className="recommendation-grid">{products.slice(0, 4).map((product, index) => <ProductCard key={String(product.id)} product={product} visualIndex={index} />)}</div>
  </section>;
}
