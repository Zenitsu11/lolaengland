import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { NewsletterForm } from '@/components/store-experience';

export function Footer() {
  return <footer className="footer british-footer" id="contact">
    <section className="trust-strip" aria-label="LOLA ENGLAND service benefits">
      <div className="container trust-grid">
        <div><RotateCcw /><h3>Considered Service</h3><p>Helpful support throughout your order journey.</p></div>
        <div><Truck /><h3>Delivery Information</h3><p>Delivery options and charges shown at checkout.</p></div>
        <div><Sparkles /><h3>The LOLA Edit</h3><p>A considered selection of women’s fashion and everyday style.</p></div>
        <div><ShieldCheck /><h3>Secure Checkout</h3><p>Protected payment options at checkout.</p></div>
      </div>
    </section>
    <div className="footer-community">
      <div className="container footer-community-grid">
        <div><span className="footer-eyebrow">A NOTE FROM LOLA</span><h2>Good things<br /><em>are worth sharing.</em></h2><p>New edits, thoughtful styling and the occasional little surprise.</p></div>
        <NewsletterForm compact />
      </div>
    </div>
    <div className="container footer-grid">
      <div className="footer-brand-block">
        <img src="/logo.svg" alt="LOLA ENGLAND" className="footer-brand-logo" />
        <p>A considered edit of women’s fashion, from everyday essentials to pieces that make an entrance.</p>
      </div>
      <div className="footer-group"><h4>SHOP</h4><Link href="/new-in">New In</Link><Link href="/collection/all">All Available Styles</Link><Link href="/collection/tops-t-shirts">Tops & T-Shirts</Link><Link href="/collection/dresses">Dresses</Link><Link href="/collection/outerwear">Coats & Jackets</Link></div>
      <div className="footer-group"><h4>THE WARDROBE</h4><Link href="/collection/lingerie">Lingerie & Intimates</Link><Link href="/collection/nightwear">Nightwear</Link><Link href="/collection/knitwear">Knitwear</Link><Link href="/collection/activewear">Activewear</Link><Link href="/lookbook">The Lookbook</Link></div>
      <div className="footer-group"><h4>HELP & INFORMATION</h4><Link href="/our-story">Our Story</Link><Link href="/contact">Contact</Link><Link href="/faq">FAQs</Link><Link href="/shipping-returns">Delivery & Returns</Link><Link href="/returns">Start a Return</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms & Conditions</Link></div>
    </div>
    <div className="container footer-bottom">
      <span>© {new Date().getFullYear()} LOLA ENGLAND</span>
      <span>British-inspired womenswear · Designed in Jaipur, India</span>
      <span>Secure checkout</span>
    </div>
  </footer>;
}
