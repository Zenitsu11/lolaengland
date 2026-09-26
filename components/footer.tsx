import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { NewsletterForm } from '@/components/store-experience';

export function Footer(){
  return <footer className="footer" id="contact">
    <section className="trust-strip" aria-label="LOLA ENGLAND service benefits">
      <div className="container trust-grid">
        <div><RotateCcw/><h3>Easy Returns</h3><p>Simple return support for eligible orders.</p></div>
        <div><Truck/><h3>Fast Shipping</h3><p>Clear delivery charges before you pay.</p></div>
        <div><Sparkles/><h3>Premium Quality</h3><p>Thoughtful fits, prints and everyday fabrics.</p></div>
        <div><ShieldCheck/><h3>Secure UPI</h3><p>Protected checkout with direct UPI QR payment.</p></div>
      </div>
    </section>

    <div className="footer-community">
      <div className="container footer-community-grid">
        <div><span className="footer-eyebrow">JOIN OUR COMMUNITY</span><h2>First look.<br/><em>First picks.</em></h2><p>New drops, exclusive offers and behind-the-scenes LOLA news.</p></div>
        <NewsletterForm compact />
      </div>
    </div>

    <div className="container footer-grid">
      <div className="footer-brand-block">
        <img src="/Lola england.jpg" alt="LOLA ENGLAND" className="footer-brand-logo"/>
        <p>Women’s T-shirts made for everyday confidence. Express your mood, your way.</p>
      </div>
      <div className="footer-group"><h4>SHOP</h4><Link href="/collection/all">All T-shirts</Link><Link href="/collection/oversized">Oversized</Link><Link href="/collection/graphics">Graphic</Link><Link href="/collection/everyday">Everyday</Link></div>
      <div className="footer-group"><h4>ABOUT</h4><a href="/#about">Our Story</a><a href="/#models">Lookbook</a><a href="/#faq">FAQ</a><a href="/#contact">Contact</a></div>
      <div className="footer-group"><h4>HELP</h4><a href="/shipping-returns">Delivery & Returns</a><a href="/refund-policy">Refund Policy</a><a href="/terms">Terms & Conditions</a><a href="/privacy">Privacy Policy</a></div>
    </div>

    <div className="container footer-bottom">
      <span>© {new Date().getFullYear()} LOLA ENGLAND</span>
      <span>Made with intention · Jaipur, India</span>
      <span>Secure UPI checkout</span>
    </div>
  </footer>;
}