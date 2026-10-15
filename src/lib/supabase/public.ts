import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./config";
export function createPublicClient() {
  if (!isSupabaseConfigured()) throw new Error("Supabase belum dikonfigurasi.");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
