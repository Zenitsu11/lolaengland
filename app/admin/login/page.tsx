'use client';
import { FormEvent, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    });
    setLoading(false);
    if (res.ok) window.location.href = '/admin';
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Incorrect admin ID or password.');
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-mark">LOLA</div>
        <p className="eyebrow">PRIVATE OWNER AREA</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage products, prices and marketplace links.</p>
        <form onSubmit={submit}>
          <label>Admin ID<input name="username" type="email" autoComplete="username" required placeholder="Enter admin ID" /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Enter password" /></label>
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? 'SIGNING IN…' : <>ENTER DASHBOARD <ArrowRight /></>}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <a className="back-store" href="/">← Back to store</a>
      </div>
    </main>
  );
}
