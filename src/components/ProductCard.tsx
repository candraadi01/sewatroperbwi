"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Check, Car, Sparkles } from "lucide-react";
import type { Product } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
import { useCart } from "@/lib/cart/context";
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
  const { addItem, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);
  const productUrl = date
    ? `/sewa/${p.slug}?date=${encodeURIComponent(date)}`
    : `/sewa/${p.slug}`;

  const mainImage = p.images?.[0] || "/images/landing/tour-baluran.jpg";
  const gallery =
    p.gallery_images && p.gallery_images.length >= 3
      ? p.gallery_images
      : [
          mainImage,
          p.images?.[1] || "/images/landing/tour-kawah-ijen.jpg",
          p.images?.[2] || "/images/landing/tour-djawatan.jpg",
        ];

  const badgeText = p.badge_label || p.name;
  const durationDisplay =
    p.duration_text ||
    (p.duration_minutes
      ? `${Math.round(p.duration_minutes / 60)} Jam`
      : "1 Hari");
  const capacityDisplay = t("guest_capacity", "Max {n} Orang").replace("{n}", String(p.passenger_capacity || 6));
  const destinationPoints = getProductDestinationPoints(p);
  const finalPrice = p.base_price && p.base_price > 0 ? p.base_price : 750000;

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: p.id,
      slug: p.slug,
      title: p.name,
      image: mainImage,
      price: finalPrice,
      duration: durationDisplay,
      capacity: capacityDisplay,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e4ebef] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      {/* 1. Header Gambar dengan Kolase Polaroid & Ribbon Lipat */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-900 select-none">
        <Image
          src={mainImage}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 group-hover:grayscale-[30%] transition-all duration-500 opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30 pointer-events-none" />

        {/* Hover Overlay: Tombol Lihat Detail Sesuai Contoh Foto 1 */}
        <Link
          href={productUrl}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          title={`Lihat detail ${p.name}`}
        >
          <div className="inline-flex items-stretch rounded-lg shadow-2xl overflow-hidden border border-white/25 transform scale-95 group-hover:scale-100 transition-transform duration-300">
            <span className="bg-[#e11d48] text-white px-3 py-2 flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </span>
            <span className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-2 text-xs font-bold tracking-wide flex items-center transition-colors">
              Lihat Detail
            </span>
          </div>
        </Link>

        {/* BEST SELLER Ribbon Merah jika ditandai */}
        {p.is_best_seller && (
          <div className="absolute top-2.5 left-2.5 z-30 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg border border-red-400/50">
              <Sparkles size={11} className="fill-white" />
              BEST SELLER
            </span>
          </div>
        )}

        {/* Watermark Brand Atas Kanan */}
        <div className="absolute top-2.5 right-3 z-30 pointer-events-none text-[9px] font-black italic text-white/90 drop-shadow-md tracking-wider">
          SEWA JEEP BWI
        </div>

        {/* Strip 3 Foto Thumbnail Rapi di Pojok Kanan Bawah */}
        <div className="absolute bottom-5 right-2.5 flex items-center gap-1 z-30 pointer-events-none">
          {gallery.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="w-10 h-7 sm:w-11 sm:h-8 rounded-md bg-white p-[2px] shadow-lg ring-1 ring-white/80 transition-transform duration-300 group-hover:scale-105"
            >
              <div className="relative w-full h-full rounded-sm overflow-hidden">
                <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="48px" />
              </div>
            </div>
          ))}
        </div>

        {/* Badge Bookmark Ribbon Lipat di Bawah Gambar */}
        <div className="absolute -bottom-3 left-3.5 z-30 pointer-events-none">
          <div className="relative bg-[#327691] text-white text-[11px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-r-md flex items-center gap-1.5 shadow-md">
            <div className="absolute -bottom-1 left-0 w-0 h-0 border-t-[4px] border-t-[#254958] border-l-[4px] border-l-transparent" />
            <span className="max-w-[200px] truncate">{badgeText}</span>
            <Car size={13} className="text-white shrink-0 ml-1" />
          </div>
        </div>
      </div>

      {/* 2. Isi Badan Kartu */}
      <div className="pt-6 pb-2 px-4 sm:px-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={productUrl}>
            <h3 className="text-center font-black text-sm sm:text-[15px] text-[#263b46] uppercase tracking-tight leading-snug group-hover:text-[#327691] transition-colors">
              {p.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-[11px] text-[#53636d] font-semibold mt-2.5">
            <span className="flex items-center gap-1 text-[#53636d]">
              <Clock size={12} className="text-[#697780]" />
              <span>{durationDisplay}</span>
            </span>
            <span className="text-[#263b46] font-bold">{capacityDisplay}</span>
          </div>

          <div className="border-b border-dashed border-[#e4ebef] my-2.5" />

          <div className="space-y-1.5 py-0.5 min-h-[46px]">
            {destinationPoints.slice(0, 2).map((dest, i) => {
              const filterUrl = dest.slug
                ? `/sewa?destinasi=${encodeURIComponent(dest.slug)}${date ? `&date=${encodeURIComponent(date)}` : ""}`
                : undefined;

              return (
                <div key={i} className="flex items-start gap-1.5 text-[11px] font-medium leading-tight text-[#53636d]">
                  <MapPin size={12} className="text-[#327691] shrink-0 mt-0.5" />
                  {filterUrl ? (
                    <Link
                      href={filterUrl}
                      onClick={(e) => e.stopPropagation()}
                      title={`Klik untuk mencari paket destinasi ${dest.name}`}
                      className="line-clamp-1 hover:text-[#327691] hover:underline font-semibold transition-colors cursor-pointer"
                    >
                      {dest.name}
                    </Link>
                  ) : (
                    <span className="line-clamp-1">{dest.name}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-b border-dashed border-[#e4ebef] my-2.5" />

          <div className="text-center py-1">
            <span className="text-base sm:text-lg font-black text-[#2c6881] tracking-tight">
              {formatIDR(finalPrice)}
            </span>
            <span className="text-xs text-[#697780] font-semibold">{t("per_jeep", " / Jeep")}</span>
          </div>
        </div>
      </div>

      {/* 3. Tombol Booking Sekarang Full Width */}
      <div className="p-3 pt-0">
        <Link
          href={productUrl}
          className="w-full bg-[#327691] hover:bg-[#2c6881] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider cursor-pointer"
        >
          <span>{t("btn_book_now", "Booking Sekarang")}</span>
        </Link>
      </div>
    </div>
  );
}
