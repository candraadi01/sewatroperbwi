import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { idSchema } from "@/lib/validations/requests";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";

const payoutActionSchema = z
  .object({
    id: idSchema,
    action: z.enum(["approve", "reject", "transfer"]),
    adminNotes: z.string().trim().max(1000).default(""),
    transferProofUrl: z.string().trim().max(2000).default(""),
  })
  .strict();

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin")) {
      throw new RequestError("Akses admin diperlukan.", 403);
    }

    const parsed = payoutActionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      throw new RequestError("Data permohonan penarikan tidak valid.", 400);
    }

    const { id, action, adminNotes, transferProofUrl } = parsed.data;
    const db = await createAdminClient();

    let newStatus = "pending";
    if (action === "approve") newStatus = "approved";
    if (action === "reject") newStatus = "rejected";
    if (action === "transfer") newStatus = "transferred";

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      admin_notes: adminNotes || (action === "transfer" ? "Dana telah berhasil ditransfer ke rekening pemilik." : ""),
      processed_at: new Date().toISOString(),
    };

    if (transferProofUrl) {
      updatePayload.transfer_proof_url = transferProofUrl;
    }

    const { error } = await db
      .from("payout_requests")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      throw new RequestError(`Gagal memperbarui status penarikan: ${error.message}`, 500);
    }

    revalidatePath("/admin/penarikan");
    revalidatePath("/owner/tarik-dana");
    revalidatePath("/owner");

    return NextResponse.json({ success: true, status: newStatus });
  } catch (e) {
    return errorResponse(e);
  }
}
