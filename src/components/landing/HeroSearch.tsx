"use client";

import { useState, useEffect } from "react";
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
    <section id="cari-trip" className="relative bg-gradient-to-b from-[#f0f7fa] via-[#f7fbfc] to-white pt-10 pb-14 sm:pt-14 sm:pb-16 md:pt-18 md:pb-20 overflow-hidden font-sans border-b border-[#e4ebef]">
      {/* Subtle modern vector ambient glows (Pure CSS, NO background image) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-r from-[#327691]/12 via-[#8abbd0]/10 to-transparent blur-3xl rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 right-[-4%] w-[420px] h-[260px] bg-[#327691]/8 blur-3xl rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-app relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Eyebrow Badge */}
        <div className="flex justify-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#d3e7ef] text-[#2c6881] text-xs sm:text-[13px] font-bold shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#327691] animate-pulse" />
            <span>{t("hero_badge", "Sewa Jeep Trooper 4x4 Banyuwangi")}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle — High Contrast, Clean, Fresh */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-[#263b46] tracking-tight leading-[1.16]">
            {t("hero_title_1", "Jelajahi Banyuwangi")}{" "}
            <span className="bg-gradient-to-r from-[#327691] via-[#2c6881] to-[#1f4e61] bg-clip-text text-transparent">
              {t("hero_title_2", "Tanpa Batas")}
            </span>
          </h1>

          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm md:text-base text-[#53636d] max-w-2xl mx-auto font-medium leading-relaxed">
            {t("hero_subtitle", "Nikmati sensasi petualangan offroad Kawah Ijen, Baluran, Sukamade & De Djawatan bersama armada tangguh dan driver profesional terpercaya.")}
          </p>
        </div>

        {/* Search Card — Clean, Fresh, Modern Solid Card (NO background image) */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_12px_40px_-10px_rgba(38,59,70,0.1)] border border-[#e4ebef] p-4 sm:p-5 md:p-6 transition-all">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.1fr_auto] gap-3 sm:gap-3.5 md:gap-4 items-stretch">
              {/* Field 1: Kategori */}
              <div className="relative group bg-[#f7f9fa] hover:bg-[#edf3f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#327691]/30 border border-[#e4ebef] focus-within:border-[#327691] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition">
                <div className="flex items-center gap-2 mb-1">
                  <Compass size={15} className="text-[#327691] shrink-0" />
                  <label
                    htmlFor="hero-kategori"
                    className="text-[11px] font-bold text-[#53636d] tracking-wider uppercase cursor-pointer"
                  >
                    {t("search_kategori", "Kategori")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <select
                    id="hero-kategori"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#263b46] focus:outline-none cursor-pointer pr-6 appearance-none"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-0 text-[#8e9da5] pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 2: Destinasi */}
              <div className="relative group bg-[#f7f9fa] hover:bg-[#edf3f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#327691]/30 border border-[#e4ebef] focus-within:border-[#327691] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={15} className="text-[#327691] shrink-0" />
                  <label
                    htmlFor="hero-destinasi"
                    className="text-[11px] font-bold text-[#53636d] tracking-wider uppercase cursor-pointer"
                  >
                    {t("search_destinasi", "Destinasi")}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <select
                    id="hero-destinasi"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#263b46] focus:outline-none cursor-pointer pr-6 appearance-none"
                    value={destinasi}
                    onChange={(e) => setDestinasi(e.target.value)}
                  >
                    {destinationOptions.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-0 text-[#8e9da5] pointer-events-none"
                  />
                </div>
              </div>

              {/* Field 3: Jadwal Keberangkatan (Ready) */}
              <div className="relative group bg-[#f7f9fa] hover:bg-[#edf3f6] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#327691]/30 border border-[#e4ebef] focus-within:border-[#327691] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[#327691] shrink-0" />
                    <label className="text-[11px] font-bold text-[#53636d] tracking-wider uppercase cursor-pointer">
                      {t("search_jadwal", "Jadwal Trip (Ready)")}
                    </label>
                  </div>
                  {tanggalTrip && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
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
                    className="h-12 md:h-full px-3 text-[#53636d] hover:text-[#263b46] hover:bg-[#f4f9fb] border border-[#e4ebef] rounded-xl sm:rounded-2xl flex items-center justify-center transition cursor-pointer"
                    aria-label="Reset Filter"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 md:flex-initial h-12 md:h-full min-h-[50px] px-6 sm:px-8 bg-[#327691] hover:bg-[#2c6881] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all shadow-md shadow-[#327691]/25 flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Search size={18} strokeWidth={2.4} />
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
