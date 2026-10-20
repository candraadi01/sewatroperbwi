import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { Calendar, Clock, Users, Car, CheckCircle2, AlertCircle, ArrowRight, CreditCard, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Riwayat Booking Saya | Sewa Trooper Banyuwangi",
  description: "Daftar histori dan status pemesanan sewa Jeep Trooper Banyuwangi Anda.",
};

export default async function PesananHistoryPage() {
  await requireBuyer("/pesanan");
  const orders = await getOwnBookings();

  const approvedOrders = orders.filter((o) => o.booking_status === "approved");
  const pendingOrders = orders.filter((o) => o.booking_status === "pending_review");

  return (
    <div className="container-app py-10 md:py-14 max-w-4xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Panel Pemesan
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] mt-1 tracking-tight">
            Riwayat Booking Saya
          </h1>
          <p className="text-sm text-[#53636d] mt-1">
            Pantau status persetujuan admin dan kelola pembayaran sewa Jeep Trooper Anda.
          </p>
        </div>
        <Link
          href="/sewa"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
        >
          <span>+ Pesan Trip Baru</span>
        </Link>
      </div>

      {/* NOTIFIKASI AKTIF JIKA ADA PESANAN YANG TELAH DISETUJUI ADMIN */}
      {approvedOrders.length > 0 && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wide">
                  Notifikasi Pembayaran
                </span>
                <span className="text-xs text-emerald-800 font-semibold">
                  {approvedOrders.length} Pesanan Disetujui
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-emerald-950 mt-1">
                Ketersediaan Armada Telah Dikonfirmasi Admin!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                Admin & Pemilik telah memeriksa ketersediaan kendaraan untuk pesanan Anda. Silakan segera lakukan pembayaran (DP atau Pelunasan) untuk mengunci armada Trooper.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {approvedOrders.map((ao) => (
                  <Link
                    key={ao.id}
                    href={`/pesanan/${ao.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <CreditCard size={14} />
                    <span>Bayar {ao.id} ({formatIDR(ao.amount_to_pay)})</span>
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Status Pending jika ada */}
      {pendingOrders.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-950">
              {pendingOrders.length} pesanan sedang menunggu pengecekan armada.
            </strong>{" "}
            Tim kami sedang memverifikasi jadwal Trooper. Tombol pembayaran akan otomatis aktif setelah pesanan disetujui.
          </div>
        </div>
      )}

      {/* DAFTAR KARTU PESANAN */}
      <div className="mt-7 space-y-4">
        {orders.map((b) => {
          const isApproved = b.booking_status === "approved";
          const isPending = b.booking_status === "pending_review";
          const isConfirmed = ["confirmed", "payment_received", "in_progress", "completed"].includes(b.booking_status);
          const isCancelled = ["cancelled_by_admin", "cancelled_by_user", "rejected"].includes(b.booking_status);

          return (
            <article
              key={b.id}
              className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 ${
                isApproved
                  ? "border-emerald-400 ring-2 ring-emerald-500/20 hover:border-emerald-500"
                  : isPending
                  ? "border-amber-300 hover:border-amber-400"
                  : "border-[#e4ebef] hover:border-[#327691]/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-[#f0f4f6]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#53636d] bg-[#f4f7f9] px-2.5 py-1 rounded-md">
                      {b.id}
                    </span>
                    <span className="text-xs text-[#697780]">
                      Dipesan pada {new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#263b46] mt-2">
                    {b.product_name}
                  </h2>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {isApproved && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                      <CheckCircle2 size={13} className="text-emerald-700" />
                      <span>DISETUJUI — SEGERA BAYAR</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>MENUNGGU PERSETUJUAN</span>
                    </span>
                  )}
                  {isConfirmed && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
                      <ShieldCheck size={13} className="text-sky-700" />
                      <span>{bookingStatus[b.booking_status] || "TERKONFIRMASI"}</span>
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                      <span>{bookingStatus[b.booking_status] || "DIBATALKAN"}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Detail Jadwal & Peserta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 text-xs text-[#53636d]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#327691] shrink-0" />
                  <span>{b.service_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#327691] shrink-0" />
                  <span>{b.start_time?.slice(0, 5)} WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-[#327691] shrink-0" />
                  <span>{b.num_units} Unit Trooper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#327691] shrink-0" />
                  <span>{b.num_passengers} Orang</span>
                </div>
              </div>

              {/* Rincian Harga & Tindakan */}
              <div className="pt-3.5 border-t border-[#f0f4f6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#697780]">Total Pembayaran:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-[#263b46]">
                      {formatIDR(b.total_amount)}
                    </span>
                    {b.amount_paid > 0 ? (
                      <span className="text-xs text-emerald-700 font-semibold">
                        (Terbayar: {formatIDR(b.amount_paid)})
                      </span>
                    ) : (
                      <span className="text-xs text-[#697780]">
                        ({b.payment_choice === "dp" ? `DP ${formatIDR(b.amount_to_pay)}` : "Lunas"})
                      </span>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2.5">
                  {isApproved ? (
                    <Link
                      href={`/pesanan/${b.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-sm transition"
                    >
                      <CreditCard size={15} />
                      <span>Bayar Sekarang ({formatIDR(b.amount_to_pay)})</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/pesanan/${b.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ccd8de] hover:border-[#327691] hover:text-[#327691] text-[#263b46] font-bold text-xs sm:text-sm transition"
                    >
                      <span>Lihat Rincian</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {/* Empty State jika belum ada pesanan */}
        {!orders.length && (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#e4ebef] shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f4f9fb] flex items-center justify-center text-[#327691] mb-4">
              <Car size={32} />
            </div>
            <h2 className="text-lg font-bold text-[#263b46]">Belum Ada Riwayat Pemesanan</h2>
            <p className="text-sm text-[#53636d] mt-1.5 max-w-md mx-auto leading-relaxed">
              Anda belum pernah memesan trip Jeep Trooper. Pilih destinasi impian Anda di Banyuwangi sekarang!
            </p>
            <Link
              href="/sewa"
              className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-sm font-bold shadow-xs transition"
            >
              <span>Jelajahi Paket Tour</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
