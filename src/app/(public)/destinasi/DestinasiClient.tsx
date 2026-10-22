"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { DestinationItem } from "@/lib/services/destinations";

const categoryFilters = [
  "Semua",
  "Gunung",
  "Taman Nasional",
  "Hutan & Alam",
  "Pantai & Bahari",
  "Air Terjun",
] as const;

export function DestinasiClient({
  destinations,
}: {
  destinations: DestinationItem[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  const filteredDestinations =
    activeCategory === "Semua"
      ? destinations
      : destinations.filter((d) => d.category === activeCategory);

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 font-sans">
      <div className="container-app">
        {/* Header Section */}
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-[#e9f3f7] text-[#327691] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Panduan Destinasi Banyuwangi
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#263b46] tracking-tight">
            Destinasi Wisata Pilihan di Banyuwangi
          </h1>
          <p className="mt-3 text-[#53636d] text-xs sm:text-sm md:text-base leading-relaxed">
            Eksplorasi keindahan alam Banyuwangi mulai dari kawah vulkanik api biru, padang savana liar, hutan kanopi magis, hingga pantai eksotis bersama layanan Sewa Jeep Trooper 4x4 terpercaya.
          </p>
        </div>

        {/* Category Tabs Filter */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#327691] text-white shadow-xs"
                  : "bg-white text-[#53636d] hover:bg-[#f4f9fb] border border-[#e4ebef]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Counter */}
        <p className="mt-6 text-xs text-[#53636d] font-medium">
          Menampilkan <span className="text-[#327691] font-bold">{filteredDestinations.length}</span> destinasi wisata pilihan
        </p>

        {/* Destination Cards Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#e4ebef] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={dest.image || "/images/landing/tour-kawah-ijen.jpg"}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#327691] text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                      {dest.category}
                    </span>
                  </div>

                  {/* District Location in image bottom */}
                  {dest.district && (
                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center gap-1.5 text-xs font-semibold drop-shadow-sm">
                      <MapPin size={14} className="text-[#8abbd0] shrink-0" />
                      <span>{dest.district}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#263b46] group-hover:text-[#327691] transition-colors leading-snug">
                    {dest.name}
                  </h3>

                  <p className="mt-2 text-xs text-[#53636d] leading-relaxed line-clamp-3">
                    {dest.description}
                  </p>

                  {/* Highlights Tags */}
                  {dest.highlights && dest.highlights.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {dest.highlights.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#f4f9fb] text-[#263b46] text-[10px] font-semibold border border-[#e4ebef]"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button linking to Tour Package */}
              <div className="p-5 pt-0">
                <Link
                  href={`/sewa?q=${dest.queryParam || dest.name}`}
                  className="w-full bg-[#f4f9fb] hover:bg-[#327691] hover:text-white text-[#327691] font-bold text-xs py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 border border-[#ccd8de] hover:border-[#327691]"
                >
                  <span>Lihat Paket Jeep Tour</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 bg-gradient-to-r from-[#254958] via-[#2c6881] to-[#327691] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-black">
              Ingin Custom Rute atau Gabungkan Beberapa Destinasi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-100 max-w-xl">
              Armada Jeep Trooper 4x4 kami siap melayani rute fleksibel antar destinasi favorit pilihan Anda di Banyuwangi raya.
            </p>
          </div>

          <Link
            href="/sewa"
            className="px-6 py-3 bg-white text-[#254958] hover:bg-[#f4f9fb] rounded-xl font-extrabold text-xs sm:text-sm transition shrink-0 shadow-xs"
          >
            Pilih Sewa Jeep Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
