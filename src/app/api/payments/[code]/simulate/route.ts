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

export const dynamic = "force-dynamic";

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
    if (!cleanCode) throw new RequestError("Kode pesanan tidak valid.", 400);

    const body = (await readJson(request).catch(() => ({}))) as Record<string, unknown>;
    const paymentMethod = typeof body?.method === "string" ? body.method : "qris";

    const adminDb = await createAdminClient();

    // 1. Ambil data booking
    const { data: booking, error: bErr } = await adminDb
      .from("bookings")
      .select("*")
      .eq("booking_code", cleanCode)
      .maybeSingle();

    if (bErr || !booking) {
      throw new RequestError("Pesanan tidak ditemukan.", 404);
    }

    // Pastikan pesanan milik user atau user adalah admin/owner, atau dalam mode dev
    const isOwnerOrAdmin = (user.roles || []).includes("admin") || (user.roles || []).includes("owner");
    const isOwnBooking = booking.user_id === user.id || booking.contact_email?.toLowerCase() === user.email?.toLowerCase();
    const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost");

    if (!isOwnBooking && !isOwnerOrAdmin && !isDev) {
      throw new RequestError("Akses tidak diizinkan.", 403);
    }

    if (booking.status === "pending_review") {
      throw new RequestError("Pesanan masih menunggu persetujuan admin.", 409);
    }

    // Jika pesanan sudah lunas, langsung kembalikan sukses
    if (booking.status === "confirmed" && (booking.outstanding || 0) <= 0) {
      return NextResponse.json({
        success: true,
        message: "Pesanan ini sudah lunas terkonfirmasi.",
        newStatus: "confirmed",
      });
    }

    // Hitung nominal yang dibayarkan berdasarkan pilihan DP atau LUNAS
    const bodyChoice =
      typeof body?.paymentChoice === "string" && ["dp", "full"].includes(body.paymentChoice)
        ? (body.paymentChoice as "dp" | "full")
        : (booking.payment_choice || "dp");

    const dpVal = booking.dp_amount || Math.round(booking.total_amount * 0.3);
    const amountToPay =
      bodyChoice === "full"
        ? (booking.outstanding || booking.total_amount)
        : (booking.amount_paid || 0) === 0
        ? dpVal
        : (booking.outstanding || booking.total_amount);

    const newAmountPaid = (booking.amount_paid || 0) + amountToPay;
    const newOutstanding = Math.max(0, booking.total_amount - newAmountPaid);

    // Jika lunas -> confirmed, jika baru DP -> payment_received
    const newStatus = newOutstanding === 0 ? "confirmed" : "payment_received";
    const nowIso = new Date().toISOString();

    // 2. Update booking
    const { error: updateErr } = await adminDb
      .from("bookings")
      .update({
        amount_paid: newAmountPaid,
        outstanding: newOutstanding,
        status: newStatus,
        payment_choice: bodyChoice,
        confirmed_at: nowIso,
      })
      .eq("id", booking.id);

    if (updateErr) {
      console.error("[simulate payment error]:", updateErr);
      throw new RequestError("Gagal memperbarui status pembayaran: " + updateErr.message, 500);
    }

    // 3. Update / buat payment_attempts menjadi 'settlement'
    try {
      const { data: attempts } = await adminDb
        .from("payment_attempts")
        .select("id")
        .eq("booking_id", booking.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (attempts && attempts.length > 0) {
        await adminDb
          .from("payment_attempts")
          .update({
            status: "settlement",
            paid_amount: amountToPay,
            payment_type: paymentMethod,
            updated_at: nowIso,
          })
          .eq("id", attempts[0].id);
      } else {
        await adminDb.from("payment_attempts").insert({
          booking_id: booking.id,
          midtrans_order_id: `${booking.booking_code}-demo-${Date.now()}`,
          purpose: booking.payment_choice || "full",
          expected_amount: amountToPay,
          paid_amount: amountToPay,
          status: "settlement",
          payment_type: paymentMethod,
          idempotency_key: `${booking.id}-sim-${Date.now()}`,
        });
      }
    } catch (payErr) {
      console.warn("[simulate payment attempt warning]:", payErr);
    }

    // 4. Catat di booking_status_history
    try {
      await adminDb.from("booking_status_history").insert({
        booking_id: booking.id,
        old_status: booking.status,
        new_status: newStatus,
        changed_by: user.id,
        reason: `Pembayaran ${newOutstanding === 0 ? "Lunas" : "DP"} berhasil diverifikasi via Midtrans Sandbox Simulator (${paymentMethod.toUpperCase()}).`,
      });
    } catch (histErr) {
      console.warn("[simulate history warning]:", histErr);
    }

    // 5. Buat notifikasi in-app
    try {
      await adminDb.from("notification_outbox").insert({
        recipient_id: booking.user_id,
        channel: "in_app",
        subject: "Pembayaran berhasil diverifikasi",
        body: `Pembayaran untuk booking ${booking.booking_code} telah diterima. Jadwal armada Anda resmi terkonfirmasi.`,
      });
    } catch (notifErr) {
      console.warn("[simulate notification warning]:", notifErr);
    }

    // Revalidate semua halaman terkait
    revalidatePath("/pesanan");
    revalidatePath(`/pesanan/${cleanCode}`);
    revalidatePath(`/pesanan/${cleanCode}/nota`);
    revalidatePath("/buyer");
    revalidatePath("/buyer/pesanan");
    revalidatePath(`/buyer/pesanan/${cleanCode}/nota`);
    revalidatePath(`/buyer/pesanan/${cleanCode}/tiket`);
    revalidatePath("/admin");
    revalidatePath("/admin/pesanan");

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil disimulasikan!",
      newStatus,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
