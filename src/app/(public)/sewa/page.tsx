import Link from "next/link";
import { getProducts } from "@/lib/services/catalog";
import { ProductCard, serviceLabels } from "@/components/ProductCard";

export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const service =
    typeof params.service === "string" && params.service in serviceLabels
      ? params.service
      : "";
  const sort =
    typeof params.sort === "string" &&
    ["price_asc", "price_desc", "duration_asc"].includes(params.sort)
      ? params.sort
      : "popular";

  const products = await getProducts({
    search: q,
    serviceType: service,
    sort: sort as "popular" | "price_asc" | "price_desc" | "duration_asc",
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 font-sans">
      <div className="container-app">
        {/* Header Section */}
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-[#0ea5e9]/10 text-[#0284c7] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Katalog Tour & Sewa Jeep
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
            Pilihan Paket Tour & Rental Jeep Trooper Banyuwangi
          </h1>
          <p className="mt-3 text-neutral-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Temukan pilihan paket tour terlengkap mulai dari Kawah Ijen, Baluran, Sukamade, hingga De Djawatan dengan armada 4x4 prima dan driver lokal berpengalaman.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form
          className="mt-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end"
          action="/sewa"
        >
          <div>
            <label htmlFor="cari" className="block text-xs font-bold text-neutral-700 mb-1">
              Cari Rute / Destinasi
            </label>
            <input
              id="cari"
              name="q"
              type="search"
              placeholder="Ijen, Baluran, Sukamade, Djawatan…"
              defaultValue={q}
              maxLength={100}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0284c7] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Kategori Layanan
            </label>
            <select
              name="service"
              defaultValue={service}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0284c7] focus:bg-white transition"
            >
              <option value="">Semua Layanan</option>
              {Object.entries(serviceLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Urutkan Harga
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0284c7] focus:bg-white transition"
            >
              <option value="popular">Rute Populer</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="duration_asc">Durasi Tersingkat</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer"
          >
            Tampilkan
          </button>
        </form>

        {/* Filter Count & Reset */}
        <div className="my-6 flex justify-between items-center text-xs text-neutral-500">
          <p className="font-semibold text-neutral-700">
            Ditemukan <span className="text-[#0284c7] font-bold">{products.length}</span> pilihan paket tour Jeep
          </p>
          {(q || service) && (
            <Link href="/sewa" className="text-[#ff2357] hover:underline font-bold">
              ✕ Hapus Filter
            </Link>
          )}
        </div>

        {/* Product Cards Grid — Menggunakan ProductCard Kompak Bersatu */}
        {products.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <h2 className="text-lg font-bold text-neutral-900">
              Belum ada paket yang sesuai dengan pencarian.
            </h2>
            <p className="mt-2 text-xs text-neutral-500">
              Coba kata kunci lain atau hubungi admin untuk paket custom trip.
            </p>
            <Link
              href="/sewa"
              className="mt-4 inline-block px-4 py-2 bg-[#0284c7] text-white text-xs font-bold rounded-xl"
            >
              Lihat Semua Paket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
