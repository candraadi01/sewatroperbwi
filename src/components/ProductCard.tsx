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
      <div className="relative h-50 sm:h-54 md:h-56 w-full overflow-hidden bg-slate-900 select-none">
        <Image
          src={mainImage}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
        />

        {/* Subtle Gradient Overlay untuk kedalaman visual */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

        {/* 3D Diagonal Corner Ribbon "BEST SELLER" (Persis Referensi Foto) */}
        {p.is_best_seller && (
          <div className="absolute top-0 left-0 z-20 pointer-events-none select-none">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`bestSellerRibbon-${p.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#991b1b" />
                  <stop offset="15%" stopColor="#dc2626" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="85%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
              </defs>

              {/* Lipatan 3D Sudut Atas (Dark Red Shadow) */}
              <path d="M78 0 L83 5 L78 5 Z" fill="#7f1d1d" />
              {/* Lipatan 3D Sudut Kiri (Dark Red Shadow) */}
              <path d="M0 78 L5 83 L5 78 Z" fill="#7f1d1d" />

              {/* Badan Pita Merah Diagonal */}
              <polygon points="0,48 48,0 78,0 0,78" fill={`url(#bestSellerRibbon-${p.id})`} />

              {/* Garis Aksen Putih di Tepi Atas & Bawah Pita */}
              <line x1="48" y1="0" x2="0" y2="48" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
              <line x1="78" y1="0" x2="0" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

              {/* Teks "BEST SELLER" Miring 45 Derajat Persis di Tengah Pita */}
              <text
                x="31.5"
                y="31.5"
                fill="#ffffff"
                fontSize="9.5"
                fontWeight="900"
                fontFamily="Arial, system-ui, -apple-system, sans-serif"
                letterSpacing="1.2"
                textAnchor="middle"
                dominantBaseline="central"
                transform="rotate(-45 31.5 31.5)"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
              >
                BEST SELLER
              </text>
            </svg>
          </div>
        )}

        {/* Badge Kategori/Favorit di Pojok Kanan Atas */}
        {badgeText && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="inline-block px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              {badgeText}
            </span>
          </div>
        )}

        {/* Hover Overlay: Tombol Lihat Detail */}
        <Link
          href={productUrl}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          title={`Lihat detail ${p.name}`}
        >
          <div className="inline-flex items-stretch rounded-lg shadow-2xl overflow-hidden border border-white/20 transform scale-95 group-hover:scale-100 transition-transform duration-300">
            <span className="bg-[#327691] text-white px-3 py-2 flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </span>
            <span className="bg-[#263b46] hover:bg-[#1a2931] text-white px-4 py-2 text-xs font-bold tracking-wide flex items-center transition-colors">
              Lihat Detail
            </span>
          </div>
        </Link>
      </div>

      {/* 2. Isi Badan Kartu yang Terstruktur Rapi Sesuai Konsep Web (#327691 & #263b46) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Judul Paket Wisata — Brand Coastal Theme */}
          <Link href={productUrl}>
            <h3 className="font-bold text-sm sm:text-base text-[#263b46] hover:text-[#327691] leading-snug transition-colors line-clamp-2 min-h-[40px] sm:min-h-[44px]">
              {p.name}
            </h3>
          </Link>

          {/* Info Durasi & Kapasitas Tamu — Warna Ikon #327691 Sesuai Konsep Web */}
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

          {/* Titik Destinasi Unggulan — Warna Ikon #327691 Sesuai Konsep Web */}
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

          {/* Tarif Paket — Sesuai Konsep Warna Web */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs text-[#327691] font-bold">*Mulai</span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-[#263b46] tracking-tight">
                {formatIDR(finalPrice)}
              </span>
              <span className="text-xs text-[#64748b] font-bold uppercase">{t("per_jeep", " / JEEP")}</span>
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
