import styles from "@/components/landing/cinematic.module.css";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/services/catalog";
import { getDestinations } from "@/lib/services/destinations";
import { ProductCard, serviceLabels } from "@/components/ProductCard";
import { Calendar } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const date = typeof params.date === "string" ? params.date : "";
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
  const peserta = typeof params.peserta === "string" && /^[1-7]$/.test(params.peserta)
    ? Number(params.peserta)
    : 0;
  const service =
    typeof params.service === "string" && params.service in serviceLabels
      ? params.service
      : "";
  const sort =
    typeof params.sort === "string" &&
    ["price_asc", "price_desc", "duration_asc"].includes(params.sort)
      ? params.sort
      : "popular";

  const [matches, categories, destinations] = await Promise.all([getProducts({
    search: q,
    categorySlug: kategori,
    destination: destinasi,
    duration: durasi,
    serviceType: service,
    sort: sort as "popular" | "price_asc" | "price_desc" | "duration_asc",
  }), getCategories(), getDestinations()]);
  const products = peserta ? matches.filter((product) => product.passenger_capacity >= peserta) : matches;

  const hasActiveFilter = Boolean(q || kategori || destinasi || durasi || peserta || service || (sort && sort !== "popular"));
  const isSearchFiltered = Boolean(date || hasActiveFilter);

  // Periksa status ketersediaan tanggal jika buyer mencari dengan parameter tanggal
  const closedProductIds = new Set<string>();
  let isGlobalClosed = false;

  if (date && isSupabaseConfigured()) {
    try {
      const supabase = createPublicClient();
      const { data: blackouts } = await supabase
        .from("blackout_dates")
        .select("product_id")
        .eq("date", date);

      (blackouts || []).forEach((b) => {
        if (!b.product_id) isGlobalClosed = true;
        else closedProductIds.add(b.product_id);
      });
    } catch (e) {
      console.error("Gagal memeriksa ketersediaan tanggal:", e);
    }
  }

  return (
    <div className={`${styles.landing} ${styles.publicPageBackdrop} min-h-screen py-6 md:py-16 font-sans`}>
      <div className="container-app">
        {/* Header Section */}
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-[var(--gold-wash)] text-[color:var(--gold)] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Katalog Tour & Sewa Jeep
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[color:var(--ink)] tracking-tight">
            Pilihan Paket Tour & Rental Jeep Trooper Banyuwangi
          </h1>
          <p className="mt-3 text-[color:var(--mist)] text-xs sm:text-sm md:text-base leading-relaxed">
            Pilih paket sesuai rute, durasi, dan kapasitas perjalanan Anda.
          </p>

          {/* Banner Filter Tanggal Aktif */}
          {date && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#15342b] border border-emerald-700 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-300 shrink-0" />
                <span>
                  Tanggal keberangkatan: <strong>{new Date(date + "T00:00:00Z").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
                </span>
              </div>
              <Link
                href="/#cari-trip"
                className="text-xs font-extrabold underline text-emerald-300 hover:text-emerald-300 shrink-0"
              >
                Ganti Jadwal
              </Link>
            </div>
          )}
        </div>

        <details className="mt-5" open={!isSearchFiltered}>
          <summary className="min-h-11 cursor-pointer content-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 font-semibold text-[color:var(--ink)]">
            Filter paket
          </summary>
            <form
              className="mt-2 p-3 md:p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)] shadow-xs grid grid-cols-2 lg:grid-cols-5 gap-2.5 items-end"
              action="/sewa"
              method="GET"
            >
              {date && <input type="hidden" name="date" value={date} />}
              {peserta > 0 && <input type="hidden" name="peserta" value={peserta} />}
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <label htmlFor="cari" className="block text-xs font-bold text-[color:var(--ink)] mb-1">
                  Cari Kata Kunci
                </label>
                <input
                  id="cari"
                  name="q"
                  type="search"
                  placeholder="Ijen, Baluran, Sukamade…"
                  defaultValue={q}
                  maxLength={100}
                  className="w-full min-h-11 min-w-0 text-base sm:text-sm px-3 py-2.5 bg-[var(--raised)] border border-[var(--line)] rounded-xl focus:outline-hidden focus:border-[var(--gold)] focus:bg-[var(--surface)] transition text-[color:var(--ink)]"
                />
              </div>

              <div>
                <label htmlFor="tour-kategori" className="block text-xs font-bold text-[color:var(--ink)] mb-1">
                  Kategori
                </label>
                <select
                  id="tour-kategori"
                  name="kategori"
                  defaultValue={kategori}
                  className="w-full min-h-11 min-w-0 text-base sm:text-sm px-3 py-2.5 bg-[var(--raised)] border border-[var(--line)] rounded-xl focus:outline-hidden focus:border-[var(--gold)] focus:bg-[var(--surface)] transition cursor-pointer text-[color:var(--ink)]"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(({ id, slug, name }) => <option key={id} value={slug}>{name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="tour-destinasi" className="block text-xs font-bold text-[color:var(--ink)] mb-1">
                  Destinasi
                </label>
                <select
                  id="tour-destinasi"
                  name="destinasi"
                  defaultValue={destinasi}
                  className="w-full min-h-11 min-w-0 text-base sm:text-sm px-3 py-2.5 bg-[var(--raised)] border border-[var(--line)] rounded-xl focus:outline-hidden focus:border-[var(--gold)] focus:bg-[var(--surface)] transition cursor-pointer text-[color:var(--ink)]"
                >
                  <option value="">Semua Destinasi</option>
                  {destinations.map(({ id, queryParam, name }) => <option key={id} value={queryParam}>{name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="tour-durasi" className="block text-xs font-bold text-[color:var(--ink)] mb-1">
                  Durasi
                </label>
                <select
                  id="tour-durasi"
                  name="durasi"
                  defaultValue={durasi}
                  className="w-full min-h-11 min-w-0 text-base sm:text-sm px-3 py-2.5 bg-[var(--raised)] border border-[var(--line)] rounded-xl focus:outline-hidden focus:border-[var(--gold)] focus:bg-[var(--surface)] transition cursor-pointer text-[color:var(--ink)]"
                >
                  <option value="">Semua Durasi</option>
                  <option value="half-day">Half Day (≤ 5 Jam)</option>
                  <option value="1-hari">1 Hari (6–14 Jam)</option>
                  <option value="2-day-1-night">2 Hari 1 Malam (2D1N)</option>
                </select>
              </div>

              <div className="flex min-w-0 flex-col gap-2 lg:flex-col xl:flex-row">
                <div className="flex-1">
                  <label htmlFor="tour-urutkan" className="block text-xs font-bold text-[color:var(--ink)] mb-1">
                    Urutkan
                  </label>
                  <select
                    id="tour-urutkan"
                    name="sort"
                    defaultValue={sort}
                    className="w-full min-h-11 min-w-0 text-base sm:text-sm px-2.5 py-2.5 bg-[var(--raised)] border border-[var(--line)] rounded-xl focus:outline-hidden focus:border-[var(--gold)] focus:bg-[var(--surface)] transition cursor-pointer text-[color:var(--ink)]"
                  >
                    <option value="popular">Populer</option>
                    <option value="price_asc">Termurah</option>
                    <option value="price_desc">Termahal</option>
                    <option value="duration_asc">Tersingkat</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-[color:var(--on-gold)] text-xs font-extrabold rounded-xl transition shadow-xs cursor-pointer min-h-11 shrink-0 self-stretch min-[400px]:self-end lg:self-stretch xl:self-end"
                >
                  Cari
                </button>
              </div>
            </form>
        </details>

        {/* Filter Count & Reset */}
        <div className="my-6 flex flex-wrap justify-between items-center gap-3 text-xs text-[color:var(--mist)]">
          <div className="flex items-center gap-2 flex-wrap">
            {peserta > 0 && <span className="rounded-md bg-[var(--raised)] px-2 py-1">Kapasitas min. {peserta} peserta / Jeep</span>}
            <p className="font-semibold text-[color:var(--ink)]">
              Ditemukan <span className="text-[color:var(--gold)] font-bold">{products.length}</span> pilihan paket tour Jeep
            </p>
            {kategori && (
              <span className="px-2 py-0.5 bg-[var(--gold-wash)] text-[color:var(--gold)] rounded-md font-medium text-[11px]">
                Kategori: {kategori}
              </span>
            )}
            {destinasi && (
              <span className="px-2 py-0.5 bg-[#15342b] text-emerald-300 rounded-md font-medium text-[11px]">
                Destinasi: {destinasi}
              </span>
            )}
            {durasi && (
              <span className="px-2 py-0.5 bg-[#3a2e19] text-amber-200 rounded-md font-medium text-[11px]">
                Durasi: {durasi}
              </span>
            )}
            {q && (
              <span className="px-2 py-0.5 bg-[var(--raised)] text-[color:var(--ink)] rounded-md font-medium text-[11px]">
                Kata Kunci: &ldquo;{q}&rdquo;
              </span>
            )}
          </div>
          {isSearchFiltered && (
            <Link href="/sewa" className="text-[color:var(--gold)] hover:underline font-bold flex items-center gap-1">
              ✕ Tampilkan Semua Paket
            </Link>
          )}
        </div>

        {/* Product Cards Grid */}
        {products.length ? (
          <div className={styles.contentGrid}>
            {products.map((p) => {
              const isClosed = isGlobalClosed || closedProductIds.has(p.id);
              return <ProductCard compact key={p.id} product={p} date={date} isClosed={isClosed} />;
            })}
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-2xl p-12 text-center border border-[var(--line)]">
            <h2 className="text-lg font-bold text-[color:var(--ink)]">
              Belum ada paket yang sesuai dengan pencarian.
            </h2>
            <p className="mt-2 text-xs text-[color:var(--mist)]">
              Coba kata kunci lain atau hubungi admin untuk paket custom trip.
            </p>
            <Link
              href="/sewa"
              className="mt-4 inline-block px-4 py-2 bg-[var(--gold)] text-[color:var(--on-gold)] text-xs font-bold rounded-xl hover:bg-[var(--gold-hover)] transition"
            >
              Lihat Semua Paket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
