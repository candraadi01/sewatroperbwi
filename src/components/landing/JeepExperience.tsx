"use client";

import { useState, useRef } from "react";
import { SAMPLE_PRODUCTS } from "@/lib/services/products-data";
import { ProductCard } from "@/components/ProductCard";

export function JeepExperience() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Group produk ke dalam 2 slide (masing-masing 3 produk unggulan)
  const slides = [
    SAMPLE_PRODUCTS.slice(0, 3), // Slide 1: Sukamade, Baluran + Fotografer, De Djawatan
    SAMPLE_PRODUCTS.slice(3, 6), // Slide 2: Kawah Ijen + Wurung, Kawah Ijen + Baluran, De Djawatan + Sukamade
  ];

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -40 && activeSlide < slides.length - 1) {
      setActiveSlide((prev) => prev + 1);
    } else if (deltaX > 40 && activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
    touchStartX.current = null;
  }

  return (
    <section className="py-14 md:py-20 bg-white relative font-sans border-b border-[#e4ebef]">
      <div className="container-app">
        {/* Heading Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#263b46] tracking-tight">
            Paket Jeep Experience
          </h2>
          <p className="mt-2.5 text-[#53636d] text-xs sm:text-sm md:text-base leading-relaxed">
            Paling banyak diminati, paket tour paling hemat di Banyuwangi raya. Cek aja disini!
          </p>
        </div>

        {/* Carousel Slider dengan Transisi Mulus & Support Swipe Touch */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((group, sIdx) => (
              <div
                key={sIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7"
              >
                {group.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicator: Titik Lingkaran Kecil & Rapi Sesuai Permintaan */}
        <div className="flex justify-center items-center gap-2.5 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`carousel-dot !min-h-0 !min-w-0 !p-0 !border-0 w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                activeSlide === idx
                  ? "bg-[#327691] scale-125 shadow-xs ring-2 ring-[#327691]/30"
                  : "bg-[#ccd8de] hover:bg-[#697780]"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
