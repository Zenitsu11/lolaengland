import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const db = getSupabaseAdmin();
    if (!db) return NextResponse.json({ error: 'Newsletter service is not configured.' }, { status: 503 });

    const { error } = await db.from('newsletter_subscribers').upsert(
      { email, source: 'website', active: true },
      { onConflict: 'email', ignoreDuplicates: false }
    );
    if (error) return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 });
  }
}
