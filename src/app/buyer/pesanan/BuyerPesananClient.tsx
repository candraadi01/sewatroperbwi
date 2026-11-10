"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Receipt,
  Search,
  Filter,
  Check,
  XCircle,
  Sparkles,
} from "lucide-react";
import type { BookingRecord } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";

type FilterTab = "semua" | "terkonfirmasi" | "siap_bayar" | "menunggu" | "selesai_batal";

export function BuyerPesananClient({
  orders,
}: {
  orders: BookingRecord[];
}) {
  const [activeTab, setActiveTab] = useState<FilterTab>("semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Categorize orders
  const confirmedOrders = useMemo(
    () => orders.filter((o) => ["confirmed", "payment_received", "in_progress"].includes(o.booking_status)),
    [orders]
  );
  const approvedOrders = useMemo(
    () => orders.filter((o) => o.booking_status === "approved"),
    [orders]
  );
  const waitingOrders = useMemo(
    () => orders.filter((o) => ["pending_payment", "pending_review"].includes(o.booking_status)),
    [orders]
  );
  const otherOrders = useMemo(
    () =>
      orders.filter((o) =>
        ["completed", "cancelled_by_admin", "cancelled_by_buyer", "rejected"].includes(o.booking_status)
      ),
    [orders]
  );

  // Filter based on tab and search
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeTab === "terkonfirmasi") list = confirmedOrders;
    else if (activeTab === "siap_bayar") list = approvedOrders;
    else if (activeTab === "menunggu") list = waitingOrders;
    else if (activeTab === "selesai_batal") list = otherOrders;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.product_name || "").toLowerCase().includes(q) ||
        (o.pickup_address || "").toLowerCase().includes(q) ||
        (o.service_date || "").includes(q)
    );
  }, [orders, activeTab, confirmedOrders, approvedOrders, waitingOrders, otherOrders, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4ebef] dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-[#327691] dark:text-[#8abbd0] tracking-wider uppercase">
            PANEL PEMESAN
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 mt-1 tracking-tight">
            Pesanan Saya
          </h1>
        </div>
        <Link
          href="/sewa"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
        >
          <span>+ Pesan Trip Baru</span>
        </Link>
      </div>

      {/* QUICK NOTIFICATION IF APPROVED ORDERS EXIST */}
      {approvedOrders.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border-2 border-emerald-500 shadow-sm">
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
                href={`/buyer/pesanan/${approvedOrders[0].id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
              >
                <CreditCard size={15} />
                <span>Bayar Sekarang ({formatIDR(approvedOrders[0].amount_to_pay)})</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS & SUMMARY COUNTERS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Tab Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("semua")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "semua"
                  ? "bg-[#1e293b] text-white shadow-xs"
                  : "bg-white dark:bg-neutral-800 text-[#64748b] dark:text-neutral-300 hover:bg-[#f1f5f9] border border-[#e4ebef] dark:border-neutral-700"
              }`}
            >
              <span>Semua</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                activeTab === "semua" ? "bg-white/20 text-white" : "bg-[#e2e8f0] dark:bg-neutral-700 text-[#1e293b] dark:text-neutral-200"
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("terkonfirmasi")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "terkonfirmasi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Kendaraan Terkonfirmasi</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                activeTab === "terkonfirmasi" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900"
              }`}>
                {confirmedOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("siap_bayar")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "siap_bayar"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
              }`}
            >
              <Sparkles size={13} />
              <span>Siap Dibayar</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                activeTab === "siap_bayar" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
              }`}>
                {approvedOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("menunggu")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "menunggu"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 border border-sky-200 dark:border-sky-800"
              }`}
            >
              <Clock size={13} />
              <span>Menunggu Konfirmasi</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                activeTab === "menunggu" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-900"
              }`}>
                {waitingOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("selesai_batal")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "selesai_batal"
                  ? "bg-neutral-600 text-white shadow-xs"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <span>Selesai &amp; Batal</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] ${
                activeTab === "selesai_batal" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-800"
              }`}>
                {otherOrders.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau trip..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#327691] text-[#1e293b] dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-8 sm:p-14 text-center shadow-xs">
          <Car size={52} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-bold text-[#1e293b] dark:text-neutral-100">
            {searchQuery
              ? `Tidak ada pesanan yang cocok dengan "${searchQuery}"`
              : activeTab === "terkonfirmasi"
              ? "Belum ada pesanan dengan status Kendaraan Terkonfirmasi"
              : activeTab === "siap_bayar"
              ? "Tidak ada pesanan yang menunggu pembayaran"
              : activeTab === "menunggu"
              ? "Tidak ada pesanan yang menunggu konfirmasi admin"
              : "Belum Ada Pesanan Jeep"}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
            Pilih destinasi impian Anda dan nikmati sensasi petualangan menjelajahi keindahan alam Banyuwangi dengan Isuzu Trooper 4x4!
          </p>
          <div className="mt-6">
            <Link
              href="/sewa"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <span>Lihat Katalog Tour &amp; Sewa</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusLabel = bookingStatus[order.booking_status] || order.booking_status;
            const isApproved = order.booking_status === "approved";
            const isConfirmed = ["confirmed", "payment_received", "in_progress"].includes(order.booking_status);
            const isWaiting = ["pending_payment", "pending_review"].includes(order.booking_status);
            const isCancelled = ["cancelled_by_admin", "cancelled_by_buyer", "rejected"].includes(order.booking_status);

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
                  isConfirmed
                    ? "border-emerald-400 dark:border-emerald-700 border-l-[6px] border-l-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950/40 bg-emerald-50/10"
                    : isApproved
                    ? "border-amber-400 dark:border-amber-600 border-l-[6px] border-l-amber-500 ring-2 ring-amber-100 dark:ring-amber-950/40 bg-amber-50/10"
                    : isWaiting
                    ? "border-sky-300 dark:border-sky-700 border-l-[6px] border-l-sky-500 bg-sky-50/10"
                    : isCancelled
                    ? "border-rose-200 dark:border-rose-800 border-l-[6px] border-l-rose-400 opacity-90"
                    : "border-[#e4ebef] dark:border-neutral-800 hover:border-[#327691]"
                }`}
              >
                {/* Header Row: Code & Distinct Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#f0f4f6] dark:border-neutral-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#327691] dark:text-[#8abbd0] px-3 py-1 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800">
                      #{order.id}
                    </span>

                    {/* Badge tab: Kendaraan Terkonfirmasi → singkat */}
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200">
                        <Check size={13} className="text-emerald-600" />
                        Terkonfirmasi
                      </span>
                    )}

                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200">
                        <Sparkles size={13} className="text-amber-600" />
                        Siap Dibayar
                      </span>
                    )}

                    {isWaiting && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200">
                        <Clock size={13} className="text-sky-600" />
                        Menunggu Konfirmasi
                      </span>
                    )}

                    {isCancelled && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1 rounded-full bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300">
                        <XCircle size={14} className="text-rose-700" />
                        <span>{statusLabel}</span>
                      </span>
                    )}

                    {!isConfirmed && !isApproved && !isWaiting && !isCancelled && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200">
                        {statusLabel}
                      </span>
                    )}
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
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{order.service_date}</span>
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

                    {/* pickup address */}
                  </div>

                  {/* Price & Action Buttons */}
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

                    <div className="mt-3 flex items-center gap-2 flex-wrap justify-end">
                      {/* FITUR 3: TOMBOL BAYAR INSTAN JIKA DISETUJUI */}
                      {isApproved && (
                        <Link
                          href={`/buyer/pesanan/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition animate-pulse-subtle"
                        >
                          <CreditCard size={14} />
                          <span>Bayar ({formatIDR(order.amount_to_pay)})</span>
                        </Link>
                      )}

                      {/* TOMBOL PELUNASAN JIKA SUDAH DP */}
                      {isConfirmed && !isFullyPaid && (order.remaining_amount ?? 0) > 0 && (
                        <Link
                          href={`/buyer/pesanan/${order.id}`}
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

                      {/* TOMBOL NOTA / KWITANSI */}
                      {(isConfirmed || (order.amount_paid ?? 0) > 0) && (
                        <Link
                          href={`/buyer/pesanan/${order.id}/nota`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold transition shadow-2xs"
                        >
                          <Receipt size={14} />
                          <span>Kwitansi / Nota</span>
                        </Link>
                      )}

                      {/* Tombol Detail Pesanan */}
                      <Link
                        href={`/buyer/pesanan/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#e4ebef] dark:border-neutral-700 hover:bg-[#f8fafc] dark:hover:bg-neutral-800 text-xs font-bold text-[#53636d] dark:text-neutral-300 hover:text-[#1e293b] transition"
                      >
                        <span>Detail</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* DRIVER & ARMADA JIKA KENDARAAN TERKONFIRMASI */}
                {isConfirmed && (
                  <div className="pt-3 border-t border-emerald-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/40 dark:bg-neutral-800/40 p-3.5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Car size={16} />
                      </div>
                      <div className="text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400">Driver &amp; Armada: </span>
                        <strong className="text-neutral-900 dark:text-neutral-100">
                          {order.assigned_driver_name || "Pak Slamet Hidayat"}
                        </strong>
                        <span className="text-neutral-400 mx-1.5">·</span>
                        <span className="font-mono font-bold text-[#327691] dark:text-[#8abbd0]">
                          {order.assigned_vehicle_plate || "P 1888 VJ"}
                        </span>
                      </div>
                    </div>

                    {waDriverLink && (
                      <a
                        href={waDriverLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0"
                      >
                        <Phone size={12} />
                        <span>Hubungi Driver</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

