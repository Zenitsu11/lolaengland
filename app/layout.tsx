import type { Metadata } from 'next';
import './globals.css';
import './lola-enhancements.css';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'LOLA ENGLAND — Women’s T-Shirts',
  description: 'Elegant everyday T-shirts with a soft, feminine identity.',
  metadataBase: new URL('https://lolaengland.netlify.app'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
