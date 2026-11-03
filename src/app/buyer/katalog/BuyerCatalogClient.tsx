"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Map,
  X,
  Car,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/ProductCard";
import { BuyerDestinationMap } from "@/components/buyer/BuyerDestinationMap";
import { cn } from "@/components/ui";

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
  const [selectedSort, setSelectedSort] = useState<"popular" | "price_asc" | "price_desc">("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

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

    // Destination filter
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

    // Quick filter chips
    if (filterType === "bestseller") {
      result = result.filter((p) => p.is_best_seller);
    } else if (filterType === "4x4") {
      result = result.filter((p) => p.name.toLowerCase().includes("4x4") || p.name.toLowerCase().includes("trooper"));
    }

    // Sorting
    if (selectedSort === "price_asc") {
      result.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
    } else if (selectedSort === "price_desc") {
      result.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
    }

    return result;
  }, [initialProducts, searchQuery, selectedDestination, selectedSort, filterType]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDestination("");
    setSelectedSort("popular");
    setFilterType("all");
  };

  const hasActiveFilter = Boolean(searchQuery || selectedDestination || selectedSort !== "popular" || filterType !== "all");

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header Judul & Deskripsi — Persis Foto Homestay */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#263b46] dark:text-neutral-100 tracking-tight">
          Katalog Jeep Trooper
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#53636d] dark:text-neutral-400 max-w-3xl leading-relaxed">
          Temukan armada & paket jeep trooper 4x4 terbaik di Banyuwangi untuk liburan impian Anda. Cari, bandingkan spesifikasi, dan langsung booking.
        </p>
      </div>

      {/* 2. Bar Pencarian & Filter Horizontal — Persis Foto Homestay */}
      <div className="bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Kolom 1: Input Pencarian */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9da5] dark:text-neutral-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Cari nama jeep trooper, paket tour, fasilitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent rounded-xl text-xs sm:text-sm text-[#263b46] dark:text-neutral-100 placeholder:text-[#8e9da5] dark:placeholder:text-neutral-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

          {/* Kolom 2: Dropdown Destinasi / Kecamatan */}
          <div className="relative md:w-64">
            <MapPin
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9da5] dark:text-neutral-500 pointer-events-none"
            />
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-transparent rounded-xl text-xs sm:text-sm font-semibold text-[#263b46] dark:text-neutral-100 focus:outline-hidden cursor-pointer"
            >
              {DESTINATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Kolom 3: Tombol Filter Tambahan */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer shrink-0",
              showFilters || filterType !== "all" || selectedSort !== "popular"
                ? "bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] border-[#327691]/40"
                : "bg-white dark:bg-neutral-800 border-[#dce6eb] dark:border-neutral-700 text-[#53636d] dark:text-neutral-300 hover:bg-[#f6f9fa]"
            )}
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
          </button>

          {/* Kolom 4: Tombol Cari Utama */}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer shrink-0"
          >
            <span>Cari</span>
          </button>
        </div>

        {/* Panel Filter Lanjutan jika tombol Filter diklik */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-[#e4ebef] dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#8e9da5] dark:text-neutral-400">Kategori Cepat:</span>
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition",
                  filterType === "all"
                    ? "bg-[#327691] text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                )}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType("bestseller")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1",
                  filterType === "bestseller"
                    ? "bg-[#327691] text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                )}
              >
                <Sparkles size={12} />
                <span>Best Seller</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType("4x4")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1",
                  filterType === "4x4"
                    ? "bg-[#327691] text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                )}
              >
                <Car size={12} />
                <span>Jeep 4WD Prima</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[#8e9da5] dark:text-neutral-400">Urutkan:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-[#dce6eb] dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-neutral-700 dark:text-neutral-200 focus:outline-hidden cursor-pointer"
              >
                <option value="popular">Paling Populer</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bar Status Hasil & Tombol Sembunyikan/Tampilkan Peta — Persis Foto Homestay */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-bold text-[#53636d] dark:text-neutral-400">
            Menampilkan <strong className="text-[#263b46] dark:text-neutral-100">{filteredProducts.length}</strong> armada & paket Jeep Trooper
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

        {/* Tombol Sembunyikan / Tampilkan Peta (Persis tombol di kanan foto Homestay) */}
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d8e3e8] dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-[#f3f8fa] dark:hover:bg-neutral-800 text-xs font-bold text-[#327691] dark:text-[#8abbd0] shadow-2xs transition cursor-pointer"
        >
          <Map size={14} />
          <span>{showMap ? "Sembunyikan Peta" : "Tampilkan Peta"}</span>
        </button>
      </div>

      {/* 4. Bagian Peta Sebaran Banyuwangi (Collapsible seperti di foto) */}
      {showMap && (
        <BuyerDestinationMap
          selectedDestination={selectedDestination}
          onSelectDestination={(destKey) => {
            setSelectedDestination(destKey);
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* 5. Grid Katalog Kartu Armada / Tour Jeep Trooper */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] flex items-center justify-center mx-auto mb-3">
            <Car size={26} />
          </div>
          <h3 className="font-extrabold text-base text-[#263b46] dark:text-neutral-100">
            Tidak Ada Armada atau Paket yang Cocok
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau pilih destinasi lain untuk menemukan pilihan Jeep Trooper.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[#327691] text-white text-xs font-bold hover:bg-[#2c6881] transition cursor-pointer"
          >
            Tampilkan Semua Armada
          </button>
        </div>
      )}
    </div>
  );
}

