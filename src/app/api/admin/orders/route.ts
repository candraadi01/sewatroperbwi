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
        status: z
          .enum([
            "confirmed",
            "in_progress",
            "completed",
            "cancelled_by_admin",
          ])
          .optional(),
        reason: z.string().trim().max(1000).optional().default(""),
        start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      })
      .strict()
      .safeParse(await readJson(request));

    if (!p.success) throw new RequestError("Data perubahan tidak valid.");
    if (!p.data.status && !p.data.start_time) {
      throw new RequestError("Status atau jam keberangkatan harus diisi.");
    }

    const db = await createClient();
    const { error } = await db.rpc("admin_update_trip", {
      p_id: p.data.id, p_status: p.data.status ?? null, p_note: p.data.reason,
      p_time: p.data.start_time ?? null,
    });
    if (error) throw new RequestError("Perubahan ditolak. Muat ulang pesanan dan periksa status terakhir.", 409);

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    revalidatePath("/akun/pesanan");
    revalidatePath("/buyer");
    revalidatePath("/buyer/pesanan");
    revalidatePath("/pesanan", "layout");

    return NextResponse.json({ success: true, message: "Status pesanan berhasil diperbarui." });
  } catch (e) {
    return errorResponse(e);
  }
}
