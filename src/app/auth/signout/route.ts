import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

/**
 * Sign out handler.
 * POST-only untuk CSRF protection.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
