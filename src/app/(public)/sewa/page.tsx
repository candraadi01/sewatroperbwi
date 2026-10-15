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
    <div className="container-app py-9 md:py-14">
      <p className="eyebrow">Katalog perjalanan</p>
      <h1 className="section-heading mt-3">Pilih Trooper untuk rencanamu.</h1>
      <p className="mt-4 max-w-2xl text-neutral-600">
        Bandingkan rute, durasi, dan fasilitas. Tarif akhir mengikuti tanggal
        dan pilihan penjemputan.
      </p>
      <form
        className="mt-8 grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end"
        action="/sewa"
      >
        <label className="admin-field">
          Cari rute atau layanan
          <input
            id="cari"
            name="q"
            type="search"
            placeholder="Ijen, Baluran, harian…"
            defaultValue={q}
            maxLength={100}
          />
        </label>
        <label className="admin-field">
          Jenis layanan
          <select name="service" defaultValue={service}>
            <option value="">Semua layanan</option>
            {Object.entries(serviceLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          Urutkan
          <select name="sort" defaultValue={sort}>
            <option value="popular">Pilihan rute</option>
            <option value="price_asc">Harga terendah</option>
            <option value="price_desc">Harga tertinggi</option>
            <option value="duration_asc">Durasi tersingkat</option>
          </select>
        </label>
        <button className="action-link">Tampilkan</button>
      </form>
      <div className="my-7 flex justify-between items-center text-sm text-neutral-500">
        <p>{products.length} layanan ditemukan</p>
        {(q || service) && (
          <Link href="/sewa" className="underline underline-offset-4">
            Hapus filter
          </Link>
        )}
      </div>
      {products.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="admin-panel py-14 text-center">
          <h2 className="text-xl font-semibold">
            Belum ada layanan yang sesuai.
          </h2>
          <p className="mt-3 text-neutral-600">
            Coba kata kunci lain atau tanyakan rencanamu kepada admin.
          </p>
          <Link href="/kontak" className="action-link-secondary mt-5">
            Hubungi admin
          </Link>
        </div>
      )}
    </div>
  );
}
