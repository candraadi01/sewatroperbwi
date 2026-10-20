"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Check, Car } from "lucide-react";
import type { Product } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
import { useCart } from "@/lib/cart/context";

export const serviceLabels = {
  paket_rute: "Paket Rute",
  harian_sopir: "Harian + Sopir",
  harian_lepas_kunci: "Lepas Kunci",
};

export function ProductCard({ product: p }: { product: Product }) {
  const { addItem, setIsCartOpen } = useCart();
  const [isAdded, setIsAdded] = useState(false);

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
  const capacityDisplay = `Max ${p.passenger_capacity || 6} Orang`;
  const destinationList =
    p.destinations && p.destinations.length > 0
      ? p.destinations
      : [p.short_description || p.route_name || p.name];

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: p.id,
      slug: p.slug,
      title: p.name,
      image: mainImage,
      price: p.base_price || 0,
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
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />

        {/* BEST SELLER Ribbon jika ada */}
        {p.is_best_seller && (
          <div className="absolute top-0 left-0 overflow-hidden w-28 h-28 pointer-events-none z-30">
            <div className="absolute top-5 -left-8 w-34 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-[9.5px] font-black uppercase tracking-wider text-center py-1 -rotate-45 shadow-md border-y border-white/25">
              BEST SELLER
            </div>
          </div>
        )}

        {/* Watermark Brand Atas Kanan */}
        <div className="absolute top-2.5 right-3 z-10 text-[9px] font-black italic text-white/90 drop-shadow-md tracking-wider">
          SEWA JEEP BWI
        </div>

        {/* Kolase 3 Foto Polaroid Menumpuk */}
        <div className="absolute top-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
          <div className="w-13 h-9 sm:w-15 sm:h-10 rounded-xs bg-white p-0.5 shadow-md -rotate-6 transform transition-transform group-hover:-translate-x-1">
            <div className="relative w-full h-full rounded-2xs overflow-hidden">
              <Image src={gallery[0]} alt="Preview 1" fill className="object-cover" sizes="60px" />
            </div>
          </div>
          <div className="w-18 h-12 sm:w-20 sm:h-13 rounded-xs bg-white p-0.5 shadow-xl z-10 transform scale-105 transition-transform group-hover:scale-110">
            <div className="relative w-full h-full rounded-2xs overflow-hidden">
              <Image src={gallery[1]} alt="Preview 2" fill className="object-cover" sizes="80px" />
            </div>
          </div>
          <div className="w-13 h-9 sm:w-15 sm:h-10 rounded-xs bg-white p-0.5 shadow-md rotate-6 transform transition-transform group-hover:translate-x-1">
            <div className="relative w-full h-full rounded-2xs overflow-hidden">
              <Image src={gallery[2]} alt="Preview 3" fill className="object-cover" sizes="60px" />
            </div>
          </div>
        </div>

        {/* Badge Bookmark Ribbon Lipat di Bawah Gambar */}
        <div className="absolute -bottom-3 left-3.5 z-20">
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
          <Link href={`/sewa/${p.slug}`}>
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
            {destinationList.slice(0, 2).map((dest, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#53636d] font-medium leading-tight">
                <MapPin size={12} className="text-[#327691] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{dest}</span>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-[#e4ebef] my-2.5" />

          <div className="text-center py-1">
            <span className="text-base sm:text-lg font-black text-[#2c6881] tracking-tight">
              {p.base_price ? formatIDR(p.base_price) : "Hubungi Admin"}
            </span>
            <span className="text-xs text-[#697780] font-semibold"> / Jeep</span>
          </div>
        </div>
      </div>

      {/* 3. Tombol Booking Sekarang Full Width */}
      <div className="p-3 pt-0">
        <Link
          href={`/sewa/${p.slug}`}
          className="w-full bg-[#327691] hover:bg-[#2c6881] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider cursor-pointer"
        >
          <span>Booking Sekarang</span>
        </Link>
      </div>
    </div>
  );
}
