import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";

/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 * Menggunakan anon key — user-scoped, RLS aktif.
 * Cookie-based session management sesuai rekomendasi @supabase/ssr.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) throw new Error("Supabase belum dikonfigurasi.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Read-only context
        }
      },
    },
  });
}

/**
 * Supabase admin client — menggunakan service role key.
 * HANYA untuk operasi terprivilege di server.
 */
export async function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !key || /placeholder|your-service/.test(key))
    throw new Error("Konfigurasi server Supabase belum lengkap.");
  // No cookies: a user session must never replace the service-role identity.
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
