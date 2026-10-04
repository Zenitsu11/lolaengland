'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function trackPageView() {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;

  try {
    window.fbq('track', 'PageView');
  } catch {
    // Meta Pixel must never block navigation or shopping actions.
  }
}

export function MetaPixelPageViews() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const send = () => {
      if (cancelled) return;
      if (typeof window.fbq === 'function') {
        trackPageView();
        return;
      }
      attempts += 1;
      if (attempts < 50) window.setTimeout(send, 100);
    };

    send();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
