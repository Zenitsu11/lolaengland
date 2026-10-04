import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import './lola-enhancements.css';
import './lola-editorial.css';
import './admin-enhancements.css';
import './store-enhancements.css';
import './final-polish.css';
import './menu-pages.css';
import './hero-media-fix.css';
import './video-polish.css';
import './clickable-store.css';
import './payment-checkout.css';
import './returns-polish.css';
import './collection-filters.css';
import './search.css';
import './store-error.css';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/components/cart-provider';
import { getSiteMedia } from '@/lib/catalog';

const GA_MEASUREMENT_ID = 'G-2R4KNXCNNM';
const META_PIXEL_ID = '2753313303532561';
const SITE_URL = 'https://lolaengland.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LOLA ENGLAND — Women’s T-Shirts',
    template: '%s | LOLA ENGLAND',
  },
  description: 'Shop expressive women’s T-shirts from LOLA ENGLAND — graphic tees, everyday styles and statement looks.',
  applicationName: 'LOLA ENGLAND',
  keywords: ['women’s t-shirts', 'women t shirts India', 'graphic t-shirts', 'oversized t-shirts', 'LOLA ENGLAND'],
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'LOLA ENGLAND',
    url: SITE_URL,
    title: 'LOLA ENGLAND — Women’s T-Shirts',
    description: 'Expressive women’s T-shirts, editorial looks and everyday style.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOLA ENGLAND — Women’s T-Shirts',
    description: 'Expressive women’s T-shirts, editorial looks and everyday style.',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LOLA ENGLAND',
  url: SITE_URL,
  logo: `${SITE_URL}/Lola%20england.jpg`,
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LOLA ENGLAND',
  url: SITE_URL,
  description: 'Women’s T-shirts, graphic tees, oversized styles and everyday looks from LOLA ENGLAND.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const logoUrl = (await getSiteMedia('brand-logo'))[0]?.url || '/Lola england.jpg';
  return (
    <html lang="en">
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
 n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
 n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
 t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
 (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fbq('init','${META_PIXEL_ID}');
 fbq('track','PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <CartProvider>
          <SiteHeader logoUrl={logoUrl} />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
