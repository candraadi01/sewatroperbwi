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
  const kategori =
    typeof params.kategori === "string"
      ? params.kategori
      : typeof params.category === "string"
        ? params.category
        : "";
  const destinasi =
    typeof params.destinasi === "string"
      ? params.destinasi
      : typeof params.destination === "string"
        ? params.destination
        : "";
  const durasi =
    typeof params.durasi === "string"
      ? params.durasi
      : typeof params.duration === "string"
        ? params.duration
        : "";
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
    categorySlug: kategori,
    destination: destinasi,
    duration: durasi,
    serviceType: service,
    sort: sort as "popular" | "price_asc" | "price_desc" | "duration_asc",
  });

  const hasActiveFilter = Boolean(q || kategori || destinasi || durasi || service || (sort && sort !== "popular"));

  return (
    <div className="bg-[#f7f8f9] min-h-screen py-10 md:py-16 font-sans">
      <div className="container-app">
        {/* Header Section */}
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-[#e9f3f7] text-[#327691] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Katalog Tour & Sewa Jeep
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#263b46] tracking-tight">
            Pilihan Paket Tour & Rental Jeep Trooper Banyuwangi
          </h1>
          <p className="mt-3 text-[#53636d] text-xs sm:text-sm md:text-base leading-relaxed">
            Temukan pilihan paket tour terlengkap mulai dari Kawah Ijen, Baluran, Sukamade, hingga De Djawatan dengan armada 4x4 prima dan driver lokal berpengalaman.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form
          className="mt-8 p-4 md:p-5 bg-white rounded-2xl border border-[#e4ebef] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          action="/sewa"
          method="GET"
        >
          <div>
            <label htmlFor="cari" className="block text-xs font-bold text-[#263b46] mb-1">
              Cari Kata Kunci
            </label>
            <input
              id="cari"
              name="q"
              type="search"
              placeholder="Ijen, Baluran, Sukamade…"
              defaultValue={q}
              maxLength={100}
              className="w-full text-xs px-3 py-2.5 bg-[#f4f9fb] border border-[#ccd8de] rounded-xl focus:outline-hidden focus:border-[#327691] focus:bg-white transition text-[#263b46]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263b46] mb-1">
              Kategori
            </label>
            <select
              name="kategori"
              defaultValue={kategori}
              className="w-full text-xs px-3 py-2.5 bg-[#f4f9fb] border border-[#ccd8de] rounded-xl focus:outline-hidden focus:border-[#327691] focus:bg-white transition cursor-pointer text-[#263b46]"
            >
              <option value="">Semua Kategori</option>
              <option value="jeep-experience">Paket Jeep Experience</option>
              <option value="jeep-wisata">Jeep Wisata Banyuwangi</option>
              <option value="harian-sopir">Sewa Harian + Sopir</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263b46] mb-1">
              Destinasi
            </label>
            <select
              name="destinasi"
              defaultValue={destinasi}
              className="w-full text-xs px-3 py-2.5 bg-[#f4f9fb] border border-[#ccd8de] rounded-xl focus:outline-hidden focus:border-[#327691] focus:bg-white transition cursor-pointer text-[#263b46]"
            >
              <option value="">Semua Destinasi</option>
              <option value="ijen">Kawah Ijen</option>
              <option value="baluran">Taman Nasional Baluran</option>
              <option value="djawatan">Hutan De Djawatan</option>
              <option value="sukamade">Pantai Sukamade</option>
              <option value="kawah-wurung">Kawah Wurung</option>
              <option value="alas-purwo">Alas Purwo</option>
              <option value="teluk-hijau">Teluk Hijau</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#263b46] mb-1">
              Durasi
            </label>
            <select
              name="durasi"
              defaultValue={durasi}
              className="w-full text-xs px-3 py-2.5 bg-[#f4f9fb] border border-[#ccd8de] rounded-xl focus:outline-hidden focus:border-[#327691] focus:bg-white transition cursor-pointer text-[#263b46]"
            >
              <option value="">Semua Durasi</option>
              <option value="half-day">Half Day (≤ 5 Jam)</option>
              <option value="1-hari">1 Hari (6–14 Jam)</option>
              <option value="2-day-1-night">2 Hari 1 Malam (2D1N)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#263b46] mb-1">
                Urutkan
              </label>
              <select
                name="sort"
                defaultValue={sort}
                className="w-full text-xs px-2.5 py-2.5 bg-[#f4f9fb] border border-[#ccd8de] rounded-xl focus:outline-hidden focus:border-[#327691] focus:bg-white transition cursor-pointer text-[#263b46]"
              >
                <option value="popular">Populer</option>
                <option value="price_asc">Termurah</option>
                <option value="price_desc">Termahal</option>
                <option value="duration_asc">Tersingkat</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer shrink-0 self-end"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Filter Count & Reset */}
        <div className="my-6 flex flex-wrap justify-between items-center gap-3 text-xs text-[#53636d]">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#263b46]">
              Ditemukan <span className="text-[#327691] font-bold">{products.length}</span> pilihan paket tour Jeep
            </p>
            {kategori && (
              <span className="px-2 py-0.5 bg-[#e9f3f7] text-[#327691] rounded-md font-medium text-[11px]">
                Kategori: {kategori}
              </span>
            )}
            {destinasi && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium text-[11px]">
                Destinasi: {destinasi}
              </span>
            )}
            {durasi && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-medium text-[11px]">
                Durasi: {durasi}
              </span>
            )}
          </div>
          {hasActiveFilter && (
            <Link href="/sewa" className="text-[#327691] hover:underline font-bold flex items-center gap-1">
              ✕ Hapus Filter
            </Link>
          )}
        </div>

        {/* Product Cards Grid */}
        {products.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#e4ebef]">
            <h2 className="text-lg font-bold text-[#263b46]">
              Belum ada paket yang sesuai dengan pencarian.
            </h2>
            <p className="mt-2 text-xs text-[#53636d]">
              Coba kata kunci lain atau hubungi admin untuk paket custom trip.
            </p>
            <Link
              href="/sewa"
              className="mt-4 inline-block px-4 py-2 bg-[#327691] text-white text-xs font-bold rounded-xl hover:bg-[#2c6881] transition"
            >
              Lihat Semua Paket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
