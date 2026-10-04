import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="store-error-page" aria-labelledby="not-found-title">
      <div className="store-error-inner">
        <p className="editorial-eyebrow">LOLA ENGLAND · 404</p>
        <h1 id="not-found-title">This page took a<br /><em>wrong turn.</em></h1>
        <p className="store-error-copy">
          The page you’re looking for may have moved, sold out, or never existed. Let’s get you back to the collection.
        </p>
        <div className="store-error-actions">
          <Link className="btn btn-dark" href="/">Back to home</Link>
          <Link className="btn btn-light" href="/collection/all">Shop all T-shirts</Link>
        </div>
      </div>
    </section>
  );
}
