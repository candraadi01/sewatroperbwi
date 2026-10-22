import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { ReceiptText, Calendar, Users, Car, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { OrderActions } from "@/components/admin/OrderActions";

export const metadata = {
  title: "Riwayat Transaksi & Konfirmasi Armada | Sewa Trooper Banyuwangi",
  description: "Histori pesanan, konfirmasi ketersediaan armada pemilik, dan rincian bagi hasil.",
};

export default async function OwnerTransaksiPage() {
  await requireOwner("/owner/transaksi");
  const bookings = await getAllBookings();

  const pendingReviewBookings = bookings.filter((b) => b.booking_status === "pending_review");
  const approvedBookings = bookings.filter((b) => b.booking_status === "approved");
  const confirmedBookings = bookings.filter((b) => ["payment_received", "confirmed", "in_progress"].includes(b.booking_status));

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef] dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-[#327691] dark:text-[#8abbd0] tracking-wider uppercase">
            Portal Pemilik Armada
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 tracking-tight mt-1">
            Konfirmasi Pesanan & Transaksi
          </h1>
          <p className="text-sm text-[#64748b] dark:text-neutral-400 mt-1">
            Konfirmasikan ketersediaan unit armada Trooper (ACC) dan pantau pembagian hasil pendapatan rental Anda.
          </p>
        </div>
      </div>

      {/* BANNER JIKA ADA BOOKING MENUNGGU ACC PEMILIK */}
      {pendingReviewBookings.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-extrabold uppercase">
                  Perlu Ditinjau
                </span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {pendingReviewBookings.length} Pesanan Menunggu ACC Ketersediaan Armada
                </span>
              </div>
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-100 mt-1">
                Ada pemesan baru yang membutuhkan persetujuan armada dari Anda.
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Silakan periksa ketersediaan unit dan jadwal sopir pada tanggal yang diajukan, lalu klik <strong>"Setujui"</strong> agar pembeli dapat membayar DP/Lunas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabel / Kartu Transaksi */}
      <div className="space-y-4">
        {bookings.map((b) => {
          const ownerShare = Math.round(b.total_amount * 0.85);
          const isPending = b.booking_status === "pending_review";
          const isApproved = b.booking_status === "approved";

          return (
            <div
              key={b.id}
              className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border transition shadow-xs space-y-4 ${
                isPending
                  ? "border-amber-400 dark:border-amber-600 ring-2 ring-amber-100 dark:ring-amber-950/40"
                  : isApproved
                  ? "border-emerald-300 dark:border-emerald-700"
                  : "border-[#e4ebef] dark:border-neutral-800 hover:border-[#327691]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#f0f4f6] dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#327691] dark:text-[#8abbd0] bg-[#e9f3f7] dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                      #{b.id}
                    </span>
                    <span className="text-xs text-[#8e9da5] dark:text-neutral-400">
                      {new Date(b.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#1e293b] dark:text-neutral-100 mt-2">
                    {b.product_name}
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isPending
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                      : isApproved
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                      : "bg-[#e9f3f7] text-[#327691] dark:bg-neutral-800 dark:text-[#8abbd0] border border-[#d2e4ec] dark:border-neutral-700"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{bookingStatus[b.booking_status] || b.booking_status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-xs text-[#53636d] dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#327691] shrink-0" />
                  <span>Tanggal: <strong>{b.service_date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-[#327691] shrink-0" />
                  <span>{b.num_units} Unit Trooper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#327691] shrink-0" />
                  <span>{b.num_passengers} Penumpang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Tamu:</span>
                  <strong className="text-[#1e293b] dark:text-neutral-100 truncate">{b.contact_name}</strong>
                </div>
              </div>

              {/* Rincian Finansial & Bagi Hasil Pemilik */}
              <div className="pt-3 border-t border-[#f0f4f6] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] dark:bg-neutral-800/40 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl">
                <div>
                  <span className="text-[11px] text-[#697780] dark:text-neutral-400">Tarif Sewa Total:</span>
                  <span className="font-bold text-sm text-[#1e293b] dark:text-neutral-100 ml-1.5">
                    {formatIDR(b.total_amount)}
                  </span>
                  <span className="text-[11px] text-[#8e9da5] dark:text-neutral-400 block">
                    Pilihan Bayar: {b.payment_choice === "dp" ? "Down Payment (DP)" : "Pelunasan Penuh"}
                  </span>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Pendapatan Pemilik (85%):</span>
                    <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                      {formatIDR(ownerShare)}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    Masuk saldo setelah trip selesai
                  </span>
                </div>
              </div>

              {/* FITUR AKSI ACC PEMILIK LANGSUNG */}
              {isPending && (
                <div className="pt-3 border-t border-[#f0f4f6] dark:border-neutral-800">
                  <OrderActions id={b.database_id} status={b.booking_status} />
                </div>
              )}
            </div>
          );
        })}

        {!bookings.length && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-400">
            Belum ada riwayat transaksi.
          </div>
        )}
      </div>
    </div>
  );
}
