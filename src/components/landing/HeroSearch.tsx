"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";

type OptionItem =
  | { value: string; labelKey: "search_all_destinations" | "search_all_durations"; label?: never }
  | { value: string; label: string; labelKey?: never };

const destinationOptions: OptionItem[] = [
  { value: "", labelKey: "search_all_destinations" },
  { value: "kawah-ijen", label: "Kawah Ijen" },
  { value: "taman-nasional-baluran", label: "Taman Nasional Baluran" },
  { value: "djawatan", label: "Djawatan" },
  { value: "pantai-sukamade", label: "Pantai Sukamade" },
  { value: "kawah-wurung-bondowoso", label: "Kawah Wurung Bondowoso" },
  { value: "alas-purwo", label: "Alas Purwo" },
  { value: "explore-banyuwangi", label: "Explore Banyuwangi" },
];

const durationOptions: OptionItem[] = [
  { value: "", labelKey: "search_all_durations" },
  { value: "1-hari", label: "1 Hari" },
  { value: "2-day-1-night", label: "2 Day 1 Night" },
  { value: "3-day-2-night", label: "3 Day 2 Night" },
];

export function HeroSearch() {
  const router = useRouter();
  const { t } = useLanguage();
  const [kategori, setKategori] = useState("");
  const [destinasi, setDestinasi] = useState("");
  const [durasi, setDurasi] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (kategori) params.set("kategori", kategori);
    if (destinasi) params.set("destinasi", destinasi);
    if (durasi) params.set("durasi", durasi);
    router.push(`/sewa${params.toString() ? "?" + params.toString() : ""}`);
  }

  return (
    <section className="relative min-h-[580px] md:min-h-[640px] lg:min-h-[680px] flex flex-col justify-between items-center overflow-hidden font-sans">
      {/* Background Image: Lanskap Petualangan Eksotis Trooper 4x4 di Pegunungan Banyuwangi */}
      <Image
        src="/images/landing/hero-adventure-trooper.jpg"
        alt="Jeep Trooper Wisata Banyuwangi di alam pegunungan"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_35%] md:object-[center_30%]"
        style={{ zIndex: 0 }}
      />
      {/* Overlay gradien halus & seimbang agar pemandangan alam dan kendaraan tetap terang & tembus pandang */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10 z-[1]" />

      {/* Teks Hero Utama di Atas: Diturunkan sedikit agar berjarak pas dari navbar/ticker */}
      <div className="relative z-10 w-full max-w-[960px] mx-auto px-3 sm:px-4 pt-10 sm:pt-13 md:pt-16 text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[48px] font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
          Jelajahi Banyuwangi <span className="text-[#38bdf8]">Tanpa Batas</span>
        </h1>

        <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-100 max-w-xl mx-auto font-normal leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
          Nikmati sensasi wisata Kawah Ijen, Baluran, Sukamade & Djawatan bersama armada tangguh dan driver profesional terpercaya.
        </p>
      </div>

      {/* Bagian Bawah: Search Pill & Card Transparan Dinaikkan Sedikit Lebih Atas */}
      <div className="relative z-10 w-full max-w-[960px] mx-auto px-3 sm:px-4 pb-22 sm:pb-26 md:pb-30 lg:pb-34">
        {/* Search Title (Pill Floating) */}
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 sm:px-5 sm:py-2 text-white font-bold text-xs sm:text-sm border border-white/30 shadow-lg">
              <Search size={16} className="text-[#38bdf8]" />
              <span>{t("search_heading")}</span>
            </h2>
          </div>

          {/* Search Form Card — Benar-Benar Transparan Tembus Pandang (Frosted Glassmorphism Luminous) */}
          <form
            onSubmit={handleSearch}
            className="bg-gradient-to-b from-white/25 to-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/40"
          >
            {/* Labels Desktop */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-2">
              <span className="text-xs font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                {t("search_kategori")}
              </span>
              <span className="text-xs font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                {t("search_destinasi")}
              </span>
              <span className="text-xs font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                {t("search_durasi")}
              </span>
              <span className="w-28"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2.5 sm:gap-3 items-end">
              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 md:hidden drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {t("search_kategori")}
                </label>
                <select
                  className="w-full h-11 px-3 text-sm font-semibold border border-white/40 rounded-xl bg-white/90 hover:bg-white text-neutral-900 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/40 shadow-sm transition cursor-pointer"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                >
                  <option value="">{t("search_all_categories")}</option>
                  <option value="jeep-dokumentasi-premium">Jeep + Dokumentasi Premium</option>
                  <option value="private-trip-banyuwangi">Private Trip Banyuwangi</option>
                </select>
              </div>

              {/* Destinasi */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 md:hidden drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {t("search_destinasi")}
                </label>
                <select
                  className="w-full h-11 px-3 text-sm font-semibold border border-white/40 rounded-xl bg-white/90 hover:bg-white text-neutral-900 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/40 shadow-sm transition cursor-pointer"
                  value={destinasi}
                  onChange={(e) => setDestinasi(e.target.value)}
                >
                  {destinationOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.labelKey ? t(d.labelKey) : d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Durasi */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5 md:hidden drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {t("search_durasi")}
                </label>
                <select
                  className="w-full h-11 px-3 text-sm font-semibold border border-white/40 rounded-xl bg-white/90 hover:bg-white text-neutral-900 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/40 shadow-sm transition cursor-pointer"
                  value={durasi}
                  onChange={(e) => setDurasi(e.target.value)}
                >
                  {durationOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.labelKey ? t(d.labelKey) : d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons — Mobile Friendly Layout */}
              <div className="grid grid-cols-[48px_1fr] md:flex md:items-center gap-2 pt-1 md:pt-0">
                <button
                  type="submit"
                  className="h-11 w-12 bg-[#ff2357] hover:bg-[#e11d48] active:scale-95 text-white rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer shrink-0"
                  aria-label="Cari"
                >
                  <Search size={19} strokeWidth={2.4} />
                </button>
                <button
                  type="submit"
                  className="h-11 px-5 md:px-6 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#0ea5e9]/25 flex items-center justify-center cursor-pointer whitespace-nowrap"
                >
                  {t("search_btn")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
  );
}
