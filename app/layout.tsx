import type { Metadata } from 'next';
import './globals.css';
import './lola-enhancements.css';
import './lola-editorial.css';
import './admin-enhancements.css';
import './store-enhancements.css';
import './final-polish.css';
import './clickable-store.css';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/components/cart-provider';

export const metadata: Metadata = {
  title: 'LOLA ENGLAND — Women’s T-Shirts',
  description: 'LOLA ENGLAND — expressive women’s T-shirts, editorial looks and everyday style.',
  metadataBase: new URL('https://lolaengland.vercel.app'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
