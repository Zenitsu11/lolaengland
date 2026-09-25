'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError('Supabase is not configured on this deployment.');
      return;
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError('Supabase is not configured on this deployment.');
      return;
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      return;
    }

    setMessage('Password updated successfully. You can now sign in to the LOLA admin panel.');
    setPassword('');
    setConfirm('');
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-mark">LOLA</div>
        <p className="eyebrow">OWNER PASSWORD RECOVERY</p>
        <h1>Create a new password.</h1>
        <p>Use at least 8 characters. Keep it unique to your LOLA admin account.</p>
        {!ready && !error ? <div className="login-success">Checking your recovery link…</div> : null}
        <form onSubmit={submit}>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
            />
          </label>
          <button className="btn btn-dark" type="submit" disabled={!ready}>
            UPDATE PASSWORD
          </button>
          {message && <div className="login-success">{message}</div>}
          {error && <div className="login-error">{error}</div>}
        </form>
        <a className="back-store" href="/admin/login">← Back to admin login</a>
      </div>
    </main>
  );
}
