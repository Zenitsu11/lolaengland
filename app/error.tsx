'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('LOLA storefront error:', error);
  }, [error]);

  return (
    <section className="store-error-page" aria-labelledby="store-error-title">
      <div className="store-error-inner">
        <p className="editorial-eyebrow">LOLA ENGLAND · SOMETHING WENT WRONG</p>
        <h1 id="store-error-title">A little <em>glitch.</em><br />Nothing dramatic.</h1>
        <p className="store-error-copy">
          We couldn’t load this part of the store. Try again, or head back to the collection while we sort it out.
        </p>
        <div className="store-error-actions">
          <button className="btn btn-dark" type="button" onClick={() => reset()}>Try again</button>
          <Link className="btn btn-light" href="/">Back to home</Link>
        </div>
      </div>
    </section>
  );
}
