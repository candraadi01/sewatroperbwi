"use client";

import Link from "next/link";
import Image from "next/image";
import { formatIDR } from "@/lib/utils/currency";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { useLanguage } from "@/lib/i18n/context";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CreditCard,
  Compass,
  Globe,
  Users,
  ArrowRight,
  ReceiptText,
} from "lucide-react";
import type { BookingRecord } from "@/lib/services/booking";
import type { Product } from "@/types/database";
import { SAMPLE_PRODUCTS } from "@/lib/services/products-data";

interface BuyerDashboardClientProps {
  user: {
    id?: string;
    fullName: string;
    email: string;
    roles?: string[];
    avatarUrl?: string;
  };
  orders: BookingRecord[];
  recommendedProducts?: Product[];
}

export function BuyerDashboardClient({ user, orders, recommendedProducts }: BuyerDashboardClientProps) {
  const { t } = useLanguage();

  // Ambil 4 rekomendasi teratas (fallback ke SAMPLE_PRODUCTS)
  const displayRecommendations =
    recommendedProducts && recommendedProducts.length >= 4
      ? recommendedProducts.slice(0, 4)
      : (recommendedProducts && recommendedProducts.length > 0
          ? [...recommendedProducts, ...SAMPLE_PRODUCTS].slice(0, 4)
          : SAMPLE_PRODUCTS.slice(0, 4));

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

  return (
    <BuyerPortalLayout user={user} activeMenu="beranda">
      <div className="space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 tracking-tight">
              {t("buyer_welcome", "Selamat datang,")}{" "}
              <span className="text-[#327691] dark:text-[#8abbd0]">{user.fullName || "Pelanggan"}</span>
            </h1>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
          >
            <Globe size={15} />
            <span>Ke Beranda Website</span>
          </Link>
        </div>

        {/* 1. Ringkasan Aktivitas (4 Clean Stat Cards) */}
        <div>
          <h2 className="text-sm font-bold text-[#1e293b] dark:text-neutral-200 mb-3.5">
            {t("buyer_activity_summary", "Ringkasan Aktivitas")}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Card 1: Perlu Pembayaran */}
            <Link
              href="/buyer/pesanan"
              className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400">
                  {t("buyer_stat_need_pay", "Siap Dibayar")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 my-1.5 sm:my-2.5">
                {waitingPaymentOrders.length}
              </p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline">
                {waitingPaymentOrders.length > 0 ? t("buyer_finish_bill", "Selesaikan →") : t("buyer_no_bill", "Tidak ada tagihan →")}
              </span>
            </Link>

            {/* Card 2: Menunggu Konfirmasi */}
            <Link
              href="/buyer/pesanan"
              className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-sky-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400">
                  {t("buyer_stat_waiting", "Menunggu Konfirmasi")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 my-1.5 sm:my-2.5">
                {pendingReviewOrders.length}
              </p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                {t("buyer_check_fleet", "Pengecekan armada →")}
              </span>
            </Link>

            {/* Card 3: Siap Berangkat */}
            <Link
              href="/buyer/pesanan"
              className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-emerald-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400">
                  {t("buyer_stat_ready", "Siap Berangkat")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 my-1.5 sm:my-2.5">
                {confirmedTrips.length}
              </p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                {t("buyer_ticket_active", "Jadwal aktif →")}
              </span>
            </Link>

            {/* Card 4: Trip Selesai */}
            <Link
              href="/buyer/pesanan"
              className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-slate-400 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-neutral-400">
                  {t("buyer_stat_completed", "Trip Selesai")}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-neutral-100 my-1.5 sm:my-2.5">
                {completedOrders.length}
              </p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-neutral-400 hover:underline">
                {t("buyer_history_link", "Riwayat liburan →")}
              </span>
            </Link>
          </div>
        </div>

        {/* 2. Banner Jadwal Trip Terdekat */}
        {nextTrip ? (
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 p-4 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#327691] text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] block">
                      Trip Berikutnya
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-neutral-100">
                      {nextTrip.product_name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {countdownText && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                      {countdownText}
                    </span>
                  )}
                  <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-neutral-700">
                    #{nextTrip.id}
                  </span>
                </div>
              </div>

              {/* Rincian Jadwal & Titik Jemput (Grid 2 Kolom Mobile, 3 Kolom Desktop) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800">
                  <Calendar size={16} className="text-[#327691] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      {t("buyer_order_date", "Tanggal Trip")}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100">
                      {nextTrip.service_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800">
                  <Clock size={16} className="text-[#327691] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      {t("buyer_departure_time", "Jam Keberangkatan")}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100">
                      {nextTrip.start_time?.slice(0, 5) || "08:00"} WIB
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 col-span-2 md:col-span-1">
                  <MapPin size={16} className="text-[#327691] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      {t("buyer_pickup_point", "Titik Jemput")}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100 truncate block">
                      {nextTrip.pickup_address || "Hotel / Stasiun Banyuwangi"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Rapi & To The Point */}
              <div className="pt-2 flex items-center justify-end gap-2.5 flex-wrap">
                <Link
                  href={`/buyer/pesanan/${nextTrip.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-bold transition border border-slate-200 dark:border-neutral-700"
                >
                  <span>Detail Pemesanan</span>
                </Link>

                {/* Tombol Nota / Kwitansi saat booking dikonfirmasi atau dibayar */}
                {((nextTrip.amount_paid ?? 0) > 0 ||
                  ["confirmed", "payment_received", "in_progress", "completed"].includes(nextTrip.booking_status)) && (
                  <Link
                    href={`/buyer/pesanan/${nextTrip.id}/nota`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition"
                  >
                    <ReceiptText size={14} />
                    <span>Nota / Kwitansi</span>
                  </Link>
                )}

                {nextTrip.booking_status === "approved" && (
                  <Link
                    href={`/pesanan/${nextTrip.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition"
                  >
                    <CreditCard size={14} />
                    <span>{t("buyer_btn_pay", "Bayar Sekarang")} ({formatIDR(nextTrip.amount_to_pay)})</span>
                  </Link>
                )}

                {nextTrip.booking_status !== "approved" && !isNextTripFullyPaid && (nextTrip.remaining_amount ?? 0) > 0 && (
                  <Link
                    href={`/pesanan/${nextTrip.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition"
                  >
                    <CreditCard size={14} />
                    <span>{t("buyer_btn_settle", "Pelunasan")} ({formatIDR(nextTrip.remaining_amount)})</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-black text-[#1e293b] dark:text-neutral-100">
                Jelajahi Destinasi Banyuwangi
              </h3>
              <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400">
                Kawah Ijen, Baluran, Sukamade, dan destinasi lainnya bersama driver berpengalaman.
              </p>
            </div>
            <Link
              href="/buyer/katalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
            >
              <Compass size={17} />
              <span>{t("buyer_view_catalog", "Lihat Katalog Jeep Trooper")}</span>
            </Link>
          </div>
        )}

        {/* 3. Rekomendasi Trooper (Grid 2x2: Kiri Kanan Atas Bawah, Total 4 Kartu) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-6 md:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f0f4f6] dark:border-neutral-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#faefd9] text-[#8a510b] dark:bg-amber-950/40 dark:text-amber-400">
                  <Sparkles size={16} />
                </span>
                <h3 className="text-base font-bold text-[#1e293b] dark:text-neutral-100">
                  {t("buyer_recommendations_title", "Rekomendasi Trooper")}
                </h3>
              </div>
              <p className="text-xs text-[#64748b] dark:text-neutral-400 mt-1">
                {t("buyer_recommendations_sub", "Pilihan armada Jeep Trooper 4x4 terpopuler untuk petualangan Anda di Banyuwangi.")}
              </p>
            </div>
            <Link
              href="/buyer/katalog"
              className="text-xs font-bold text-[#327691] hover:text-[#2c6881] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{t("buyer_view_all_catalog", "Lihat Semua Katalog →")}</span>
            </Link>
          </div>

          {/* Grid 2 Kolom x 2 Baris = 4 Kartu Katalog (Kiri-Kanan Atas & Kiri-Kanan Bawah) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4.5 mt-4 sm:mt-5">
            {displayRecommendations.map((product, idx) => {
              let rawImg = product.images?.[0] || "/images/landing/tour-trooper-baluran-savana.jpg";
              if (rawImg.includes("tour-baluran.jpg")) {
                rawImg = "/images/landing/tour-trooper-baluran-savana.jpg";
              }
              const mainImage = rawImg;
              const productUrl = `/sewa/${product.slug}`;
              const capacity = product.passenger_capacity || 6;
              const duration = product.duration_text || (product.duration_minutes ? `${Math.round(product.duration_minutes / 60)} Jam` : "1 Hari");

              return (
                <Link
                  key={product.id || idx}
                  href={productUrl}
                  className="group flex flex-col justify-between bg-[#f8fafc] dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-800 border border-[#e4ebef] dark:border-neutral-700/60 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#327691]/40 dark:hover:border-neutral-600 transition-all duration-200"
                >
                  {/* Foto Thumbnail Proporsional (Aspect ratio tidak gepeng / tidak perot) */}
                  <div className="relative w-full aspect-4/3 sm:aspect-16/10 overflow-hidden bg-slate-900 select-none">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={mainImage.startsWith("https://") && !mainImage.startsWith("https://res.cloudinary.com/")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                    {/* Badge Top Left */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {product.is_best_seller || idx === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#f4bd42] text-[#151510] text-[10px] font-bold shadow-xs">
                          Best Seller
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#2c6881] text-white text-[10px] font-bold shadow-xs">
                          Jeep 4x4
                        </span>
                      )}
                    </div>

                    {/* Badge Bottom Left: Kapasitas */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white text-[10px] font-semibold drop-shadow-xs">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-xs flex items-center gap-1">
                        <Users size={11} />
                        <span>{capacity} Seat</span>
                      </span>
                      <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-xs items-center gap-1">
                        <Clock size={11} />
                        <span>{duration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Kartu */}
                  <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1e293b] dark:text-neutral-100 group-hover:text-[#327691] dark:group-hover:text-[#8abbd0] line-clamp-2 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-[#64748b] dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {product.short_description || "Paket Adventure 4x4 Banyuwangi"}
                      </p>
                    </div>

                    {/* Footer Harga & Tombol Detail */}
                    <div className="pt-2 border-t border-[#eaf0f4] dark:border-neutral-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mt-auto">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-[#8e9da5] block leading-tight">
                          {t("price_starting_from", "Mulai dari")}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#2c6881] dark:text-[#8abbd0] block">
                          {formatIDR(product.base_price || 750000)}
                        </span>
                      </div>
                      <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#327691] group-hover:bg-[#2c6881] text-white text-[11px] font-bold shadow-2xs transition shrink-0">
                        <span>{t("buyer_btn_detail", "Detail")}</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </BuyerPortalLayout>
  );
}
