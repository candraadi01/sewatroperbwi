import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback handler.
 * Menerima code dari OAuth (Google) atau magic link,
 * menukar dengan session, lalu redirect ke tujuan.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Validasi redirect — hanya izinkan path relatif (bukan URL eksternal)
  const redirectTo = next.startsWith('/') ? next : '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect ke tujuan awal setelah login berhasil
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Jika error atau tidak ada code, redirect ke login dengan pesan error
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed&redirectTo=${encodeURIComponent(redirectTo)}`
  );
}
