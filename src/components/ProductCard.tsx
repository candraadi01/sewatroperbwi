"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Check, Sparkles, Users } from "lucide-react";
import type { Product } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
import { getProductDestinationPoints } from "@/lib/utils/destinations";
import { useLanguage } from "@/lib/i18n/context";

export const serviceLabels = {
  paket_rute: "Paket Rute",
  harian_sopir: "Harian + Sopir",
  harian_lepas_kunci: "Lepas Kunci",
};

export function ProductCard({
  product: p,
  date,
}: {
  product: Product;
  date?: string;
}) {
  const { t } = useLanguage();
  const productUrl = date
    ? `/sewa/${p.slug}?date=${encodeURIComponent(date)}`
    : `/sewa/${p.slug}`;

  const mainImage = p.images?.[0] || "/images/landing/tour-baluran.jpg";

  const badgeText = p.badge_label || (p.is_featured ? "Paket Favorit" : null);
  const durationDisplay =
    p.duration_text ||
    (p.duration_minutes
      ? `${Math.round(p.duration_minutes / 60)} Jam`
      : "1 Hari");
  const capacityDisplay = t("guest_capacity", "Max {n} Orang").replace("{n}", String(p.passenger_capacity || 6));
  const destinationPoints = getProductDestinationPoints(p);
  const finalPrice = p.base_price && p.base_price > 0 ? p.base_price : 750000;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* 1. Header Gambar Rapi & Proporsional */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900 select-none">
        <Image
          src={mainImage}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 group-hover:grayscale-[20%] transition-transform duration-500 opacity-95"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

        {/* Hover Overlay: Tombol Lihat Detail Sesuai Contoh Foto */}
        <Link
          href={productUrl}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          title={`Lihat detail ${p.name}`}
        >
          <div className="inline-flex items-stretch rounded-lg shadow-2xl overflow-hidden border border-white/20 transform scale-95 group-hover:scale-100 transition-transform duration-300">
            <span className="bg-[#e11d48] text-white px-3 py-2 flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </span>
            <span className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 text-xs font-bold tracking-wide flex items-center transition-colors">
              Lihat Detail
            </span>
          </div>
        </Link>

        {/* Badges Atas Rapi: Best Seller & Kategori */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {p.is_best_seller && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                <Sparkles size={11} className="fill-white" />
                BEST SELLER
              </span>
            )}
            {badgeText && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                {badgeText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Isi Badan Kartu yang Terstruktur Rapi */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Judul Paket Wisata */}
          <Link href={productUrl}>
            <h3 className="font-bold text-sm sm:text-base text-[#1e293b] leading-snug group-hover:text-[#327691] transition-colors line-clamp-2 min-h-[40px] sm:min-h-[44px]">
              {p.name}
            </h3>
          </Link>

          {/* Info Durasi & Kapasitas Tamu */}
          <div className="flex items-center gap-2.5 text-xs text-[#64748b] mt-2 mb-3 font-medium">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} className="text-[#327691]" />
              {durationDisplay}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[#475569]">
              <Users size={13} className="text-[#327691]" />
              {capacityDisplay}
            </span>
          </div>

          {/* Titik Destinasi Unggulan */}
          <div className="space-y-1.5 min-h-[44px] mb-3 text-xs text-[#64748b]">
            {destinationPoints.slice(0, 2).map((dest, i) => {
              const filterUrl = dest.slug
                ? `/sewa?destinasi=${encodeURIComponent(dest.slug)}${date ? `&date=${encodeURIComponent(date)}` : ""}`
                : undefined;

              return (
                <div key={i} className="flex items-center gap-1.5 leading-tight">
                  <MapPin size={13} className="text-[#327691] shrink-0" />
                  {filterUrl ? (
                    <Link
                      href={filterUrl}
                      onClick={(e) => e.stopPropagation()}
                      title={`Filter paket ${dest.name}`}
                      className="truncate hover:text-[#327691] hover:underline transition-colors"
                    >
                      {dest.name}
                    </Link>
                  ) : (
                    <span className="truncate">{dest.name}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 my-3" />

          {/* Tarif Paket */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[11px] text-[#64748b] font-medium">Tarif Mulai</span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-[#263b46] tracking-tight">
                {formatIDR(finalPrice)}
              </span>
              <span className="text-xs text-[#64748b] font-semibold">{t("per_jeep", " / Jeep")}</span>
            </div>
          </div>
        </div>

        {/* 3. Tombol Booking Sekarang */}
        <Link
          href={productUrl}
          className="w-full bg-[#327691] hover:bg-[#255b70] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider cursor-pointer"
        >
          <span>{t("btn_book_now", "Booking Sekarang")}</span>
        </Link>
      </div>
    </div>
  );
}
