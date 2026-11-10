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

  // Ekstraksi nama rute untuk overlay branding brosur (sesuai referensi foto)
  const upperName = (p.name || "").toUpperCase();
  const cleanedRoute =
    upperName.replace(/^(SEWA\s+)?(JEEP\s+)?(TROOPER\s+)?/i, "").trim() ||
    p.route_name?.toUpperCase() ||
    "BANYUWANGI TRIP";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* 1. Header Gambar Produk Lebih Besar & Megah (Sesuai Referensi Foto) */}
      <div className="relative h-60 sm:h-64 md:h-68 w-full overflow-hidden bg-slate-900 select-none">
        <Image
          src={mainImage}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 group-hover:grayscale-[15%] transition-transform duration-500 opacity-95"
        />

        {/* Gradient Overlay Sinematik Menyeluruh untuk Keterbacaan Sempurna */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25 pointer-events-none" />

        {/* 2. Banner Branding Ala Brosur Wisata Jeep — Posisi Tengah Vertikal (Persis Referensi Foto) */}
        <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex items-stretch gap-2.5 max-w-[85%] pointer-events-none select-none">
          {/* Garis Vertikal Putih Tebal */}
          <div className="w-1.5 bg-white rounded-full shrink-0 shadow-md self-stretch" />

          {/* Blok Teks Bertingkat */}
          <div className="flex flex-col items-start justify-center gap-1.5">
            {/* Tag Atas Oranye */}
            <span className="inline-block bg-[#ea580c] text-white font-playful-block text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px] leading-tight shadow-md">
              PAKET JEEP
            </span>

            {/* Judul Bold Bertingkat — Rounded Playful Sans / Handwritten Block (Sesuai Referensi Foto) */}
            <div className="text-white font-playful-block leading-[1.12] drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]">
              <span className="block text-[11.5px] sm:text-[13px] tracking-wide font-extrabold opacity-95">
                SEWA JEEP
              </span>
              <span className="block text-[13px] sm:text-[15px] md:text-[16px] tracking-normal uppercase line-clamp-2 font-black">
                {cleanedRoute}
              </span>
            </div>

            {/* Tag Bawah Oranye */}
            <span className="inline-block bg-[#ea580c] text-white font-playful-block text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px] leading-tight shadow-md">
              START BANYUWANGI
            </span>
          </div>
        </div>

        {/* Watermark Mini Logo Sewa Jeep di Pojok Kanan Atas (Sesuai Referensi Foto) */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/25 text-[9px] font-extrabold text-white tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            <span>SEWA JEEP BWI</span>
          </div>
        </div>

        {/* Hover Overlay: Tombol Lihat Detail */}
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
