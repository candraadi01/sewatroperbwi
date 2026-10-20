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
        note: z.string().trim().max(1000).default(""),
        expiresHours: z.number().int().min(1).max(720).default(48),
      })
      .strict()
      .safeParse(await readJson(request));
    if (!p.success) throw new RequestError("Data tidak valid.");
    const db = await createClient();
    const { error } = await db.rpc("approve_booking", {
      p_id: p.data.id,
      p_note: p.data.note,
      p_expires_hours: p.data.expiresHours,
    });
    if (error)
      throw new RequestError(
        "Persetujuan gagal. Pastikan booking masih berstatus menunggu konfirmasi.",
        409,
      );
    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    revalidatePath("/akun/pesanan");
    revalidatePath("/pesanan", "layout");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e);
  }
}