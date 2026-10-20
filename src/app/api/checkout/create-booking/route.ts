import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAuthUser } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { createBookingSchema } from "@/lib/validations/requests";
import { calculateQuote } from "@/lib/pricing/engine";
import { getProductById } from "@/lib/services/catalog";
import { getBusinessSettings } from "@/lib/services/business";
import { getSiteSettings } from "@/lib/services/settings";
import type { StoredBooking } from "@/lib/services/booking";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user)
      throw new RequestError("Masuk terlebih dahulu untuk memesan.", 401);
    const parsed = createBookingSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new RequestError(parsed.error.issues[0].message);
    const p = parsed.data;
    await rateLimit("checkout:" + user.id, 10);
    const settings = await getSiteSettings();
    if (!settings.checkout_enabled)
      throw new RequestError(
        "Pemesanan belum dibuka oleh pengelola.",
        503,
      );
    let quote;
    try {
      quote = await calculateQuote(p);
    } catch (e) {
      throw new RequestError(
        e instanceof Error ? e.message : "Harga tidak tersedia.",
      );
    }
    if (quote.is_sample_pricing)
      throw new RequestError("Harga paket belum disetujui pengelola.", 409);
    if (quote.total_amount !== p.expectedTotal)
      throw new RequestError(
        "Harga berubah. Kembali ke detail paket untuk memeriksa rincian terbaru.",
        409,
      );
    const [product, business, db] = await Promise.all([
      getProductById(p.productId),
      getBusinessSettings(),
      createAdminClient(),
    ]);
    const payload = {
      user_id: user.id,
      product_id: p.productId,
      service_date: p.serviceDate,
      start_time: p.startTime,
      num_units: p.numUnits,
      num_passengers: p.numPassengers,
      pickup_zone_id: p.pickupZoneId ?? "",
      pickup_address: p.pickupAddress,
      promo_id: quote.promo_id ?? "",
      promo_code: quote.promo_code ?? "",
      base_price: quote.base_price_per_unit,
      pickup_cost: quote.pickup_surcharge,
      subtotal: quote.subtotal_units + quote.pickup_surcharge,
      discount_amount: quote.discount_amount,
      total_amount: quote.total_amount,
      dp_amount: quote.dp_amount,
      dp_percentage: Math.round(quote.dp_percentage * 100),
      contact_name: p.contactName,
      contact_phone: p.contactPhone,
      contact_email: p.contactEmail,
      payment_choice: p.paymentChoice,
      notes: p.notes,
      price_snapshot: quote,
      product_snapshot: product,
      terms_snapshot: {
        version: business.version,
        balance_deadline_hours: business.balance_payment_deadline_hours,
        cancellation_policy: business.cancellation_policy,
        refund_policy: business.refund_policy,
        privacy_policy: business.privacy_policy,
        terms: business.terms_and_conditions,
        product_terms: product?.terms_content,
      },
      confirmation_hours: business.confirmation_deadline_hours,
      idempotency_key: p.idempotencyKey,
      request_hash: createHash("sha256")
        .update(JSON.stringify({ ...p, idempotencyKey: undefined }))
        .digest("hex"),
    };
    const { data, error } = await db.rpc("reserve_booking", { p: payload });
    if (error)
      throw new RequestError(
        "Pesanan belum dapat disimpan. Periksa kuota dan promo atau hubungi admin.",
        409,
      );
    const stored = data as { booking: StoredBooking; attempt: null };
    // Booking is now in pending_review. No payment attempt created yet.
    // Admin must approve before buyer can pay.
    return NextResponse.json(
      {
        success: true,
        data: {
          bookingId: stored.booking.booking_code,
          status: "pending_review",
          message:
            "Pesanan berhasil dibuat. Admin akan mengonfirmasi ketersediaan kendaraan. Pantau status di Pesanan Saya.",
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}

