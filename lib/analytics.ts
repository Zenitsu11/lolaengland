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
    fbq?: (...args: unknown[]) => void;
  }
}

const META_EVENT_MAP: Record<string, string> = {
  view_item: 'ViewContent',
  search: 'Search',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase',
};

function trackMetaEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  const metaName = META_EVENT_MAP[name];
  if (!metaName) return;
  try {
    window.fbq('track', metaName, params);
  } catch {
    // Meta Pixel must never block checkout or shopping actions.
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['event', name, params]);
    }
    trackMetaEvent(name, params);
  } catch {
    // Analytics must never block checkout or shopping actions.
  }
}

export function trackViewItem(item: AnalyticsItem) {
  const quantity = Number(item.quantity || 1);
  trackEvent('view_item', {
    currency: 'INR',
    value: Number(item.price || 0),
    content_ids: item.item_id != null ? [String(item.item_id)] : undefined,
    content_name: item.item_name,
    content_type: 'product',
    contents: [{ id: String(item.item_id ?? item.item_name), quantity, item_price: Number(item.price || 0) }],
    items: [{ ...item, quantity }],
  });
}

export function trackSearch(query: string) {
  const searchString = query.trim();
  if (!searchString) return;
  trackEvent('search', { search_string: searchString });
}

export function trackAddToCart(item: AnalyticsItem) {
  const quantity = Number(item.quantity || 1);
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: Number(item.price || 0) * quantity,
    content_ids: item.item_id != null ? [String(item.item_id)] : undefined,
    content_name: item.item_name,
    content_type: 'product',
    contents: [{ id: String(item.item_id ?? item.item_name), quantity, item_price: Number(item.price || 0) }],
    items: [{ ...item, quantity }],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number) {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value,
    content_ids: items.map(item => String(item.item_id ?? item.item_name)),
    content_type: 'product',
    contents: items.map(item => ({ id: String(item.item_id ?? item.item_name), quantity: item.quantity || 1, item_price: Number(item.price || 0) })),
    items,
  });
}

export function trackAddPaymentInfo(items: AnalyticsItem[], value: number, method: string) {
  trackEvent('add_payment_info', {
    currency: 'INR',
    value,
    payment_type: method,
    content_ids: items.map(item => String(item.item_id ?? item.item_name)),
    content_type: 'product',
    contents: items.map(item => ({ id: String(item.item_id ?? item.item_name), quantity: item.quantity || 1, item_price: Number(item.price || 0) })),
    items,
  });
}

export function trackPurchase(transactionId: string, items: AnalyticsItem[], value: number, paymentType: string) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'INR',
    value,
    payment_type: paymentType,
    content_ids: items.map(item => String(item.item_id ?? item.item_name)),
    content_type: 'product',
    contents: items.map(item => ({ id: String(item.item_id ?? item.item_name), quantity: item.quantity || 1, item_price: Number(item.price || 0) })),
    items,
  });
}
