import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/security/redirect";
import { loginDestination } from "@/lib/auth/login-destination";
import { getAuthUser } from "@/lib/auth/helpers";

/**
 * Auth callback handler.
 * Menerima code dari OAuth (Google) atau magic link,
 * menukar dengan session, lalu redirect ke tujuan.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Validasi redirect — hanya izinkan path relatif (bukan URL eksternal)
  const redirectTo = safeRedirectPath(next);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const user = await getAuthUser();
        if (user) return NextResponse.redirect(`${origin}${loginDestination(redirectTo, user.roles)}`);
        await supabase.auth.signOut({ scope: "local" });
      }
    } catch {
      // A failed code exchange should return to the login form.
    }
  }

  // Jika error atau tidak ada code, redirect ke login dengan pesan error
  return NextResponse.redirect(
    `${origin}/auth/login?error=${searchParams.get("error") === "access_denied" ? "access_denied" : "auth_callback_failed"}&redirectTo=${encodeURIComponent(redirectTo)}`,
  );
}
