import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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

    let rejectedSuccessfully = false;

    // 1. Coba melalui RPC database standar
    try {
      const db = await createClient();
      const { error: rpcError } = await db.rpc("reject_booking", {
        p_id: p.data.id,
        p_reason: p.data.reason,
      });

      if (!rpcError) {
        rejectedSuccessfully = true;
      } else {
        console.warn("[reject_booking RPC returned error, executing robust fallback]:", rpcError.message);
      }
    } catch (rpcErr: any) {
      console.warn("[reject_booking RPC call failed]:", rpcErr?.message);
    }

    // 2. Fallback tangguh via createAdminClient
    if (!rejectedSuccessfully) {
      const adminDb = await createAdminClient();

      const { data: booking, error: bErr } = await adminDb
        .from("bookings")
        .select("*")
        .eq("id", p.data.id)
        .single();

      if (bErr || !booking) {
        throw new RequestError("Data pesanan tidak ditemukan.", 404);
      }

      if (!["pending_review", "approved"].includes(booking.status)) {
        throw new RequestError(
          `Pesanan saat ini berstatus '${booking.status}' dan tidak dapat ditolak.`,
          409,
        );
      }

      // Kembalikan sales_quotas
      try {
        const { data: quota } = await adminDb
          .from("sales_quotas")
          .select("id, booked_units")
          .eq("product_id", booking.product_id)
          .eq("date", booking.service_date)
          .maybeSingle();

        if (quota) {
          await adminDb
            .from("sales_quotas")
            .update({
              booked_units: Math.max(
                0,
                (quota.booked_units || 0) - (booking.num_units || 1),
              ),
            })
            .eq("id", quota.id);
        }
      } catch (quotaErr) {
        console.warn("[reject fallback quota warning]:", quotaErr);
      }

      // Update status booking ke cancelled_by_admin
      const nowIso = new Date().toISOString();
      const { error: updateErr } = await adminDb
        .from("bookings")
        .update({
          status: "cancelled_by_admin",
          rejected_at: nowIso,
          rejection_reason: p.data.reason,
        })
        .eq("id", p.data.id);

      if (updateErr) {
        console.error("[reject fallback update error]:", updateErr);
        throw new RequestError("Gagal menolak pesanan: " + updateErr.message, 500);
      }

      // Catat di booking_status_history
      try {
        await adminDb.from("booking_status_history").insert({
          booking_id: booking.id,
          old_status: booking.status,
          new_status: "cancelled_by_admin",
          changed_by: user.id,
          reason: p.data.reason,
        });
      } catch (histErr) {
        console.warn("[reject fallback history warning]:", histErr);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    revalidatePath("/akun/pesanan");
    revalidatePath("/buyer");
    revalidatePath("/buyer/pesanan");
    revalidatePath("/pesanan", "layout");

    return NextResponse.json({ success: true, message: "Pesanan berhasil ditolak." });
  } catch (e) {
    return errorResponse(e);
  }
}
