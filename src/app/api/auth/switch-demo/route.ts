import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@sewatrooperbwi.com",
    password: "AdminTrooper2026!",
    redirectUrl: "/admin",
    name: "Super Admin",
  },
  owner: {
    email: "owner@sewatrooperbwi.com",
    password: "OwnerTrooper2026!",
    redirectUrl: "/owner",
    name: "Owner (Mitra Trooper)",
  },
  buyer: {
    email: "buyer@sewatrooperbwi.com",
    password: "BuyerTrooper2026!",
    redirectUrl: "/buyer",
    name: "Buyer (Pelanggan)",
  },
} as const;

export type DemoRoleKey = keyof typeof DEMO_ACCOUNTS;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetRole = body?.role as DemoRoleKey;

    if (!targetRole || !DEMO_ACCOUNTS[targetRole]) {
      return NextResponse.json(
        { success: false, error: "Role akun demo tidak valid" },
        { status: 400 }
      );
    }

    const target = DEMO_ACCOUNTS[targetRole];

    try {
      const supabase = await createClient();

      // Sign in on server so that setAll writes cookies to response
      let { data, error } = await supabase.auth.signInWithPassword({
        email: target.email,
        password: target.password,
      });

      // Auto create buyer if missing in new Supabase instance
      if (error && targetRole === "buyer") {
        const signUpResult = await supabase.auth.signUp({
          email: target.email,
          password: target.password,
          options: {
            data: {
              full_name: "Pelanggan Demo Trooper",
              phone: "081234567890",
            },
          },
        });

        if (!signUpResult.error) {
          const retry = await supabase.auth.signInWithPassword({
            email: target.email,
            password: target.password,
          });
          data = retry.data;
          error = retry.error;
        }
      }

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Gagal masuk ke akun demo",
            target,
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        redirectUrl: target.redirectUrl,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: targetRole,
        },
      });
    } catch (supabaseError: any) {
      // In case server has no direct network, client fallback will handle sign in
      return NextResponse.json({
        success: false,
        error: supabaseError?.message || "Koneksi Supabase server terhambat",
        fallbackToClient: true,
        target,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

