import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import {
  preparePayment,
  type StoredBooking,
  type PaymentAttempt,
} from "@/lib/services/booking";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";
import { rateLimit } from "@/lib/security/rate-limit";
import { midtransConfigured } from "@/lib/midtrans/snap";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user) throw new RequestError("Masuk terlebih dahulu.", 401);
    const { code } = await params;
    const cleanCode = (code || "").trim().toUpperCase();
    if (!/^TRP-\d{8}-[A-Z0-9]{10}$/.test(cleanCode))
      throw new RequestError("Kode tidak valid.");
    const input = z
      .object({
        idempotencyKey: z.string().uuid(),
        paymentChoice: z.enum(["dp", "full"]).optional(),
      })
      .strict()
      .safeParse(await readJson(request));
    if (!input.success) throw new RequestError("Permintaan tidak valid.");

    await rateLimit("payment:" + user.id, 10);
    const db = await createAdminClient();
    const { data: b, error } = await db
      .from("bookings")
      .select("*")
      .eq("booking_code", cleanCode)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !b) throw new RequestError("Pesanan tidak ditemukan.", 404);

    // === APPROVAL GATE: block payment until admin approves ===
    if (b.status === "pending_review") {
      throw new RequestError(
        "Pesanan sedang menunggu konfirmasi admin. Pembayaran baru dapat dilakukan setelah admin menyetujui ketersediaan kendaraan.",
        409,
      );
    }
    if (
      b.status === "approved" &&
      b.approval_expires_at &&
      new Date(b.approval_expires_at) < new Date()
    ) {
      throw new RequestError(
        "Waktu pembayaran telah berakhir. Hubungi admin untuk memperpanjang persetujuan.",
        409,
      );
    }
    // =========================================================

    if (
      ![
        "approved",
        "pending_payment",
        "payment_received",
        "confirmed",
        "in_progress",
      ].includes(b.status) ||
      b.outstanding < 1
    )
      throw new RequestError("Pesanan tidak memiliki tagihan aktif.", 409);

    if (!midtransConfigured())
      throw new RequestError("Midtrans belum dikonfigurasi. Pembayaran belum dapat dibuka.", 503);

    let booking = b as StoredBooking,
      attempt: PaymentAttempt;
    if (b.amount_paid > 0) {
      const r = await db.rpc("prepare_balance_payment", {
        p_booking_id: b.id,
        p_user_id: user.id,
        p_key: input.data.idempotencyKey,
      });
      if (r.error) throw new RequestError("Pelunasan belum dapat dibuat.", 409);
      const v = r.data as { booking: StoredBooking; attempt: PaymentAttempt };
      booking = v.booking;
      attempt = v.attempt;
    } else {
      const { data, error } = await db.rpc("prepare_initial_payment", {
        p_booking_id: b.id, p_user_id: user.id, p_choice: input.data.paymentChoice ?? b.payment_choice,
      });
      if (error || !data) throw new RequestError("Tagihan sudah berubah, terkunci pada pilihan sebelumnya, atau kedaluwarsa. Periksa kembali pesanan.", 409);
      booking = data.booking;
      attempt = data.attempt;
    }

    const payment = await preparePayment(booking, attempt);
    return NextResponse.json({ redirectUrl: payment.redirect_url, token: payment.token });
  } catch (e) {
    return errorResponse(e);
  }
}
