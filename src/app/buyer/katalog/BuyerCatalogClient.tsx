"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  MapPin,
  Map,
  X,
  Car,
  RotateCcw,
  CalendarDays,
  Users,
} from "lucide-react";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/ProductCard";
import { BuyerDestinationMap } from "@/components/buyer/BuyerDestinationMap";
import { cn } from "@/components/ui";
import styles from "@/components/landing/cinematic.module.css";

interface BuyerCatalogClientProps {
  initialProducts: Product[];
  initialQuery?: string;
  initialDestination?: string;
}

const DESTINATION_OPTIONS = [
  { label: "Semua Destinasi & Kecamatan", value: "" },
  { label: "Kawah Ijen (Kecamatan Licin)", value: "ijen" },
  { label: "Taman Nasional Baluran (Kecamatan Wongsorejo)", value: "baluran" },
  { label: "Hutan De Djawatan (Kecamatan Cluring)", value: "djawatan" },
  { label: "Pantai Sukamade (Kecamatan Pesanggaran)", value: "sukamade" },
  { label: "Taman Nasional Alas Purwo (Kecamatan Tegaldlimo)", value: "purwo" },
  { label: "Banyuwangi Kota & Bandara", value: "kota" },
];

export function BuyerCatalogClient({
  initialProducts,
  initialQuery = "",
  initialDestination = "",
}: BuyerCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPassengers, setSelectedPassengers] = useState<number | "">("");
  const [selectedSort, setSelectedSort] = useState<"popular" | "price_asc" | "price_desc">("popular");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#peta") {
      const timer = setTimeout(() => {
        setShowMap(true);
        const el = document.getElementById("peta");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, []);

  // Client-side instant filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const text = `${p.name} ${p.short_description || ""} ${p.route_name || ""} ${(p.destinations || []).join(" ")}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Destination filter (persis landing page)
    if (selectedDestination) {
      const d = selectedDestination.toLowerCase();
      result = result.filter((p) => {
        const text = `${p.name} ${p.route_name || ""} ${p.description || ""} ${(p.destinations || []).join(" ")}`.toLowerCase();
        if (d === "ijen") return text.includes("ijen");
        if (d === "baluran") return text.includes("baluran");
        if (d === "djawatan") return text.includes("djawatan");
        if (d === "sukamade") return text.includes("sukamade");
        if (d === "purwo") return text.includes("purwo");
        if (d === "kota") return text.includes("kota") || text.includes("bandara") || text.includes("drop");
        return text.includes(d);
      });
    }

    // Filter jumlah peserta per Jeep (persis landing page)
    if (selectedPassengers !== "") {
      const count = Number(selectedPassengers);
      result = result.filter((p) => (p.passenger_capacity || 6) >= count);
    }

    // Sorting
    if (selectedSort === "price_asc") {
      result.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    } else if (selectedSort === "price_desc") {
      result.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    }

    return result;
  }, [initialProducts, searchQuery, selectedDestination, selectedPassengers, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDestination("");
    setSelectedDate("");
    setSelectedPassengers("");
    setSelectedSort("popular");
  };

  const hasActiveFilter = Boolean(
    searchQuery ||
    selectedDestination ||
    selectedDate ||
    selectedPassengers !== "" ||
    selectedSort !== "popular"
  );

  return (
    <div className={cn(styles.landing, "!bg-transparent space-y-6 select-none font-sans")}>
      {/* 1. Header Judul & Deskripsi — Konsep Landing Page */}
      <div>
        <span className="inline-block px-3 py-1 bg-[#faefd9] text-[#8a510b] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Katalog Tour &amp; Sewa Jeep
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#192127] tracking-tight">
          Katalog Jeep Trooper
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#52606b] max-w-3xl leading-relaxed">
          Temukan armada &amp; paket jeep trooper 4x4 terbaik di Banyuwangi untuk liburan impian Anda. Cari, bandingkan spesifikasi, dan langsung booking.
        </p>
      </div>

      {/* 2. Bar Pencarian & Filter (Format Lengkap Persis Landing Page: Destinasi, Tanggal Sewa, Peserta, & Cari) */}
      <div className="bg-white dark:bg-neutral-900 border border-[#dbe0e4] dark:border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Field 1: Destinasi (Persis Landing Page) */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#dbe0e4] dark:border-neutral-700 bg-[#f8faf9] dark:bg-neutral-800/60 min-w-0">
            <MapPin size={20} className="text-[#8a510b] dark:text-[#f4bd42] shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-bold text-[#73848e] dark:text-neutral-400 uppercase tracking-wider mb-0.5">
                Destinasi
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#192127] dark:text-neutral-100 focus:outline-hidden cursor-pointer"
              >
                {DESTINATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field 2: Tanggal Sewa (Persis Landing Page) */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#dbe0e4] dark:border-neutral-700 bg-[#f8faf9] dark:bg-neutral-800/60 min-w-0">
            <CalendarDays size={20} className="text-[#8a510b] dark:text-[#f4bd42] shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-bold text-[#73848e] dark:text-neutral-400 uppercase tracking-wider mb-0.5">
                Tanggal Sewa
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#192127] dark:text-neutral-100 focus:outline-hidden cursor-pointer"
              />
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-neutral-400 hover:text-neutral-600 p-1"
                title="Hapus tanggal"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Field 3: Peserta per Jeep (Persis Landing Page) */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#dbe0e4] dark:border-neutral-700 bg-[#f8faf9] dark:bg-neutral-800/60 min-w-0">
            <Users size={20} className="text-[#8a510b] dark:text-[#f4bd42] shrink-0" />
            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-bold text-[#73848e] dark:text-neutral-400 uppercase tracking-wider mb-0.5">
                Peserta per Jeep
              </label>
              <select
                value={selectedPassengers}
                onChange={(e) => setSelectedPassengers(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#192127] dark:text-neutral-100 focus:outline-hidden cursor-pointer"
              >
                <option value="">Semua Jumlah Peserta</option>
                {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num} className="dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                    {num} Peserta (Max {num} Orang)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field 4: Cari Kata Kunci & Tombol Cari */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9da5] dark:text-neutral-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Cari armada..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2.5 rounded-xl border border-[#dbe0e4] dark:border-neutral-700 bg-[#f8faf9] dark:bg-neutral-800/60 text-xs sm:text-sm font-semibold text-[#192127] dark:text-neutral-100 placeholder:text-[#8e9da5] dark:placeholder:text-neutral-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#f4bd42] hover:bg-[#ffd276] text-[#151510] font-extrabold text-xs sm:text-sm shadow-xs transition cursor-pointer shrink-0"
            >
              <Search size={15} />
              <span>Cari</span>
            </button>
          </div>
        </div>

        {/* Baris Tambahan: Urutkan */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0f4f6] dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#52606b] dark:text-neutral-400">Urutkan:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as "popular" | "price_asc" | "price_desc")}
              className="px-2.5 py-1.5 rounded-lg border border-[#dbe0e4] dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold text-[#192127] dark:text-neutral-100 focus:outline-hidden cursor-pointer"
            >
              <option value="popular">Paling Populer</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Bar Status Hasil & Tombol Sembunyikan/Tampilkan Peta */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-bold text-[#52606b]">
            Menampilkan <strong className="text-[#8a510b]">{filteredProducts.length}</strong> armada &amp; paket Jeep Trooper
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline cursor-pointer ml-2"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Tombol Sembunyikan / Tampilkan Peta */}
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dbe0e4] bg-white hover:bg-[#faefd9] text-xs font-bold text-[#8a510b] shadow-2xs transition cursor-pointer"
        >
          <Map size={14} />
          <span>{showMap ? "Sembunyikan Peta" : "Tampilkan Peta"}</span>
        </button>
      </div>

      {/* 4. Bagian Peta Sebaran Banyuwangi (Collapsible) */}
      <div id="peta">
        {showMap && (
          <BuyerDestinationMap
            products={filteredProducts}
            selectedDestination={selectedDestination}
            onSelectDestination={(destKey) => {
              setSelectedDestination(destKey);
            }}
            onClose={() => setShowMap(false)}
          />
        )}
      </div>

      {/* 5. Grid Katalog Kartu Armada / Tour Jeep Trooper — Konsep Landing Page */}
      {filteredProducts.length > 0 ? (
        <div className={styles.contentGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              date={selectedDate || undefined}
              compact
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#dbe0e4] shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#faefd9] text-[#8a510b] flex items-center justify-center mx-auto mb-3">
            <Car size={26} />
          </div>
          <h3 className="font-extrabold text-base text-[#192127]">
            Tidak Ada Armada atau Paket yang Cocok
          </h3>
          <p className="text-xs text-[#52606b] mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau pilih destinasi lain untuk menemukan pilihan Jeep Trooper.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[#f4bd42] text-[#151510] text-xs font-extrabold hover:bg-[#ffd276] transition cursor-pointer"
          >
            Tampilkan Semua Armada
          </button>
        </div>
      )}
    </div>
  );
}

