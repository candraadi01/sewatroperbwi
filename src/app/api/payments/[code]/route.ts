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
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user) throw new RequestError("Masuk terlebih dahulu.", 401);
    const { code } = await params;
    if (!/^TRP-\d{8}-[A-F0-9]{10}$/.test(code))
      throw new RequestError("Kode tidak valid.");
    const input = z
      .object({ idempotencyKey: z.uuid() })
      .strict()
      .safeParse(await readJson(request));
    if (!input.success) throw new RequestError("Permintaan tidak valid.");
    await rateLimit("payment:" + user.id, 10);
    const db = await createAdminClient();
    const { data: b, error } = await db
      .from("bookings")
      .select("*")
      .eq("booking_code", code)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !b) throw new RequestError("Pesanan tidak ditemukan.", 404);
    if (
      ![
        "pending_payment",
        "payment_received",
        "confirmed",
        "in_progress",
      ].includes(b.status) ||
      b.outstanding < 1
    )
      throw new RequestError("Pesanan tidak memiliki tagihan aktif.", 409);
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
      const r = await db
        .from("payment_attempts")
        .select("*")
        .eq("booking_id", b.id)
        .order("created_at")
        .limit(1)
        .single();
      if (r.error || !r.data)
        throw new RequestError("Tagihan tidak ditemukan.", 404);
      attempt = r.data as PaymentAttempt;
      if (attempt.status !== "pending")
        throw new RequestError(
          "Tagihan sudah berakhir. Hubungi admin untuk tindak lanjut.",
          409,
        );
    }
    const payment = await preparePayment(booking, attempt);
    return NextResponse.json({ redirectUrl: payment.redirect_url });
  } catch (e) {
    return errorResponse(e);
  }
}
