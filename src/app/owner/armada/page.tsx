import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getProducts } from "@/lib/services/catalog";
import { formatIDR } from "@/lib/utils/currency";
import { Car, PlusCircle, CheckCircle2, ShieldCheck, MapPin, Wrench } from "lucide-react";

export const metadata = {
  title: "Katalog Armada Pemilik | Sewa Trooper Banyuwangi",
  description: "Kelola unit Jeep Trooper dan paket wisata milik pemilik armada.",
};

export default async function OwnerArmadaPage() {
  await requireOwner("/owner/armada");
  const products = await getProducts();

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Manajemen Aset Kendaraan
          </span>
          <h1 className="heading-1 mt-1">Katalog Armada & Paket Pemilik</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Daftar unit Jeep Trooper 4x4 dan paket tour terdaftar atas nama armada Anda.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>+ Daftarkan Unit Baru</span>
        </button>
      </div>

      {/* Rincian Unit Armada Pemilik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, idx) => (
          <div
            key={p.id}
            className="rounded-2xl border border-[#e4ebef] bg-white overflow-hidden shadow-xs hover:border-[#327691] transition flex flex-col justify-between"
          >
            <div>
              {/* Header Card Armada */}
              <div className="p-4 bg-gradient-to-r from-[#263b46] to-[#1f3039] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider text-[#327691] bg-white px-2 py-0.5 rounded">
                    UNIT #{idx + 1}
                  </span>
                  <p className="font-mono text-xs font-bold mt-1.5 text-neutral-200">
                    Nopol: P 19{80 + idx} BWI
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 size={12} />
                  <span>Siap Jalan</span>
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-extrabold text-[#263b46] text-base leading-snug">
                  {p.name}
                </h3>
                <p className="text-xs text-[#53636d] mt-1 line-clamp-2">
                  {p.short_description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#f0f4f6] grid grid-cols-2 gap-2 text-xs text-[#53636d]">
                  <div>
                    <span className="text-[#697780] block text-[10px]">Kapasitas:</span>
                    <strong className="text-[#263b46]">{p.passenger_capacity} Penumpang</strong>
                  </div>
                  <div>
                    <span className="text-[#697780] block text-[10px]">Penggerak:</span>
                    <strong className="text-[#263b46]">4x4 Aktif / Low Gear</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f4f6] flex items-center justify-between">
                  <span className="text-xs text-[#697780]">Tarif Sewa:</span>
                  <span className="text-base font-black text-[#2c6881]">
                    {formatIDR(p.base_price ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Card */}
            <div className="p-4 pt-0 flex gap-2">
              <Link
                href={`/sewa/${p.slug}`}
                className="flex-1 py-2 rounded-xl border border-[#ccd8de] hover:border-[#327691] hover:text-[#327691] text-[#263b46] text-xs font-bold text-center transition"
              >
                Lihat di Web
              </Link>
              <button
                type="button"
                className="px-3 py-2 rounded-xl bg-[#f4f7f9] hover:bg-[#e9f3f7] text-[#263b46] text-xs font-semibold transition"
              >
                Edit Unit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
