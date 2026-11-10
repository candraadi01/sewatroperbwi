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
import { NewsTicker } from "./NewsTicker";

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
    <section id="cari-trip" className="relative min-h-[calc(100dvh-56px)] md:min-h-[calc(100dvh-64px)] flex items-center pt-10 pb-8 sm:pt-14 sm:pb-12 md:pt-18 md:pb-16 font-sans border-b border-[#1f3039]">
      {/* Background Image: Foto Asli Jeep Trooper 4x4 Banyuwangi HD Jernih */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Image
          src="/images/landing/hero-trooper-baluran-hd.webp"
          alt="Sewa Jeep Trooper 4x4 Wisata Banyuwangi"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_38%] sm:object-[center_36%]"
        />

        {/* Overlay Gradien Sinematik Halus agar Foto Mobil & Alam Tetap Jernih & Terang */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/65" />
      </div>

      {/* Bar Informasi Terbaru — 100% Transparan Melayang di Atas Foto */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <NewsTicker />
      </div>

      {/* Konten Utama Hero: Judul & Form Pencarian */}
      <div className="container-app relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4">
        {/* Hero Title & Subtitle — Terpercaya, Profesional & Meyakinkan Pengunjung */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-white tracking-tight leading-[1.18] sm:leading-[1.16] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            {t("hero_title_1", "Sewa Jeep Trooper Banyuwangi")}{" "}
            <span className="text-[#facc15] drop-shadow-[0_2px_14px_rgba(250,204,21,0.55)]">
              {t("hero_title_2", "Resmi & Terpercaya")}
            </span>
          </h1>

          <p className="mt-2.5 sm:mt-3.5 text-xs sm:text-sm md:text-base text-white/95 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {t("hero_subtitle", "Penyedia resmi sewa armada Jeep Trooper 4x4 prima dengan driver lokal berpengalaman. Jaminan pasti berangkat, aman & nyaman tanpa biaya tersembunyi untuk trip Kawah Ijen, Baluran, Sukamade & De Djawatan.")}
          </p>
        </div>

        {/* Search Form — Ringkas & Nyaman di Mobile (Tanpa Menutupi Seluruh Mobil) */}
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.1fr_auto] gap-2 sm:gap-3 items-stretch">
              {/* Field 1: Kategori */}
              <div className="relative group bg-transparent border border-white/80 hover:border-white focus-within:border-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 transition">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <Compass size={14} className="text-white shrink-0" />
                  <label
                    htmlFor="hero-kategori"
                    className="text-[9.5px] sm:text-[10px] md:text-[11px] font-bold text-white tracking-wider uppercase cursor-pointer drop-shadow-md"
                  >
                    {t("search_kategori", "Kategori")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <select
                    id="hero-kategori"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer pr-6 appearance-none drop-shadow-sm"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value} className="bg-[#0f172a] text-white py-1">
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="absolute right-0 text-white/80 pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 2: Destinasi */}
              <div className="relative group bg-transparent border border-white/80 hover:border-white focus-within:border-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 transition">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <MapPin size={14} className="text-white shrink-0" />
                  <label
                    htmlFor="hero-destinasi"
                    className="text-[9.5px] sm:text-[10px] md:text-[11px] font-bold text-white tracking-wider uppercase cursor-pointer drop-shadow-md"
                  >
                    {t("search_destinasi", "Destinasi")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <select
                    id="hero-destinasi"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer pr-6 appearance-none drop-shadow-sm"
                    value={destinasi}
                    onChange={(e) => setDestinasi(e.target.value)}
                  >
                    {destinationOptions.map((d) => (
                      <option key={d.value} value={d.value} className="bg-[#0f172a] text-white py-1">
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="absolute right-0 text-white/80 pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 3: Jadwal Keberangkatan */}
              <div className="relative group bg-transparent border border-white/80 hover:border-white focus-within:border-white rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 transition">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar size={14} className="text-white shrink-0" />
                    <label className="text-[9.5px] sm:text-[10px] md:text-[11px] font-bold text-white tracking-wider uppercase cursor-pointer drop-shadow-md">
                      {t("search_jadwal", "Jadwal Trip (Ready)")}
                    </label>
                  </div>
                  {tanggalTrip && (
                    <span className="text-[9.5px] sm:text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 border border-emerald-400/50 px-1.5 py-0.5 rounded-full">
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
              <div className="flex items-center gap-2 pt-0.5 md:pt-0">
                {hasFilter && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset Filter"
                    className="h-10 sm:h-11 md:h-full px-3 text-white hover:text-white bg-transparent hover:bg-white/10 border border-white/80 rounded-lg sm:rounded-xl flex items-center justify-center transition cursor-pointer"
                    aria-label="Reset Filter"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}

                <button
                  type="submit"
                  className="group flex-1 md:flex-initial h-10 sm:h-11 md:h-full min-h-[42px] sm:min-h-[46px] px-6 sm:px-8 bg-[#0f172a] hover:bg-[#1e293b] active:bg-[#020617] active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-200 shadow-xl shadow-black/50 hover:shadow-black/70 flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap border border-white/25 hover:border-white/60 uppercase tracking-wider"
                >
                  <Search size={16} strokeWidth={2.8} className="text-white group-hover:scale-110 transition-transform duration-200" />
                  <span className="tracking-wider">{t("search_btn_paket", "Cari Paket")}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
