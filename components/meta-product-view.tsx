'use client';

import { useEffect } from 'react';
import { trackViewItem } from '@/lib/analytics';

export function MetaProductView({ id, name, price }: { id: string | number; name: string; price: number }) {
  useEffect(() => {
    trackViewItem({ item_id: id, item_name: name, price, quantity: 1 });
  }, [id, name, price]);

  return null;
}
