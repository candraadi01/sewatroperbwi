import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  Phone, 
  Printer, 
  MapPin,
  Lock
} from "lucide-react";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";

export const metadata = {
  title: "Pesanan Saya | Portal Pelanggan Sewa Trooper BWI",
  description: "Daftar histori dan status pemesanan sewa Jeep Trooper Banyuwangi Anda.",
};

export default async function BuyerPesananPage() {
  const user = await requireBuyer("/buyer/pesanan");
  const orders = await getOwnBookings();

  const approvedOrders = orders.filter((o) => o.booking_status === "approved");
  const confirmedOrders = orders.filter((o) =>
    ["payment_received", "confirmed", "in_progress"].includes(o.booking_status)
  );

  return (
    <BuyerPortalLayout user={user} activeMenu="pesanan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4ebef] dark:border-neutral-800">
          <div>
            <span className="text-xs font-bold text-[#327691] dark:text-[#8abbd0] tracking-wider uppercase">
              Panel Pemesan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 mt-1 tracking-tight">
              Riwayat Booking Saya
            </h1>
            <p className="text-sm text-[#64748b] dark:text-neutral-400 mt-1">
              Pantau status persetujuan admin, pembayaran Midtrans, dan E-Tiket resmi Jeep Trooper Anda.
            </p>
          </div>
          <Link
            href="/sewa"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
          >
            <span>+ Pesan Trip Baru</span>
          </Link>
        </div>

        {/* FITUR 3: NOTIFIKASI PEMBAYARAN INSTAN JIKA ADA PESANAN YANG DISETUJUI ADMIN */}
        {approvedOrders.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border-2 border-emerald-500 shadow-sm animate-pulse-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wide">
                      Siap Dibayar
                    </span>
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                      {approvedOrders.length} Pesanan Telah Disetujui Admin!
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-emerald-950 dark:text-emerald-200 mt-1">
                    Armada Jeep Siap. Silakan selesaikan pembayaran untuk mengunci jadwal.
                  </h3>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-300 mt-0.5">
                    Pembayaran aman didukung QRIS, Virtual Account, & Kartu Kredit melalui Midtrans.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/pesanan/${approvedOrders[0].id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <CreditCard size={15} />
                  <span>Bayar Sekarang ({formatIDR(approvedOrders[0].amount_to_pay)})</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Daftar Pesanan */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-8 sm:p-14 text-center shadow-xs">
            <Car size={52} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <h3 className="text-lg font-bold text-[#1e293b] dark:text-neutral-100">Belum Ada Pesanan Jeep</h3>
            <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
              Anda belum memiliki riwayat reservasi rental Jeep Trooper 4x4. Pilih destinasi impian Anda dan nikmati sensasi petualangan di Banyuwangi!
            </p>
            <div className="mt-6">
              <Link
                href="/sewa"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition"
              >
                <span>Lihat Katalog Tour & Sewa</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusLabel = bookingStatus[order.booking_status] || order.booking_status;
              const isApproved = order.booking_status === "approved";
              const isConfirmed = ["confirmed", "payment_received", "in_progress"].includes(order.booking_status);
              const isFullyPaid =
                (order.remaining_amount ?? 0) <= 0 ||
                (order.amount_paid ?? 0) >= (order.total_amount ?? 0) ||
                order.payment_status === "settlement";
              const waDriverLink =
                order.assigned_driver_phone && isFullyPaid
                  ? `https://wa.me/62${order.assigned_driver_phone.replace(/^0/, "")}?text=${encodeURIComponent(
                      `Halo ${order.assigned_driver_name || "Driver"}, saya ${order.contact_name} pemesan Jeep Trooper dengan kode booking #${order.id} untuk trip ${order.service_date}.`
                    )}`
                  : "";

              return (
                <div
                  key={order.id}
                  className={`bg-white dark:bg-neutral-900 rounded-3xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
                    isApproved
                      ? "border-amber-400 dark:border-amber-600 ring-2 ring-amber-100 dark:ring-amber-950/40"
                      : isConfirmed
                      ? "border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-100 dark:ring-emerald-950/40"
                      : "border-[#e4ebef] dark:border-neutral-800 hover:border-[#327691]"
                  }`}
                >
                  {/* Header Row: Code & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#f0f4f6] dark:border-neutral-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#327691] dark:text-[#8abbd0] px-3 py-1 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800">
                        #{order.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isApproved
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                            : isConfirmed
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <span className="text-xs text-[#8e9da5] dark:text-neutral-400">
                      Dipesan pada: {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#1e293b] dark:text-neutral-100">
                        {order.product_name || "Paket Jeep Trooper 4x4"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#64748b] dark:text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#327691]" />
                          <span>{order.service_date}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#327691]" />
                          <span>Pukul {order.start_time?.slice(0, 5) || "08:00"} WIB</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Car size={14} className="text-[#327691]" />
                          <span>{order.num_units} Unit Jeep</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-[#327691]" />
                          <span>{order.num_passengers} Penumpang</span>
                        </span>
                      </div>

                      {order.pickup_address && (
                        <p className="text-xs text-[#64748b] dark:text-neutral-400 flex items-start gap-1.5">
                          <MapPin size={13} className="text-[#327691] shrink-0 mt-0.5" />
                          <span>Titik Jemput: {order.pickup_address}</span>
                        </p>
                      )}
                    </div>

                    {/* Harga & Status Pembayaran */}
                    <div className="flex flex-col md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-[#f0f4f6] dark:border-neutral-800">
                      <div>
                        <span className="text-[11px] font-semibold text-[#8e9da5] dark:text-neutral-400 uppercase tracking-wider block md:text-right">
                          Total Tarif
                        </span>
                        <span className="text-lg sm:text-xl font-black text-[#1e293b] dark:text-neutral-100 block md:text-right">
                          {formatIDR(order.total_amount)}
                        </span>
                        <span className="text-[11px] text-[#8e9da5] dark:text-neutral-400 block md:text-right">
                          {order.payment_choice === "dp" ? `DP: ${formatIDR(order.amount_to_pay)}` : "Tarif Penuh"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {/* FITUR 3: TOMBOL BAYAR INSTAN */}
                        {isApproved && (
                          <Link
                            href={`/pesanan/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            <CreditCard size={14} />
                            <span>Bayar ({formatIDR(order.amount_to_pay)})</span>
                          </Link>
                        )}

                        {/* TOMBOL PELUNASAN JIKA SUDAH DP */}
                        {isConfirmed && !isFullyPaid && (order.remaining_amount ?? 0) > 0 && (
                          <Link
                            href={`/pesanan/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            <CreditCard size={14} />
                            <span>Pelunasan ({formatIDR(order.remaining_amount)})</span>
                          </Link>
                        )}

                        {/* FITUR 2: TOMBOL E-TIKET */}
                        {isConfirmed && (
                          <Link
                            href={`/buyer/pesanan/${order.id}/tiket`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] hover:bg-[#d5e9f1] text-xs font-bold transition"
                          >
                            <Printer size={14} />
                            <span>E-Tiket</span>
                          </Link>
                        )}

                        {/* Tombol Detail Pesanan */}
                        <Link
                          href={`/pesanan/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#e4ebef] dark:border-neutral-700 hover:bg-[#f8fafc] dark:hover:bg-neutral-800 text-xs font-bold text-[#53636d] dark:text-neutral-300 hover:text-[#1e293b] transition"
                        >
                          <span>Detail</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* FITUR 1: INFO DRIVER & ARMADA JIKA SUDAH DIKONFIRMASI */}
                  {isConfirmed && (
                    <div className="pt-3.5 border-t border-[#f0f4f6] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] dark:bg-neutral-800/50 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e9f3f7] dark:bg-neutral-700 text-[#327691] dark:text-[#8abbd0] flex items-center justify-center shrink-0">
                          <Car size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#8e9da5] dark:text-neutral-400 uppercase tracking-wider block">
                            Driver & Armada Ditugaskan
                          </span>
                          <span className="text-xs font-bold text-[#1e293b] dark:text-neutral-100">
                            {order.assigned_driver_name || "Pak Budi Santoso"} · Plat: {order.assigned_vehicle_plate || "P 1982 XX"}
                          </span>
                        </div>
                      </div>

                      {isFullyPaid && waDriverLink ? (
                        <a
                          href={waDriverLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition self-start sm:self-auto"
                        >
                          <Phone size={13} />
                          <span>Hubungi Driver</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                          <Lock size={12} className="text-amber-600 dark:text-amber-400" />
                          <span>WhatsApp driver terbuka setelah pelunasan</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BuyerPortalLayout>
  );
}
