import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";

const createPayoutSchema = z
  .object({
    amount: z.number().int().min(100000, "Minimal penarikan adalah Rp 100.000"),
    bankName: z.string().trim().min(2, "Nama bank diperlukan").max(50),
    accountNumber: z.string().trim().min(4, "Nomor rekening minimal 4 digit").max(35),
    accountHolder: z.string().trim().min(2, "Nama pemilik rekening diperlukan").max(100),
  })
  .strict();

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || (!user.roles.includes("owner") && !user.roles.includes("admin"))) {
      throw new RequestError("Akses pemilik armada diperlukan.", 403);
    }

    const db = await createAdminClient();
    const { data: requests, error } = await db
      .from("payout_requests")
      .select("*")
      .eq("owner_id", user.id)
      .order("requested_at", { ascending: false });

    if (error) {
      throw new RequestError(`Gagal memuat riwayat penarikan: ${error.message}`, 500);
    }

    return NextResponse.json(requests || []);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user || (!user.roles.includes("owner") && !user.roles.includes("admin"))) {
      throw new RequestError("Akses pemilik armada diperlukan.", 403);
    }

    const body = await readJson(request);
    const parsed = createPayoutSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      throw new RequestError(msg || "Data penarikan dana tidak valid.", 400);
    }

    const { amount, bankName, accountNumber, accountHolder } = parsed.data;
    const db = await createAdminClient();

    // Simpan permohonan ke tabel payout_requests
    const { data: inserted, error } = await db
      .from("payout_requests")
      .insert({
        owner_id: user.id,
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
        status: "pending",
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new RequestError(`Gagal membuat permohonan penarikan: ${error.message}`, 500);
    }

    revalidatePath("/owner/tarik-dana");
    revalidatePath("/admin/penarikan");

    return NextResponse.json({
      success: true,
      message: "Permohonan penarikan dana berhasil dikirim! Menunggu konfirmasi admin.",
      data: inserted,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
