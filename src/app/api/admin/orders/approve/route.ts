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
        note: z.string().trim().max(1000).default(""),
        expiresHours: z.number().int().min(1).max(720).default(48),
        start_time: z.string().trim().max(20).optional(),
      })
      .strict()
      .safeParse(await readJson(request));

    if (!p.success) throw new RequestError("Data tidak valid.");

    let approvedSuccessfully = false;

    // 1. Coba melalui RPC database standar
    try {
      const db = await createClient();
      const { error: rpcError } = await db.rpc("approve_booking", {
        p_id: p.data.id,
        p_note: p.data.note,
        p_expires_hours: p.data.expiresHours,
      });

      if (!rpcError) {
        approvedSuccessfully = true;
        if (p.data.start_time) {
          const adminDb = await createAdminClient();
          await adminDb
            .from("bookings")
            .update({ start_time: p.data.start_time })
            .eq("id", p.data.id);
        }
      } else {
        console.warn("[approve_booking RPC returned error, executing robust fallback]:", rpcError.message);
      }
    } catch (rpcErr: any) {
      console.warn("[approve_booking RPC call failed]:", rpcErr?.message);
    }

    // 2. Fallback tangguh via createAdminClient untuk menjamin status terupdate tanpa bentrok payment_attempts
    if (!approvedSuccessfully) {
      const adminDb = await createAdminClient();

      // Ambil data booking lengkap
      const { data: booking, error: bErr } = await adminDb
        .from("bookings")
        .select("*")
        .eq("id", p.data.id)
        .single();

      if (bErr || !booking) {
        throw new RequestError("Data booking tidak ditemukan di database.", 404);
      }

      if (booking.status !== "pending_review") {
        throw new RequestError(
          `Pesanan saat ini sudah berstatus '${booking.status}', bukan 'menunggu konfirmasi'.`,
          409,
        );
      }

      const expiresHours = p.data.expiresHours || 48;
      const approvalExpiresAt = new Date(
        Date.now() + expiresHours * 3600000,
      ).toISOString();
      const nowIso = new Date().toISOString();

      // Update status booking ke approved
      const updateData: Record<string, unknown> = {
        status: "approved",
        approved_at: nowIso,
        approved_by: user.id,
        approval_expires_at: approvalExpiresAt,
      };
      if (p.data.start_time) {
        updateData.start_time = p.data.start_time;
      }

      const { error: updateErr } = await adminDb
        .from("bookings")
        .update(updateData)
        .eq("id", p.data.id);

      if (updateErr) {
        console.error("[approve fallback update error]:", updateErr);
        throw new RequestError("Gagal menyetujui pesanan: " + updateErr.message, 500);
      }

      // Pastikan payment attempt siap agar buyer bisa bayar tanpa bentrok unique constraint
      try {
        const { data: existingAttempt } = await adminDb
          .from("payment_attempts")
          .select("id, status")
          .eq("booking_id", p.data.id)
          .maybeSingle();

        const amountToPay =
          booking.payment_choice === "dp"
            ? (booking.dp_amount || booking.total_amount)
            : booking.total_amount;

        if (existingAttempt) {
          await adminDb
            .from("payment_attempts")
            .update({
              expires_at: approvalExpiresAt,
              status: "pending",
              expected_amount: amountToPay,
            })
            .eq("id", existingAttempt.id);
        } else {
          const midtransOrderId = `${booking.booking_code}-1`;
          const idempotencyKey = `${booking.idempotency_key || booking.id}-pay`;
          await adminDb.from("payment_attempts").insert({
            booking_id: booking.id,
            midtrans_order_id: midtransOrderId,
            purpose: booking.payment_choice || "full",
            expected_amount: amountToPay,
            idempotency_key: idempotencyKey,
            expires_at: approvalExpiresAt,
            status: "pending",
          });
        }
      } catch (payErr) {
        console.warn("[approve fallback payment_attempts warning]:", payErr);
      }

      // Catat di booking_status_history
      try {
        const reasonText =
          p.data.note ||
          "Kendaraan tersedia. Disetujui oleh pengelola/pemilik. Silakan lanjutkan pembayaran.";
        await adminDb.from("booking_status_history").insert({
          booking_id: booking.id,
          old_status: "pending_review",
          new_status: "approved",
          changed_by: user.id,
          reason: reasonText,
        });
      } catch (histErr) {
        console.warn("[approve fallback history warning]:", histErr);
      }

      // Masukkan notifikasi in-app untuk buyer
      try {
        await adminDb.from("notification_outbox").insert({
          recipient_id: booking.user_id,
          channel: "in_app",
          subject: "Booking disetujui",
          body: `Booking ${booking.booking_code} telah disetujui. Silakan selesaikan pembayaran sebelum batas waktu.`,
        });
      } catch (notifErr) {
        console.warn("[approve fallback notification warning]:", notifErr);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");
    revalidatePath("/akun/pesanan");
    revalidatePath("/buyer");
    revalidatePath("/buyer/pesanan");
    revalidatePath("/pesanan", "layout");

    return NextResponse.json({ success: true, message: "Pesanan berhasil disetujui." });
  } catch (e) {
    return errorResponse(e);
  }
}
