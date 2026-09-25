'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError('Supabase is not configured on this deployment.');
      setLoading(false);
      return;
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + '/admin/update-password',
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setMessage('Password reset link sent. Check your email inbox (and Spam/Promotions).');
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-mark">LOLA</div>
        <p className="eyebrow">OWNER PASSWORD RECOVERY</p>
        <h1>Reset your password.</h1>
        <p>Enter the admin email and we’ll send you a secure reset link.</p>
        <form onSubmit={submit}>
          <label>
            Admin email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
            />
          </label>
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? 'SENDING…' : 'SEND RESET LINK'}
          </button>
          {message && <div className="login-success">{message}</div>}
          {error && <div className="login-error">{error}</div>}
        </form>
        <a className="back-store" href="/admin/login">← Back to admin login</a>
      </div>
    </main>
  );
}
