import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { User, Phone, Mail, Shield, LogOut, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Profil Saya | Sewa Trooper Banyuwangi",
  description: "Kelola profil dan informasi kontak akun Sewa Trooper Banyuwangi.",
};

export default async function ProfilPage() {
  const user = await requireBuyer("/akun/profil");

  return (
    <div className="container-app py-10 md:py-14 max-w-3xl font-sans">
      {/* Header */}
      <div className="pb-6 border-b border-[#e4ebef]">
        <Link href="/akun" className="text-xs font-bold text-[#327691] hover:underline">
          ← Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight mt-2">
          Profil Akun Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-[#53636d] mt-1">
          Informasi kontak yang digunakan driver untuk konfirmasi penjemputan dan notifikasi booking.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Kartu Profil Utama */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-[#f0f4f6]">
            <div className="w-16 h-16 rounded-2xl bg-[#327691] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "B"}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#263b46]">
                {user.fullName || "Pelanggan Trooper"}
              </h2>
              <p className="text-xs text-[#53636d] mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Akun Aktif</span>
                </span>
                {user.roles.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded-full bg-[#f4f7f9] text-[#263b46] text-[11px] font-bold uppercase">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Detail Kontak */}
          <form className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#263b46] uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-[#697780]" />
                <input
                  type="text"
                  name="fullName"
                  defaultValue={user.fullName}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] focus:ring-2 focus:ring-[#327691]/20 font-medium"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263b46] uppercase tracking-wider mb-1.5">
                Alamat Email (Login)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-[#697780]" />
                <input
                  type="email"
                  name="email"
                  disabled
                  defaultValue={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ebef] bg-[#f8fafc] text-sm text-[#697780] cursor-not-allowed font-medium"
                />
              </div>
              <p className="text-[11px] text-[#697780] mt-1">
                Email digunakan sebagai identitas akun login dan pengiriman tiket pesanan.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263b46] uppercase tracking-wider mb-1.5">
                Nomor Telepon / WhatsApp Penjemputan
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-[#697780]" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] focus:ring-2 focus:ring-[#327691]/20 font-medium"
                />
              </div>
              <p className="text-[11px] text-[#697780] mt-1">
                Driver Trooper akan menghubungi WhatsApp ini 1 hari sebelum keberangkatan.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-sm shadow-xs transition cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Keamanan & Logout */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-[#263b46] text-sm sm:text-base">
              Keluar dari Sesi Akun
            </h3>
            <p className="text-xs text-[#53636d] mt-0.5">
              Keluar dari akun Anda di perangkat ini untuk keamanan.
            </p>
          </div>

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar Akun</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
