"use client";

import Link from "next/link";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { useLanguage } from "@/lib/i18n/context";
import {
  Car,
  ReceiptText,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  CreditCard,
  AlertCircle,
  Home,
  ShieldCheck,
  Compass,
  Lock,
} from "lucide-react";
import type { BookingRecord } from "@/lib/services/booking";

interface BuyerDashboardClientProps {
  user: {
    id?: string;
    fullName: string;
    email: string;
    roles?: string[];
  };
  orders: BookingRecord[];
}

export function BuyerDashboardClient({ user, orders }: BuyerDashboardClientProps) {
  const { t } = useLanguage();

  // 1. Kategorisasi Pesanan
  const waitingPaymentOrders = orders.filter((o) => o.booking_status === "approved");
  const pendingReviewOrders = orders.filter((o) => o.booking_status === "pending_review");
  const confirmedTrips = orders.filter((o) =>
    ["payment_received", "confirmed", "in_progress"].includes(o.booking_status)
  );
  const completedOrders = orders.filter((o) => o.booking_status === "completed");

  // 2. Cari Trip Terdekat Mendatang
  const upcomingTrips = [...confirmedTrips, ...waitingPaymentOrders].sort(
    (a, b) => new Date(a.service_date).getTime() - new Date(b.service_date).getTime()
  );
  const nextTrip = upcomingTrips[0] || null;

  // Hitung selisih hari menuju trip
  let daysDiff: number | null = null;
  let countdownText = "";
  if (nextTrip) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(nextTrip.service_date);
    tripDate.setHours(0, 0, 0, 0);
    const diffTime = tripDate.getTime() - today.getTime();
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) countdownText = t("countdown_today", "Berangkat Hari Ini!");
    else if (daysDiff === 1) countdownText = t("countdown_tomorrow", "Berangkat Besok!");
    else if (daysDiff > 1) countdownText = t("countdown_days", `Tersisa ${daysDiff} Hari Lagi`).replace("{d}", String(daysDiff));
    else countdownText = t("countdown_past", "Jadwal Telah Berlangsung");
  }

  const isNextTripFullyPaid = nextTrip
    ? (nextTrip.remaining_amount ?? 0) <= 0 ||
      (nextTrip.amount_paid ?? 0) >= (nextTrip.total_amount ?? 0) ||
      nextTrip.payment_status === "settlement"
    : false;

  const waDriverLink =
    nextTrip?.assigned_driver_phone && isNextTripFullyPaid
      ? `https://wa.me/62${nextTrip.assigned_driver_phone.replace(/^0/, "")}?text=${encodeURIComponent(
          `Halo ${nextTrip.assigned_driver_name || "Driver"}, saya ${nextTrip.contact_name} pemesan Jeep Trooper #${nextTrip.id} untuk trip ${nextTrip.service_date}.`
        )}`
      : "";

  return (
    <BuyerPortalLayout user={user} activeMenu="beranda">
      <div className="space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 tracking-tight">
              {t("buyer_menu_beranda", "Beranda Saya")}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 mt-1">
              {t("buyer_welcome", "Selamat datang,")} <strong className="text-[#1e293b] dark:text-neutral-200">{user.fullName || "Pelanggan"}</strong>. {t("buyer_hero_desc", "Pantau jadwal reservasi dan armada Trooper Anda.")}
            </p>
          </div>

          <Link
            href="/sewa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
          >
            <Search size={15} />
            <span>{t("buyer_new_trip", "Pesan Trip Baru")}</span>
          </Link>
        </div>

        {/* 1. Ringkasan Aktivitas (4 Clean Stat Cards) */}
        <div>
          <h2 className="text-sm font-bold text-[#1e293b] dark:text-neutral-200 mb-3.5">
            {t("buyer_activity_summary", "Ringkasan Aktivitas")}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Perlu Pembayaran */}
            <Link
              href="/buyer/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
                  {t("buyer_stat_need_pay", "Siap Dibayar")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 my-2.5">
                {waitingPaymentOrders.length}
              </p>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                {waitingPaymentOrders.length > 0 ? t("buyer_finish_bill", "Segera selesaikan →") : t("buyer_no_bill", "Tidak ada tagihan →")}
              </span>
            </Link>

            {/* Card 2: Menunggu Konfirmasi */}
            <Link
              href="/buyer/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 hover:border-sky-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
                  {t("buyer_stat_waiting", "Menunggu Review")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 my-2.5">
                {pendingReviewOrders.length}
              </p>
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                {t("buyer_check_fleet", "Pengecekan armada →")}
              </span>
            </Link>

            {/* Card 3: Siap Berangkat / Lunas */}
            <Link
              href="/buyer/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 hover:border-emerald-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
                  {t("buyer_stat_ready", "Siap Berangkat")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 my-2.5">
                {confirmedTrips.length}
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                {t("buyer_ticket_active", "Tiket & driver aktif →")}
              </span>
            </Link>

            {/* Card 4: Trip Selesai */}
            <Link
              href="/buyer/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 hover:border-slate-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
                  {t("buyer_stat_completed", "Trip Selesai")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 my-2.5">
                {completedOrders.length}
              </p>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 hover:underline">
                {t("buyer_history_link", "Riwayat liburan →")}
              </span>
            </Link>
          </div>
        </div>

        {/* 2. Banner Jadwal Trip Terdekat */}
        {nextTrip ? (
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border-2 border-[#d2e4ec] dark:border-neutral-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#e8f3f7] to-transparent dark:from-neutral-800/40 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0f4f6] dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[#327691] text-white flex items-center justify-center font-bold shadow-xs">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] block">
                      {t("buyer_next_trip", "Perjalanan Terdekat Anda")}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1e293b] dark:text-neutral-100">
                      {nextTrip.product_name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {countdownText && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
                      {countdownText}
                    </span>
                  )}
                  <span className="font-mono text-xs font-bold text-[#64748b] dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                    #{nextTrip.id}
                  </span>
                </div>
              </div>

              {/* Rincian Jadwal & Titik Jemput */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <Calendar size={18} className="text-[#327691] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-[#8e9da5] dark:text-neutral-400 block">
                      {t("buyer_order_date", "Tanggal Trip")}
                    </span>
                    <span className="text-sm font-bold text-[#1e293b] dark:text-neutral-100">{nextTrip.service_date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <Clock size={18} className="text-[#327691] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-[#8e9da5] dark:text-neutral-400 block">
                      {t("buyer_departure_time", "Jam Keberangkatan")}
                    </span>
                    <span className="text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                      {nextTrip.start_time?.slice(0, 5) || "08:00"} WIB
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <MapPin size={18} className="text-[#327691] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-semibold text-[#8e9da5] dark:text-neutral-400 block">
                      {t("buyer_pickup_point", "Titik Jemput")}
                    </span>
                    <span className="text-sm font-bold text-[#1e293b] dark:text-neutral-100 line-clamp-1">
                      {nextTrip.pickup_address || "Hotel / Stasiun Banyuwangi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Driver & Armada */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f4f9fb] dark:bg-neutral-800/80 border border-[#d2e4ec] dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#327691] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    <Car size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] block">
                      {t("buyer_driver_assigned", "Driver & Armada Ditugaskan")}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#1e293b] dark:text-neutral-100">
                      {nextTrip.assigned_driver_name || "Pak Budi Santoso"}
                    </h4>
                    <span className="text-xs font-semibold text-[#64748b] dark:text-neutral-400">
                      {nextTrip.assigned_vehicle_plate || "P 1982 XX"} · {nextTrip.assigned_vehicle_model || "Isuzu Trooper 4x4 Offroad"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    href={`/buyer/pesanan/${nextTrip.id}/tiket`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-[#d2e4ec] dark:border-neutral-700 text-[#327691] dark:text-[#8abbd0] hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 text-xs font-bold shadow-2xs transition"
                  >
                    <Printer size={15} />
                    <span>{t("buyer_view_ticket", "Lihat & Unduh E-Tiket")}</span>
                  </Link>

                  {/* WhatsApp Driver (Hanya jika lunas) */}
                  {isNextTripFullyPaid && waDriverLink ? (
                    <a
                      href={waDriverLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition"
                    >
                      <Phone size={15} />
                      <span>WhatsApp Driver</span>
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                      <Lock size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>{t("buyer_driver_locked", "WhatsApp Driver terbuka setelah pelunasan")}</span>
                    </div>
                  )}

                  {/* Tombol Bayar Sekarang / Pelunasan */}
                  {nextTrip.booking_status === "approved" && (
                    <Link
                      href={`/pesanan/${nextTrip.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition"
                    >
                      <CreditCard size={15} />
                      <span>{t("buyer_btn_pay", "Bayar Sekarang")} ({formatIDR(nextTrip.amount_to_pay)})</span>
                    </Link>
                  )}

                  {nextTrip.booking_status !== "approved" && !isNextTripFullyPaid && (nextTrip.remaining_amount ?? 0) > 0 && (
                    <Link
                      href={`/pesanan/${nextTrip.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition"
                    >
                      <CreditCard size={15} />
                      <span>{t("buyer_btn_settle", "Pelunasan")} ({formatIDR(nextTrip.remaining_amount)})</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <span className="text-xs font-bold text-[#327691] dark:text-[#8abbd0] uppercase tracking-wider">
                {t("buyer_empty_badge", "Petualangan 4x4 Menanti Anda")}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#1e293b] dark:text-neutral-100">
                {t("buyer_empty_title", "Jelajahi Banyuwangi dengan Jeep Trooper Prima")}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 leading-relaxed">
                {t("buyer_empty_desc", "Pilih paket populer seperti Kawah Ijen Blue Fire, Safari Baluran Africa Van Java, atau Trek Offroad Sukamade Meru Betiri bersama sopir lokal berpengalaman.")}
              </p>
            </div>
            <Link
              href="/sewa"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
            >
              <Compass size={17} />
              <span>{t("buyer_view_catalog", "Lihat Katalog Tour Trooper")}</span>
            </Link>
          </div>
        )}

        {/* 3. Daftar Pesanan Terkini */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f6] dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-[#1e293b] dark:text-neutral-100">
                {t("buyer_booking_history", "Daftar Riwayat Booking Anda")}
              </h3>
              <p className="text-xs text-[#64748b] dark:text-neutral-400 mt-0.5">
                {t("buyer_booking_history_sub", "Kelola status pesanan, pembayaran, dan tiket perjalanan Anda.")}
              </p>
            </div>
            {orders.length > 0 && (
              <Link
                href="/buyer/pesanan"
                className="text-xs font-bold text-[#327691] hover:text-[#2c6881] hover:underline"
              >
                {t("buyer_view_all_orders", "Lihat Semua Pesanan →")}
              </Link>
            )}
          </div>

          <div className="divide-y divide-[#f0f4f6] dark:divide-neutral-800 mt-3">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748b] dark:text-neutral-400">
                <ReceiptText size={32} className="mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                <p>{t("buyer_no_orders", "Belum ada riwayat pemesanan.")}</p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => {
                const statusLabel = bookingStatus[order.booking_status] || order.booking_status;
                const isApproved = order.booking_status === "approved";
                const isConfirmed = ["confirmed", "payment_received", "in_progress"].includes(order.booking_status);
                return (
                  <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : isConfirmed
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          {statusLabel}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#8e9da5]">
                          #{order.id}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                        {order.product_name}
                      </h4>
                      <p className="text-xs text-[#64748b] dark:text-neutral-400">
                        {order.service_date} · {order.num_units} Unit
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right sm:pr-2">
                        <span className="text-[10px] font-semibold text-[#8e9da5] block">{t("buyer_order_total", "Total Biaya")}</span>
                        <span className="text-sm font-black text-[#2c6881] dark:text-[#8abbd0]">
                          {formatIDR(order.total_amount)}
                        </span>
                      </div>
                      <Link
                        href={`/buyer/pesanan/${order.id}`}
                        className="px-3.5 py-2 rounded-xl border border-[#d2e4ec] dark:border-neutral-700 text-[#327691] dark:text-[#8abbd0] hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 text-xs font-bold transition"
                      >
                        {t("buyer_btn_detail", "Detail")}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BuyerPortalLayout>
  );
}
