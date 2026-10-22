import { requireBuyer } from "@/lib/auth/helpers";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { User, Phone, Mail, CheckCircle2, Shield } from "lucide-react";

export const metadata = {
  title: "Profil Akun | Portal Pelanggan Sewa Trooper BWI",
  description: "Kelola profil dan informasi kontak akun Sewa Trooper Banyuwangi.",
};

export default async function BuyerProfilPage() {
  const user = await requireBuyer("/buyer/profil");

  return (
    <BuyerPortalLayout user={user} activeMenu="profil">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-[#e4ebef] dark:border-neutral-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] dark:text-neutral-100 tracking-tight">
            Profil Akun Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-[#73848e] dark:text-neutral-400 mt-1">
            Informasi kontak yang digunakan driver untuk konfirmasi penjemputan dan notifikasi booking.
          </p>
        </div>

        {/* Kartu Profil Utama */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-[#f0f4f6] dark:border-neutral-800">
            <div className="w-14 h-14 rounded-2xl bg-[#5d7d8c] text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#263b46] dark:text-neutral-100">
                {user.fullName || "Pelanggan Trooper"}
              </h2>
              <p className="text-xs text-[#8b9ba5] dark:text-neutral-400 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Akun Terverifikasi</span>
                </span>
                {user.roles.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded-md bg-[#f4f7f9] dark:bg-neutral-800 text-[#263b46] dark:text-neutral-200 text-[10px] font-bold uppercase border border-[#e4ebef] dark:border-neutral-700">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Detail Kontak (Informasi Akun) */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
                <input
                  type="text"
                  readOnly
                  value={user.fullName || "Pelanggan"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ebef] dark:border-neutral-800 bg-[#f8fafc] dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-[#263b46] dark:text-neutral-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
                <input
                  type="email"
                  readOnly
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ebef] dark:border-neutral-800 bg-[#f8fafc] dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-[#263b46] dark:text-neutral-200 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Email digunakan untuk pengiriman invoice dan tiket reservasi tour Jeep.
              </p>
            </div>

            <div className="pt-4 border-t border-[#f0f4f6] dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Membutuhkan perubahan data akun atau kendala reservasi?
              </span>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Sewa%20Trooper%20Banyuwangi"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-bold transition"
              >
                Hubungi Bantuan CS
              </a>
            </div>
          </div>
        </div>
      </div>
    </BuyerPortalLayout>
  );
}
