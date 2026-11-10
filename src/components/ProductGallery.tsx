"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const displayImages =
    images.length > 0
      ? images
      : ["/images/landing/hero-adventure-trooper.jpg"];
  const currentImage = displayImages[activeIdx] || displayImages[0];

  return (
    <div className="space-y-3">
      {/* Gambar Utama HD */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md">
        <Image
          src={currentImage}
          alt={`${productName} - Foto ${activeIdx + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Thumbnail Galeri Armada & Destinasi */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {displayImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${
                activeIdx === i
                  ? "border-[#327691] ring-2 ring-[#327691]/30 scale-[1.02]"
                  : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

