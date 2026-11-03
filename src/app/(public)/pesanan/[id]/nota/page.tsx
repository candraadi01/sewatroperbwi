import { notFound } from "next/navigation";
import { requireBuyer } from "@/lib/auth/helpers";
import { getBookingById } from "@/lib/services/booking";
import { createAdminClient } from "@/lib/supabase/server";
import { PaymentReceiptView } from "@/components/booking/PaymentReceiptView";

export const metadata = {
  title: "Kwitansi Pembayaran Resmi | Sewa Trooper Banyuwangi",
  description: "Kwitansi dan bukti pembayaran resmi sewa Jeep Trooper Banyuwangi.",
};

export default async function PublicNotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireBuyer(`/pesanan/${encodeURIComponent(id)}/nota`);
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  const db = await createAdminClient();
  const { data: attempts } = await db
    .from("payment_attempts")
    .select("*")
    .eq("booking_id", booking.database_id)
    .order("created_at", { ascending: false })
    .limit(1);

  return (
    <PaymentReceiptView
      booking={booking}
      paymentAttempt={attempts?.[0] || null}
      backUrl={`/pesanan/${booking.id}`}
      ticketUrl={`/buyer/pesanan/${booking.id}/tiket`}
    />
  );
}

