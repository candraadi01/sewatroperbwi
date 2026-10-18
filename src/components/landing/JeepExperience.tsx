"use client";

import { useState } from "react";
import { SAMPLE_PRODUCTS } from "@/lib/services/products-data";
import { ProductCard } from "@/components/ProductCard";

export function JeepExperience() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Ambil 3 produk unggulan resmi (Single Source of Truth)
  const experienceProducts = SAMPLE_PRODUCTS.filter((p) => p.is_featured);

  return (
    <section className="py-14 md:py-20 bg-white relative font-sans border-b border-neutral-100">
      <div className="container-app">
        {/* Heading Section (Foto 1) */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0ea5e9] tracking-tight">
            Paket Jeep Experience
          </h2>
          <p className="mt-2.5 text-neutral-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Paling banyak diminati, paket tour paling hemat di Banyuwangi raya. Cek aja disini!
          </p>
        </div>

        {/* 3 Cards Grid — Menggunakan ProductCard Resmi Bersatu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {experienceProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Carousel indicator dots persis Foto 2 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => setActiveSlide(0)}
            className={`!p-0 !min-w-0 !border-0 w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
              activeSlide === 0 ? "bg-neutral-600" : "bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label="Slide 1"
          />
          <button
            type="button"
            onClick={() => setActiveSlide(1)}
            className={`!p-0 !min-w-0 !border-0 w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
              activeSlide === 1 ? "bg-neutral-600" : "bg-neutral-300 hover:bg-neutral-400"
            }`}
            aria-label="Slide 2"
          />
        </div>
      </div>
    </section>
  );
}
