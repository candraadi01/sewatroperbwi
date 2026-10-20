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
    !!b.approval_expires_at &&
    new Date(b.approval_expires_at) < new Date();
  return (
    <div className="container-app py-10 md:py-14 max-w-4xl font-sans">
      <Link href="/pesanan" className="text-sm font-semibold text-[#327691] hover:underline flex items-center gap-1">
        <span>← Riwayat Booking Saya</span>
      </Link>

      {/* NOTIFIKASI KHUSUS JIKA SUDAH DISETUJUI ADMIN */}
      {b.booking_status === "approved" && !approvalExpired && (
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 shadow-sm animate-pulse-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
                ✓
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-black uppercase tracking-wide">
                  Pemberitahuan Persetujuan
                </span>
                <h2 className="text-lg sm:text-xl font-black text-emerald-950 mt-1">
                  Pesanan Telah Disetujui Admin & Pemilik!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                  Armada Jeep Trooper siap untuk jadwal Anda. Silakan selesaikan pembayaran{" "}
                  <strong>({b.payment_choice === "dp" ? `DP ${formatIDR(b.amount_to_pay)}` : `Lunas ${formatIDR(b.amount_to_pay)}`})</strong>{" "}
                  agar jadwal perjalanan Anda resmi terkunci.
                </p>
                {b.approval_expires_at && (
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    ⏰ Batas waktu pembayaran: {new Date(b.approval_expires_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
                  </p>
                )}
              </div>
            </div>
            <div className="shrink-0 sm:self-center">
              <PaymentButton
                code={b.id}
                label={b.payment_choice === "dp" ? "Bayar DP Sekarang" : "Bayar Lunas Sekarang"}
              />
            </div>
          </div>
        </div>
      )}

      {/* NOTIFIKASI KHUSUS JIKA MASIH MENUNGGU PENGECEKAN KENDARAAN */}
      {b.booking_status === "pending_review" && (
        <div className="mt-6 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              ⏳
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-black uppercase tracking-wide">
                Sedang Diproses
              </span>
              <h2 className="text-base sm:text-lg font-black text-amber-950 mt-1">
                Menunggu Konfirmasi Ketersediaan Armada
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                Pesanan Anda telah berhasil tercatat dengan biaya Rp 0 di awal. Admin & Pemilik sedang mengecek ketersediaan armada Trooper pada tanggal <strong>{b.service_date}</strong>. Setelah disetujui, Anda akan mendapatkan notifikasi untuk melakukan pembayaran di halaman ini.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="eyebrow mt-7">{b.id}</p>
      <h1 className="section-heading mt-3">
        {bookingStatus[b.booking_status] || b.booking_status}
      </h1>
      <p className="mt-2 text-neutral-600 text-sm">
        Rincian pemesanan dan riwayat status perjalanan wisata Anda.
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
        {b.booking_status === "approved" && b.approval_expires_at && (
          <p className="mt-3 text-sm text-amber-700 font-medium">
            Batas waktu pembayaran:{" "}
            {new Date(b.approval_expires_at).toLocaleString("id-ID", {
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
