import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getProducts } from "@/lib/services/catalog";
import { ProductCard } from "@/components/ProductCard";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { Heart, Compass, Search } from "lucide-react";

export const metadata = {
  title: "Paket Disukai | Sewa Trooper Banyuwangi",
  description: "Daftar paket sewa Jeep Trooper dan tour wisata Banyuwangi yang Anda sukai.",
};

export default async function FavoritPage() {
  const user = await requireBuyer("/akun/favorit");
  const allProducts = await getProducts();
  const favoriteProducts = allProducts.filter((p) => p.is_best_seller || p.is_featured).slice(0, 4);

  return (
    <BuyerPortalLayout user={user} activeMenu="disukai">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight">
              Paket Disukai
            </h1>
            <p className="text-xs sm:text-sm text-[#73848e] mt-1">
              Daftar paket wisata Jeep Trooper favorit yang telah Anda simpan.
            </p>
          </div>

          <Link
            href="/sewa"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Search size={14} />
            <span>Jelajahi Paket Lain</span>
          </Link>
        </div>

        {/* Wishlist Cards */}
        <div className="bg-white rounded-2xl border border-[#e4ebef] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f4f6]">
            <h2 className="text-sm font-bold text-[#263b46]">
              Koleksi Wishlist Anda ({favoriteProducts.length})
            </h2>
            <span className="text-xs text-[#73848e]">
              Siap dipesan sewaktu-waktu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </BuyerPortalLayout>
  );
}
