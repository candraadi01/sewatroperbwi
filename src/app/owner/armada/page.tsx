import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getProducts } from "@/lib/services/catalog";
import { formatIDR } from "@/lib/utils/currency";
import { Car, CheckCircle2, ExternalLink, ShieldCheck, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Katalog Armada Pemilik | Sewa Trooper Banyuwangi",
  description: "Daftar unit Jeep Trooper dan paket wisata milik armada Anda.",
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
            Pantau status operasional unit Jeep Trooper 4x4 dan paket tour terdaftar atas nama armada Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e9f3f7] text-[#327691] text-xs font-bold border border-[#d3e7ef]">
            <CheckCircle2 size={14} />
            <span>{products.length} Unit Armada Aktif</span>
          </span>
        </div>
      </div>

      {/* Informasi Koordinator */}
      <div className="p-4 rounded-2xl bg-white border border-[#e4ebef] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="font-bold text-[#263b46]">
              Perubahan Data Armada atau Penambahan Unit Baru?
            </p>
            <p className="text-[#697780] mt-0.5">
              Untuk mendaftarkan nopol baru atau menyesuaikan tarif sewa, silakan koordinasikan dengan Administrator.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20pemilik%20armada%20ingin%20berkoordinasi%20mengenai%20unit%20Trooper."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#263b46] hover:bg-[#1b2b33] text-white font-bold transition shrink-0"
        >
          <PhoneCall size={14} />
          <span>Hubungi Admin</span>
        </a>
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
            <div className="p-4 pt-0">
              <Link
                href={`/sewa/${p.slug}`}
                target="_blank"
                className="w-full py-2.5 rounded-xl border border-[#ccd8de] hover:border-[#327691] hover:text-[#327691] text-[#263b46] text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>Lihat Tampilan di Katalog Web</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
