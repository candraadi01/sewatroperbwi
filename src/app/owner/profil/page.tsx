import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { User, Phone, Mail, Building2, CheckCircle2, Shield, LogOut } from "lucide-react";

export const metadata = {
  title: "Profil Pemilik & Rekening | Sewa Trooper Banyuwangi",
  description: "Kelola profil pemilik armada Trooper dan data rekening bank.",
};

export default async function OwnerProfilPage() {
  const user = await requireOwner("/owner/profil");

  return (
    <div className="space-y-7 font-sans max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#e4ebef]">
        <Link href="/owner" className="text-xs font-bold text-[#327691] hover:underline">
          ← Kembali ke Dashboard Pemilik
        </Link>
        <h1 className="heading-1 mt-2">Profil Pemilik & Rekening Bank</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Informasi pemilik armada dan data rekening bank resmi untuk transfer pencairan dana sewa.
        </p>
      </div>

      <div className="space-y-6">
        {/* Identitas Pemilik */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-[#f0f4f6]">
            <div className="w-16 h-16 rounded-2xl bg-[#263b46] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {user.fullName?.[0]?.toUpperCase() || "O"}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#263b46]">
                {user.fullName || "Pemilik Armada Trooper"}
              </h2>
              <p className="text-xs text-[#53636d] mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Mitra Terverifikasi
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e9f3f7] text-[#327691] text-[11px] font-bold">
                  Owner
                </span>
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nama Pemilik / Nama PO Armada
              </label>
              <input
                type="text"
                defaultValue={user.fullName || "CANDRA ADI PRASETYO"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nomor WhatsApp Koordinasi
              </label>
              <input
                type="tel"
                defaultValue="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#263b46] hover:bg-[#1a2931] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Data Rekening Bank Default */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Building2 size={20} className="text-[#327691]" />
            <h3 className="font-extrabold text-base text-[#263b46]">
              Rekening Bank Default (Pencairan Saldo)
            </h3>
          </div>

          <form className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nama Bank
              </label>
              <input
                type="text"
                defaultValue="BCA (Bank Central Asia)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  defaultValue="1800123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Atas Nama Rekening
                </label>
                <input
                  type="text"
                  defaultValue="CANDRA ADI PRASETYO"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium"
                />
              </div>
            </div>

            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              Perbarui Data Rekening
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
