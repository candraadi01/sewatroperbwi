"use client";

import { useState } from "react";
import { Star, MessageSquare, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Review {
  id: number;
  name: string;
  city: string;
  ratingText: string;
  stars: number;
  content: string;
}

const reviewsData: Review[] = [
  {
    id: 1,
    name: "Anis Mulan",
    city: "Yogyakarta",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Pelayanan persewaan jeep di Banyuwangi sangat memuaskan. Admin ramah dan responsif saat memberikan informasi maupun membantu proses pemesanan. Driver jeep berpengalaman, tepat waktu, serta mengutamakan keselamatan dan kenyamanan selama perjalanan. Kondisi jeep bersih, terawat, dan nyaman digunakan untuk wisata. Perjalanan terasa menyenangkan karena driver juga membantu menjelaskan lokasi wisata dan spot foto terbaik. Sangat direkomendasikan bagi wisatawan yang ingin menikmati perjalanan di Banyuwangi dengan aman dan nyaman.",
  },
  {
    id: 2,
    name: "Deki Firmansyah",
    city: "Jakarta",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Pelayanan sewa jeep di Banyuwangi ini benar-benar recommended! Driver ramah, jeep bersih dan nyaman dipakai keliling wisata. Perjalanan ke Baluran dan Kawah Ijen jadi makin seru karena drivernya juga sekalian jadi guide yang informatif. Tepat waktu, harga sesuai, dan dokumentasi fotonya keren banget. Pokoknya kalau liburan ke Banyuwangi wajib pakai jasa ini lagi!",
  },
  {
    id: 3,
    name: "Rina Kusuma Dewi",
    city: "Surabaya",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Pengalaman liburan keluarga yang tak terlupakan naik Jeep Trooper ke Pantai Sukamade dan Hutan De Djawatan. Driver sangat sabar dan mengutamakan keselamatan saat melintasi medan offroad sungai. Anak-anak sangat gembira, unit bersih dan terawat dengan sangat prima!",
  },
  {
    id: 4,
    name: "Aditya Pratama",
    city: "Bandung",
    ratingText: "RATING 5/5",
    stars: 5,
    content:
      "Sewa jeep untuk sunrise Kawah Wurung dan Kawah Ijen luar biasa puas! Penjemputan tepat waktu dini hari, perlengkapan senter dan masker gas bersih. Driver tahu titik spot foto terbaik yang jarang dikunjungi orang lain. Pasti akan sewa lagi di sini!",
  },
];

import type { TestimonialItem } from "@/lib/services/testimonials";

export function Testimonials({ items }: { items?: TestimonialItem[] }) {
  const reviews = items && items.length > 0 ? items : reviewsData;
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [modalSubmitOpen, setModalSubmitOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const activeReview = reviews[activeReviewIndex] || reviews[0] || reviewsData[0];

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX < -40 && activeReviewIndex < reviews.length - 1) {
      setActiveReviewIndex((prev) => prev + 1);
    } else if (deltaX > 40 && activeReviewIndex > 0) {
      setActiveReviewIndex((prev) => prev - 1);
    }
    setTouchStartX(null);
  }

  return (
    <section id="testimonial" className="py-12 md:py-16 bg-white relative font-sans border-b border-[#e4ebef]">
      <div className="container-app">
        {/* Layout 2 Kolom Bersih */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Sisi Kiri: Judul, Deskripsi & Tombol Aksi */}
          <div className="lg:col-span-5 space-y-3.5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#263b46] tracking-tight leading-tight">
              Review Pelanggan Kami
            </h2>

            <p className="text-[#53636d] text-xs sm:text-sm leading-relaxed">
              Bagaimana pengalaman & pendapat mereka yang telah menjadi pelanggan dan senantiasa menggunakan layanan Jeep tour dari kami? Biarlah pelanggan kami yang berbicara & berbagi cerita dengan Anda.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Tombol Lihat Semua: Ocean Teal Palette */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("review-content-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-stretch rounded-lg overflow-hidden shadow-xs hover:opacity-95 transition cursor-pointer active:scale-95"
              >
                <span className="bg-[#254958] text-white px-3 py-2 flex items-center justify-center">
                  <Quote size={15} className="fill-white" />
                </span>
                <span className="bg-[#327691] text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center">
                  Lihat Semua
                </span>
              </button>

              {/* Tombol Submit Review: Ocean Teal Palette */}
              <button
                type="button"
                onClick={() => setModalSubmitOpen(true)}
                className="inline-flex items-stretch rounded-lg overflow-hidden shadow-xs hover:opacity-95 transition cursor-pointer active:scale-95"
              >
                <span className="bg-[#254958] text-white px-3 py-2 flex items-center justify-center">
                  <MessageSquare size={15} className="fill-white" />
                </span>
                <span className="bg-[#327691] text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center">
                  Submit
                </span>
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Konten Review Rapi & Bersih */}
          <div
            id="review-content-section"
            className="lg:col-span-7 space-y-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header Profil Reviewer: Avatar, Nama, Kota, Bintang */}
            <div className="flex items-start gap-4 transition-all duration-300">
              {/* Avatar Motif Bulat */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden shrink-0 border border-[#e4ebef] bg-[#263b46] flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="#1f3039" />
                  <circle cx="50" cy="50" r="43" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M26 50 C26 36, 40 30, 50 30 C64 30, 74 40, 74 50 C74 62, 60 70, 50 70 C38 70, 32 60, 32 50 C32 42, 42 38, 50 38 C58 38, 64 44, 64 50 C64 56, 56 60, 50 60 C44 60, 42 56, 42 50" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="4" fill="#ffffff" />
                </svg>
              </div>

              {/* Nama, Kota, Rating */}
              <div className="pt-0.5">
                <h3 className="text-base sm:text-lg font-bold text-[#327691] leading-tight">
                  {activeReview.name}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#263b46] tracking-wide mt-0.5">
                  {activeReview.city}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex items-center text-amber-500">
                    {[...Array(activeReview.stars)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10.5px] font-bold text-[#697780] tracking-wider uppercase">
                    {activeReview.ratingText}
                  </span>
                </div>
              </div>
            </div>

            {/* Isi Review Teks */}
            <p className="text-xs sm:text-sm text-[#53636d] leading-relaxed font-normal pt-1 min-h-[90px]">
              {activeReview.content}
            </p>

            {/* Pagination Dots Berpusat di Tengah: Lingkaran Kecil & Rapi Sesuai Permintaan */}
            <div className="flex items-center justify-center gap-2.5 pt-4">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveReviewIndex(idx)}
                  className={`carousel-dot !min-h-0 !min-w-0 !p-0 !border-0 w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                    activeReviewIndex === idx
                      ? "bg-[#327691] scale-125 shadow-xs ring-2 ring-[#327691]/30"
                      : "bg-[#ccd8de] hover:bg-[#697780]"
                  }`}
                  aria-label={`Review ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Submit Modal */}
      {modalSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#e4ebef] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base sm:text-lg font-bold text-[#263b46] mb-1">
              Kirim Review Anda
            </h3>
            <p className="text-xs text-[#53636d] mb-4">
              Bagikan pengalaman berkesan Anda selama menjelajahi Banyuwangi bersama kami.
            </p>

            {submitSuccess ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-[#263b46]">Terima Kasih!</h4>
                <p className="text-xs text-[#53636d]">
                  Review Anda berhasil dikirim dan akan segera diverifikasi oleh tim kami.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModalSubmitOpen(false);
                    setSubmitSuccess(false);
                  }}
                  className="mt-4 px-4 py-2 bg-[#327691] text-white rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitSuccess(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#263b46] mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="w-full h-10 px-3 text-xs sm:text-sm border border-[#ccd8de] rounded-xl focus:outline-none focus:border-[#327691] bg-white text-[#263b46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263b46] mb-1">
                    Kota Asal
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Surabaya"
                    className="w-full h-10 px-3 text-xs sm:text-sm border border-[#ccd8de] rounded-xl focus:outline-none focus:border-[#327691] bg-white text-[#263b46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263b46] mb-1">
                    Review / Pengalaman Anda
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ceritakan pengalaman Anda naik Jeep Trooper di Banyuwangi..."
                    className="w-full p-3 text-xs sm:text-sm border border-[#ccd8de] rounded-xl focus:outline-none focus:border-[#327691] bg-white text-[#263b46]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalSubmitOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#53636d] hover:bg-[#f4f9fb] rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-[#327691] hover:bg-[#2c6881] text-white rounded-xl transition shadow-xs"
                  >
                    Kirim Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
