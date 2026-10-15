import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export type UserRole = "buyer" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  roles: UserRole[];
}

/**
 * Ambil user yang terverifikasi dari server.
 * Returns null jika tidak terautentikasi atau jika Supabase belum dikonfigurasi.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseUrl.includes("placeholder")
  ) {
    return null;
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Ambil profil dan roles
    const [profileResult, rolesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email, avatar_url, account_status")
        .eq("id", user.id)
        .single(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);

    // Cek akun diblokir
    if (
      profileResult.error ||
      rolesResult.error ||
      !profileResult.data ||
      profileResult.data.account_status !== "active"
    ) {
      return null;
    }

    const roles = (rolesResult.data ?? []).map((r) => r.role as UserRole);

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: profileResult.data?.full_name ?? "",
      avatarUrl: profileResult.data?.avatar_url ?? "",
      roles,
    };
  } catch (e) {
    console.warn("[getAuthUser] Error checking user:", e);
    return null;
  }
});

/**
 * Server guard untuk route admin.
 * Redirect ke /login jika bukan admin.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user || !user.roles.includes("admin")) {
    if (user) redirect("/akses-ditolak");
    redirect("/login?redirectTo=%2Fadmin");
  }

  return user;
}

export async function requireBuyer(returnTo = "/akun/pesanan") {
  const user = await getAuthUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
  return user;
}

/**
 * Cek apakah user memiliki role tertentu.
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}
