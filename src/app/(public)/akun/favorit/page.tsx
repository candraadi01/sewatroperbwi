import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getProducts } from "@/lib/services/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Compass, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Paket Wisata Favorit | Sewa Trooper Banyuwangi",
  description: "Daftar paket sewa Jeep Trooper dan tour wisata Banyuwangi yang Anda sukai.",
};

export default async function FavoritPage() {
  await requireBuyer("/akun/favorit");
  const allProducts = await getProducts();
  // Untuk demo awal, tampilkan produk unggulan sebagai rekomendasi favorit jika wishlist kosong
  const favoriteProducts = allProducts.filter((p) => p.is_best_seller || p.is_featured).slice(0, 3);

  return (
    <div className="container-app py-10 md:py-14 max-w-5xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4ebef]">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/akun" className="text-xs font-bold text-[#327691] hover:underline">
              ← Dashboard Akun
            </Link>
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Heart size={20} fill="currentColor" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight">
              Paket Wisata Favorit Saya
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#53636d] mt-1">
            Simpan paket tour Jeep impian Anda dan pesan kapan saja saat waktu liburan tiba.
          </p>
        </div>

        <Link
          href="/sewa"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
        >
          <Compass size={16} />
          <span>Eksplorasi Katalog Lainnya</span>
        </Link>
      </div>

      {/* Grid Paket Favorit */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#263b46]">
            Paket Unggulan Pilihan Wisatawan
          </h2>
          <span className="text-xs text-[#697780]">
            {favoriteProducts.length} Paket Disimpan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
