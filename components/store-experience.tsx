'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUp, Check, MessageCircle, X } from 'lucide-react';

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not subscribe.');
      setDone(true); setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe.');
    } finally { setBusy(false); }
  }

  if (done) return <div className={'newsletter-success' + (compact ? ' compact' : '')}><Check size={18}/> You’re on the LOLA list.</div>;

  return <form className={'newsletter-form' + (compact ? ' compact' : '')} onSubmit={submit}>
    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" aria-label="Email address" required />
    <button type="submit" disabled={busy}>{busy ? 'JOINING…' : compact ? 'JOIN' : 'SUBMIT →'}</button>
    {error ? <small>{error}</small> : null}
  </form>;
}

export function StoreExperience() {
  const [cookies, setCookies] = useState<boolean | null>(null);
  const [popup, setPopup] = useState(false);
  const [chat, setChat] = useState(false);
  const [top, setTop] = useState(false);

  useEffect(() => {
    try {
      const choice = localStorage.getItem('lola-cookie-consent');
      if (choice) setCookies(true);
      const seen = sessionStorage.getItem('lola-newsletter-seen');
      const timer = window.setTimeout(() => {
        if (!seen) setPopup(true);
      }, 6500);
      const onScroll = () => setTop(window.scrollY > 500);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => { window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
    } catch { setCookies(false); }
  }, []);

  function saveCookies(choice: 'all' | 'necessary') {
    localStorage.setItem('lola-cookie-consent', choice);
    setCookies(true);
  }

  function closePopup() {
    try { sessionStorage.setItem('lola-newsletter-seen', '1'); } catch {}
    setPopup(false);
  }

  return <>
    <button className="floating-chat" onClick={()=>setChat(x=>!x)} aria-label="LOLA help"><MessageCircle size={21}/></button>
    {chat ? <div className="chat-popover">
      <button className="chat-close" onClick={()=>setChat(false)} aria-label="Close"><X size={17}/></button>
      <span className="editorial-eyebrow">LOLA HELP</span>
      <strong>Need a little help?</strong>
      <p>Questions about sizing, orders or products? Send us a message from the contact section.</p>
      <a href="/#contact" onClick={()=>setChat(false)}>CONTACT LOLA →</a>
    </div> : null}

    {top ? <button className="back-to-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top"><ArrowUp size={18}/></button> : null}

    {popup ? <div className="store-modal-backdrop" role="dialog" aria-modal="true" aria-label="Join the LOLA list">
      <div className="newsletter-modal">
        <button className="modal-close" onClick={closePopup} aria-label="Close"><X size={25}/></button>
        <div className="newsletter-modal-art"><span>LOLA</span><small>ENGLAND · GIRLS ONLY</small></div>
        <div className="newsletter-modal-copy">
          <span className="editorial-eyebrow">JOIN OUR COMMUNITY</span>
          <h2>First look.<br/><em>First picks.</em></h2>
          <p>Sign up for new drops, exclusive offers, styling inspiration and behind-the-scenes LOLA news.</p>
          <NewsletterForm />
          <small className="newsletter-fine">By subscribing, you agree to receive marketing emails. Unsubscribe anytime.</small>
        </div>
      </div>
    </div> : null}

    {cookies !== true ? <div className="cookie-banner">
      <div><strong>We use cookies to improve your LOLA experience.</strong><p>Essential cookies keep your cart and checkout working. Optional cookies can help us understand how the store is used.</p></div>
      <div className="cookie-actions"><button className="cookie-manage" onClick={()=>saveCookies('necessary')}>Decline</button><button onClick={()=>saveCookies('all')}>Allow All</button></div>
    </div> : null}
  </>;
}
