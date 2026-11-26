import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";

const updateBuyerProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    phone: z
      .string()
      .trim()
      .max(25, "Nomor WhatsApp maksimal 25 karakter")
      .optional()
      .default(""),
    avatarUrl: z.string().trim().optional().default(""),
  })
  .strict();

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user) {
      throw new RequestError("Akses tidak diizinkan. Silakan login terlebih dahulu.", 401);
    }

    const body = await readJson(request);
    const parsed = updateBuyerProfileSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      throw new RequestError(msg || "Data profil tidak valid.", 400);
    }

    const { fullName, phone, avatarUrl } = parsed.data;
    const db = await createClient();

    // 1. Update profiles table
    const { error: profileError } = await db
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || "",
        avatar_url: avatarUrl || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[buyer/profile] Error updating profile in table:", profileError);
      throw new RequestError("Gagal memperbarui profil di database: " + profileError.message, 500);
    }

    // 2. Update auth user metadata so session stays fresh
    try {
      await db.auth.updateUser({
        data: {
          full_name: fullName,
          name: fullName,
          phone: phone || "",
          avatar_url: avatarUrl || "",
        },
      });
    } catch (authErr) {
      console.warn("[buyer/profile] Note updating auth metadata:", authErr);
    }

    revalidatePath("/buyer/profil");
    revalidatePath("/buyer");
    revalidatePath("/buyer/pesanan");

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui.",
      data: {
        fullName,
        phone,
        avatarUrl,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

