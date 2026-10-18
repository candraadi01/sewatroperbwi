"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, Folder } from "lucide-react";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  views: string;
  category: string;
  excerpt: string;
  image: string;
}

const landingArticles: ArticleItem[] = [
  {
    id: "menjangan-hingga-baluran",
    slug: "menjangan-hingga-baluran-trip-banyuwangi",
    title: "Menjangan hingga Baluran, Trip Banyuwangi yang Bikin Nagih",
    date: "20 September 2026",
    views: "110x",
    category: "Destinasi Wisata Banyuwangi",
    excerpt:
      "Kalau selama ini Banyuwangi hanya dikenal sebagai pintu masuk menuju Kawah Ijen, berarti Anda belum melihat seluruh keseruannya. Banyuwangi punya kombinasi destinasi yang sulit ditolak: laut sebening kaca, pulau tropis, snorkeling, hutan hijau, savana luas, sampai satwa liar di kawasan konservasi. Salah satu cara terbaik untuk menikmati semuanya adalah dengan sewa jeep Trooper 4x4...",
    image: "/images/landing/article-menjangan.jpg",
  },
  {
    id: "liburan-ke-alas-purwo",
    slug: "liburan-ke-alas-purwo-pilih-sewa-jeep-tanpa-ribet",
    title: "Liburan ke Alas Purwo, Pilih Sewa Jeep Banyuwangi Tanpa Ribet",
    date: "17 September 2026",
    views: "126x",
    category: "Sewa Jeep Banyuwangi",
    excerpt:
      "Liburan itu harusnya bikin kepala fresh, bukan malah stres mikirin jalan, kendaraan, atau takut nyasar. Kalau destinasi impianmu adalah Taman Nasional Alas Purwo, pilihan paling praktis adalah menggunakan sewa jeep Banyuwangi. Alas Purwo dikenal sebagai salah satu kawasan alam paling ikonik di ujung timur Pulau Jawa. Hutan tropis, savana, pantai eksotis, hingga satwa liar...",
    image: "/images/landing/article-alaspurwo.jpg",
  },
  {
    id: "perjalanan-menuju-air-terjun-jagir",
    slug: "seberapa-menantang-perjalanan-air-terjun-jagir",
    title: "Seberapa Menantang Perjalanan Menuju Air Terjun Jagir bagi Wisatawan Pemula?",
    date: "16 September 2026",
    views: "153x",
    category: "Destinasi Wisata Banyuwangi",
    excerpt:
      "Banyuwangi dikenal sebagai salah satu destinasi wisata di Jawa Timur yang memiliki beragam keindahan alam tersembunyi. Bagi Anda yang baru pertama kali berkunjung, Air Terjun Jagir sering kali menjadi tujuan favorit karena aksesnya yang relatif ramah namun tetap menyuguhkan pesona gemericik air jernih dan suasana asri pegunungan...",
    image: "/images/landing/article-jagir.jpg",
  },
];

export function ArticleSection() {
  return (
    <section className="py-14 md:py-20 bg-white relative font-sans border-b border-neutral-100">
      <div className="container-app">
        {/* Header Section (Foto 4) */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0ea5e9] tracking-tight">
            Artikel Wisata
          </h2>
          <p className="mt-2.5 text-neutral-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Baca juga informasi menarik, tips & trik seputar Traveling & Jeep Wisata Banyuwangi berikut ini!
          </p>
        </div>

        {/* 3 Horizontal Article Cards (Foto 4) */}
        <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
          {landingArticles.map((art) => (
            <div
              key={art.id}
              className="flex flex-col sm:flex-row gap-5 md:gap-7 items-start sm:items-center bg-white p-2 rounded-2xl hover:bg-slate-50/60 transition group"
            >
              {/* Thumbnail Image (Foto 4) */}
              <div className="relative w-full sm:w-64 md:w-72 aspect-[16/10] shrink-0 rounded-xl overflow-hidden shadow-xs border border-neutral-200">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 288px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content on Right (Foto 4) */}
              <div className="flex-1 space-y-2">
                <Link href={`/artikel/${art.slug}`}>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0ea5e9] hover:text-[#0284c7] transition-colors leading-snug">
                    {art.title}
                  </h3>
                </Link>

                {/* Metadata Row (Foto 4) */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-neutral-500 font-medium">
                  <span className="flex items-center gap-1.5 text-neutral-700">
                    <Calendar size={13} className="text-neutral-900" />
                    <span>{art.date}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-neutral-700">
                    <Eye size={13} className="text-neutral-900" />
                    <span>{art.views}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#0ea5e9]">
                    <Folder size={13} className="text-neutral-900" />
                    <span className="hover:underline">{art.category}</span>
                  </span>
                </div>

                {/* Excerpt Snippet with 'selengkapnya' (Foto 4) */}
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  {art.excerpt}{" "}
                  <Link
                    href={`/artikel/${art.slug}`}
                    className="text-[#0ea5e9] hover:underline font-semibold inline"
                  >
                    selengkapnya
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
