"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Compass,
  Calendar,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { DateScheduleItem } from "@/lib/services/schedule";
import { HeroDatePicker } from "./HeroDatePicker";

type OptionItem = {
  value: string;
  label: string;
};

const categoryOptions: OptionItem[] = [
  { value: "", label: "Semua Kategori" },
  { value: "jeep-experience", label: "Paket Jeep Experience" },
  { value: "jeep-wisata", label: "Jeep Wisata Banyuwangi" },
  { value: "harian-sopir", label: "Sewa Harian + Sopir" },
];

const destinationOptions: OptionItem[] = [
  { value: "", label: "Semua Destinasi" },
  { value: "ijen", label: "Kawah Ijen" },
  { value: "baluran", label: "Taman Nasional Baluran" },
  { value: "djawatan", label: "Hutan De Djawatan" },
  { value: "sukamade", label: "Pantai Sukamade" },
  { value: "kawah-wurung", label: "Kawah Wurung" },
  { value: "alas-purwo", label: "Alas Purwo" },
  { value: "teluk-hijau", label: "Teluk Hijau" },
];

export function HeroSearch() {
  const router = useRouter();
  const { t } = useLanguage();
  const [kategori, setKategori] = useState("");
  const [destinasi, setDestinasi] = useState("");
  const [tanggalTrip, setTanggalTrip] = useState("");
  const [schedules, setSchedules] = useState<DateScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Ambil data jadwal ketersediaan real-time dari API
  useEffect(() => {
    async function loadSchedules() {
      try {
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const future = new Date(today);
        future.setDate(future.getDate() + 35);
        const end = future.toISOString().slice(0, 10);

        const res = await fetch(`/api/schedule/availability?start=${start}&end=${end}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSchedules(json.data);
        }
      } catch (e) {
        console.error("Gagal memuat ketersediaan jadwal:", e);
      } finally {
        setLoadingSchedule(false);
      }
    }
    loadSchedules();
  }, []);

  const hasFilter = Boolean(kategori || destinasi || tanggalTrip);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (kategori) params.set("kategori", kategori);
    if (destinasi) params.set("destinasi", destinasi);
    if (tanggalTrip) params.set("date", tanggalTrip);
    router.push(`/sewa${params.toString() ? "?" + params.toString() : ""}`);
  }

  function handleReset() {
    setKategori("");
    setDestinasi("");
    setTanggalTrip("");
  }

  return (
    <section id="cari-trip" className="relative min-h-[560px] md:min-h-[600px] lg:min-h-[640px] flex items-center pt-12 pb-20 sm:pt-14 sm:pb-24 md:pt-16 md:pb-28 font-sans border-b border-[#1f3039]">
      {/* Background Image: Foto Asli Jeep Trooper Kuning di Alam Banyuwangi */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Image
          src="/images/landing/hero-trooper-yellow.webp"
          alt="Sewa Jeep Trooper 4x4 Wisata Banyuwangi"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_55%] md:object-[center_50%]"
        />

        {/* Overlay Gradien Sinematik untuk Menjamin Keterbacaan & Menonjolkan Mobil */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75" />
      </div>

      <div className="container-app relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Eyebrow Badge */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-[#f1f5f9] text-xs sm:text-[13px] font-bold shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-[#fbbf24] animate-pulse" />
            <span>{t("hero_badge", "Sewa Jeep Trooper 4x4 Banyuwangi")}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle — Kontras Kuat & Aksen Kuning Serasi dengan Mobil */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-white tracking-tight leading-[1.16] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
            {t("hero_title_1", "Jelajahi Banyuwangi")}{" "}
            <span className="text-[#fbbf24] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              {t("hero_title_2", "Tanpa Batas")}
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-100 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            {t("hero_subtitle", "Nikmati sensasi petualangan offroad Kawah Ijen, Baluran, Sukamade & De Djawatan bersama armada tangguh dan driver profesional terpercaya.")}
          </p>
        </div>

        {/* Search Card — Transparan Menyatu dengan Background (Frosted Glassmorphism Luminous) */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/20 p-3.5 sm:p-4 md:p-5 transition-all">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.1fr_auto] gap-3 sm:gap-3.5 md:gap-4 items-stretch">
              {/* Field 1: Kategori */}
              <div className="relative group bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-white/20 focus-within:border-[#38bdf8] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition backdrop-blur-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Compass size={15} className="text-[#38bdf8] shrink-0" />
                  <label
                    htmlFor="hero-kategori"
                    className="text-[10px] sm:text-[11px] font-bold text-white/80 tracking-wider uppercase cursor-pointer"
                  >
                    {t("search_kategori", "Kategori")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <select
                    id="hero-kategori"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer pr-6 appearance-none"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value} className="bg-[#1e293b] text-white py-1">
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-0 text-white/60 pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 2: Destinasi */}
              <div className="relative group bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-white/20 focus-within:border-[#38bdf8] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition backdrop-blur-xs">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={15} className="text-[#38bdf8] shrink-0" />
                  <label
                    htmlFor="hero-destinasi"
                    className="text-[10px] sm:text-[11px] font-bold text-white/80 tracking-wider uppercase cursor-pointer"
                  >
                    {t("search_destinasi", "Destinasi")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <select
                    id="hero-destinasi"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer pr-6 appearance-none"
                    value={destinasi}
                    onChange={(e) => setDestinasi(e.target.value)}
                  >
                    {destinationOptions.map((d) => (
                      <option key={d.value} value={d.value} className="bg-[#1e293b] text-white py-1">
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-0 text-white/60 pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 3: Jadwal Keberangkatan (Ready) */}
              <div className="relative group bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-white/20 focus-within:border-[#38bdf8] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition backdrop-blur-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[#38bdf8] shrink-0" />
                    <label className="text-[10px] sm:text-[11px] font-bold text-white/80 tracking-wider uppercase cursor-pointer">
                      {t("search_jadwal", "Jadwal Trip (Ready)")}
                    </label>
                  </div>
                  {tanggalTrip && (
                    <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  )}
                </div>
                <div className="relative flex items-center pt-0.5">
                  <HeroDatePicker
                    value={tanggalTrip}
                    onChange={setTanggalTrip}
                    schedules={schedules}
                    loading={loadingSchedule}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 md:pt-0">
                {hasFilter && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset Filter"
                    className="h-11 md:h-full px-3 text-white/80 hover:text-white hover:bg-white/20 border border-white/25 rounded-xl sm:rounded-2xl flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                    aria-label="Reset Filter"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 md:flex-initial h-11 md:h-full min-h-[46px] px-6 sm:px-8 bg-[#327691] hover:bg-[#255b70] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-[#327691]/40 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap border border-white/25"
                >
                  <Search size={17} strokeWidth={2.4} />
                  <span>{t("search_btn_paket", "Cari Paket")}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
