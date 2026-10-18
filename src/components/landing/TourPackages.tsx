"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SAMPLE_PRODUCTS } from "@/lib/services/products-data";
import { ProductCard } from "@/components/ProductCard";

export function TourPackages() {
  // Ambil 6 produk Jeep Wisata Banyuwangi resmi (Single Source of Truth)
  const wisataProducts = SAMPLE_PRODUCTS.filter((p) => !p.is_featured);

  return (
    <section className="py-14 md:py-20 bg-slate-50 relative font-sans border-b border-neutral-200/70">
      <div className="container-app">
        {/* Header Section (Foto 2) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0ea5e9] tracking-tight">
              Jeep Wisata Banyuwangi
            </h2>
            <p className="mt-2 text-neutral-600 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
              Berbagai Paket Wisata Jeep yang telah kami siapkan untuk Anda dan keluarga. Are you ready for adventure with us?
            </p>
          </div>

          <div className="text-center md:text-right shrink-0">
            <Link
              href="/sewa"
              className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-[#0ea5e9] hover:text-[#0284c7] transition"
            >
              <ChevronRight size={16} />
              <span>Lihat Semua Tour</span>
            </Link>
          </div>
        </div>

        {/* 6 Cards 3x2 Grid — Menggunakan ProductCard Resmi Bersatu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {wisataProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
