import Link from 'next/link';
import type { ReactNode } from 'react';

export function PolicyPage({ eyebrow, title, intro, children }: { eyebrow:string; title:string; intro:string; children:ReactNode }) {
  return <main className="info-page"><div className="container info-page-inner">
    <Link href="/" className="info-back">← Back to LOLA ENGLAND</Link>
    <p className="editorial-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="info-intro">{intro}</p>
    <div className="info-content">{children}</div>
  </div></main>;
}
