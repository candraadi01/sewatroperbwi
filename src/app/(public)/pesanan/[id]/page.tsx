import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuyer } from "@/lib/auth/helpers";
import { getBookingById, getBookingHistory } from "@/lib/services/booking";
import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { PaymentButton } from "@/components/PaymentButton";
export default async function Order({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireBuyer("/pesanan/" + encodeURIComponent(id));
  const [b, settings] = await Promise.all([
    getBookingById(id),
    getSiteSettings(),
  ]);
  if (!b) notFound();
  const history = await getBookingHistory(b.database_id);
  const contact = whatsappLink(
    settings.contact_whatsapp,
    "Halo, saya ingin bertanya tentang pesanan " + b.id,
  );
  const payable =
    b.remaining_amount > 0 &&
    ["approved", "pending_payment", "payment_received", "confirmed"].includes(
      b.booking_status,
    );
  const approvalExpired =
    b.booking_status === "approved" &&
    (b as unknown as { approval_expires_at?: string }).approval_expires_at &&
    new Date((b as unknown as { approval_expires_at: string }).approval_expires_at) < new Date();
  return (
    <div className="container-app py-10 md:py-14 max-w-4xl">
      <Link href="/akun/pesanan" className="text-sm text-neutral-600">
        ← Pesanan Saya
      </Link>
      <p className="eyebrow mt-7">{b.id}</p>
      <h1 className="section-heading mt-3">
        {bookingStatus[b.booking_status] || b.booking_status}
      </h1>
      <p className="mt-4 text-neutral-600">
        {b.booking_status === "pending_review"
          ? "Pesanan kamu sedang menunggu konfirmasi ketersediaan kendaraan dari admin. Kamu belum perlu melakukan pembayaran."
          : b.booking_status === "approved"
            ? "Admin telah mengonfirmasi ketersediaan kendaraan. Selesaikan pembayaran sebelum batas waktu yang ditentukan."
            : b.booking_status === "payment_received"
              ? "Pembayaran diterima. Admin sedang memproses konfirmasi kendaraan."
              : b.booking_status === "pending_payment"
                ? "Pesanan tersimpan. Selesaikan pembayaran agar dapat ditindaklanjuti admin."
                : "Periksa rincian perjalanan dan hubungi admin jika membutuhkan bantuan."}
      </p>
      <div className="admin-panel mt-8">
        <h2 className="text-xl font-semibold">{b.product_name}</h2>
        <p className="mt-3 text-neutral-600">
          {b.service_date} · {b.start_time?.slice(0, 5)} WIB · {b.num_units}{" "}
          unit · {b.num_passengers} peserta
        </p>
        <dl className="grid sm:grid-cols-2 gap-5 mt-6 text-sm">
          {[
            ["Nama pemesan", b.contact_name],
            ["Nomor WhatsApp", b.contact_phone],
            ["Email", b.contact_email],
            ["Titik jemput", b.pickup_address || "Titik awal layanan"],
            ["Total pesanan", formatIDR(b.total_amount)],
            ["Pembayaran terverifikasi", formatIDR(b.amount_paid)],
            ["Sisa tagihan", formatIDR(b.remaining_amount)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-neutral-500">{k}</dt>
              <dd className="mt-1 font-medium break-words">{v}</dd>
            </div>
          ))}
        </dl>
        {b.notes && (
          <p className="mt-6 text-sm whitespace-pre-line">Catatan: {b.notes}</p>
        )}
        {b.balance_deadline && b.remaining_amount > 0 && (
          <p className="mt-5 text-sm text-neutral-600">
            Batas pelunasan:{" "}
            {new Date(b.balance_deadline).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}{" "}
            WIB.
          </p>
        )}
        {b.booking_status === "approved" && (b as unknown as { approval_expires_at?: string }).approval_expires_at && (
          <p className="mt-3 text-sm text-amber-700 font-medium">
            Batas waktu pembayaran:{" "}
            {new Date((b as unknown as { approval_expires_at: string }).approval_expires_at).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}{" "}
            WIB.
          </p>
        )}
        {b.booking_status === "pending_review" && (
          <div className="mt-5 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <span className="text-lg">⏳</span>
            <span>Admin sedang memeriksa ketersediaan kendaraan. Kamu akan mendapat notifikasi setelah dikonfirmasi.</span>
          </div>
        )}
        {b.confirmation_deadline && b.booking_status === "payment_received" && (
          <p className="mt-3 text-sm text-neutral-600">
            Target tindak lanjut admin:{" "}
            {new Date(b.confirmation_deadline).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
            })}{" "}
            WIB. Hubungi admin jika belum ada kabar.
          </p>
        )}
        {payable && !approvalExpired && (
          <div className="mt-7">
            <PaymentButton
              code={b.id}
              label={
                b.amount_paid > 0
                  ? "Bayar sisa tagihan"
                  : b.booking_status === "approved"
                    ? "Bayar sekarang"
                    : "Lanjutkan pembayaran"
              }
            />
          </div>
        )}
        {approvalExpired && (
          <p className="mt-5 text-sm text-red-600">
            Batas waktu pembayaran telah berakhir. Hubungi admin untuk tindak lanjut.
          </p>
        )}
        <p className="mt-5 text-xs text-neutral-500">
          Status diperbarui setelah notifikasi Midtrans diverifikasi. Muat ulang
          halaman ini setelah membayar.
        </p>
        <a
          href={"/pesanan/" + encodeURIComponent(b.id)}
          className="action-link-secondary mt-4"
        >
          Perbarui status
        </a>
      </div>
      {!!history.length && (
        <section className="admin-panel mt-6">
          <h2 className="text-lg font-semibold">Riwayat pesanan</h2>
          <ol className="mt-5 space-y-5">
            {history.map((h, i) => (
              <li key={i}>
                <p className="text-sm font-medium">
                  {bookingStatus[h.new_status] || h.new_status}
                </p>
                {h.reason && (
                  <p className="text-sm text-neutral-600 mt-1 whitespace-pre-line">
                    {h.reason}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(h.created_at).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}{" "}
                  WIB
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
      <div className="mt-6">
        {contact ? (
          <a
            href={contact}
            className="action-link-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanyakan pesanan ke admin
          </a>
        ) : (
          <Link href="/kontak" className="action-link-secondary">
            Kontak admin
          </Link>
        )}
      </div>
    </div>
  );
}
