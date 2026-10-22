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
    if (!user?.roles.includes("admin") && !user?.roles.includes("owner"))
      throw new RequestError("Akses admin atau pemilik diperlukan.", 403);
    const p = z
      .object({
        id: idSchema,
        reason: z.string().trim().min(1).max(1000),
      })
      .strict()
      .safeParse(await readJson(request));
    if (!p.success) throw new RequestError("Alasan penolakan harus diisi.");
    const db = await createClient();
    const { error } = await db.rpc("reject_booking", {
      p_id: p.data.id,
      p_reason: p.data.reason,
    });
    if (error)
      throw new RequestError(
        "Penolakan gagal. Pastikan booking masih berstatus menunggu konfirmasi atau disetujui.",
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