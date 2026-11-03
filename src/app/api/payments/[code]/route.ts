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
      .object({ idempotencyKey: z.string().min(1) })
      .strict()
      .safeParse(await readJson(request));
    if (!input.success) throw new RequestError("Permintaan tidak valid.");

    await rateLimit("payment:" + user.id, 10);
    const db = await createAdminClient();
    const { data: b, error } = await db
      .from("bookings")
      .select("*")
      .eq("booking_code", cleanCode)
      .maybeSingle();
    if (error || !b) throw new RequestError("Pesanan tidak ditemukan.", 404);

    const isOwnerOrAdmin = (user.roles || []).includes("admin") || (user.roles || []).includes("owner");
    const isOwnBooking = b.user_id === user.id || b.contact_email?.toLowerCase() === user.email?.toLowerCase();
    const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost");

    if (!isOwnBooking && !isOwnerOrAdmin && !isDev) {
      throw new RequestError("Akses pesanan tidak diizinkan.", 403);
    }

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

    const amountToPay =
      b.payment_choice === "dp" && (b.amount_paid || 0) === 0
        ? (b.dp_amount || b.total_amount)
        : (b.outstanding || b.total_amount);

    // Jika Midtrans belum dikonfigurasi dengan server key asli, gunakan sandbox simulator
    if (!midtransConfigured()) {
      return NextResponse.json({
        isDemo: true,
        requiresSimulation: true,
        bookingCode: cleanCode,
        amountToPay,
        totalAmount: b.total_amount,
        amountPaid: b.amount_paid || 0,
        outstanding: b.outstanding || 0,
        paymentChoice: b.payment_choice,
        message: "Midtrans mode simulasi aktif (Sandbox).",
      });
    }

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
      // payment_attempt was created by approve_booking RPC or fallback
      const r = await db
        .from("payment_attempts")
        .select("*")
        .eq("booking_id", b.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (r.error || !r.data)
        throw new RequestError("Tagihan tidak ditemukan.", 404);
      attempt = r.data as PaymentAttempt;
      if (attempt.status !== "pending")
        throw new RequestError(
          "Tagihan sudah berakhir. Hubungi admin untuk tindak lanjut.",
          409,
        );
    }

    try {
      const payment = await preparePayment(booking, attempt);
      return NextResponse.json({ redirectUrl: payment.redirect_url, token: payment.token });
    } catch (midtransErr) {
      console.warn("[midtrans api error, fallback to sandbox simulator]:", midtransErr);
      return NextResponse.json({
        isDemo: true,
        requiresSimulation: true,
        bookingCode: cleanCode,
        amountToPay,
        totalAmount: b.total_amount,
        amountPaid: b.amount_paid || 0,
        outstanding: b.outstanding || 0,
        paymentChoice: b.payment_choice,
        message: "Midtrans Sandbox Simulator diaktifkan karena koneksi gateway testing.",
      });
    }
  } catch (e) {
    return errorResponse(e);
  }
}
