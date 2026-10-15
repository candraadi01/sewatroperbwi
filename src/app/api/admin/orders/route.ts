import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { idSchema } from "@/lib/validations/requests";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin"))
      throw new RequestError("Akses admin diperlukan.", 403);
    const p = z
      .object({
        id: idSchema,
        status: z.enum([
          "confirmed",
          "in_progress",
          "completed",
          "cancelled_by_admin",
        ]),
        reason: z.string().trim().max(1000),
      })
      .strict()
      .safeParse(await readJson(request));
    if (!p.success) throw new RequestError("Data perubahan tidak valid.");
    const db = await createClient();
    const { error } = await db.rpc("set_booking_status", {
      p_id: p.data.id,
      p_status: p.data.status,
      p_note: p.data.reason,
    });
    if (error)
      throw new RequestError(
        "Perubahan status tidak diizinkan. Periksa pembayaran dan status saat ini.",
        409,
      );
    revalidatePath("/admin");
    revalidatePath("/akun/pesanan");
    revalidatePath("/pesanan", "layout");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e);
  }
}
