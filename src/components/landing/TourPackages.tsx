"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SAMPLE_PRODUCTS } from "@/lib/services/products-data";
import { ProductCard } from "@/components/ProductCard";

export function TourPackages() {
  // Hanya tampilkan 6 produk Jeep Wisata Banyuwangi di landing page
  const wisataProducts = SAMPLE_PRODUCTS.filter((p) => !p.is_featured).slice(0, 6);

  return (
    <section className="py-14 md:py-20 bg-[#f7f8f9] relative font-sans border-b border-[#e4ebef]">
      <div className="container-app">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#263b46] tracking-tight">
            Jeep Wisata Banyuwangi
          </h2>
          <p className="mt-2.5 text-[#53636d] text-xs sm:text-sm md:text-base leading-relaxed">
            Berbagai Paket Wisata Jeep yang telah kami siapkan untuk Anda dan keluarga. Are you ready for adventure with us?
          </p>
        </div>

        {/* 6 Cards 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {wisataProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Link Lihat Semua Tour kecil di pojok kanan bawah catalog */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#327691] hover:text-[#2c6881] hover:underline transition"
          >
            <span>Lihat Semua Tour</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
