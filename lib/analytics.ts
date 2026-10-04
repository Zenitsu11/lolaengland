export type AnalyticsItem = {
  item_id?: string | number;
  item_name: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(['event', name, params]);
  } catch {
    // Analytics must never block checkout or shopping actions.
  }
}

export function trackViewItem(item: AnalyticsItem) {
  trackEvent('view_item', {
    currency: 'INR',
    value: Number(item.price || 0),
    items: [{ ...item, quantity: item.quantity || 1 }],
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: Number(item.price || 0) * Number(item.quantity || 1),
    items: [{ ...item, quantity: item.quantity || 1 }],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number) {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value,
    items,
  });
}

export function trackAddPaymentInfo(items: AnalyticsItem[], value: number, method: string) {
  trackEvent('add_payment_info', {
    currency: 'INR',
    value,
    payment_type: method,
    items,
  });
}

export function trackPurchase(transactionId: string, items: AnalyticsItem[], value: number, paymentType: string) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'INR',
    value,
    payment_type: paymentType,
    items,
  });
}
