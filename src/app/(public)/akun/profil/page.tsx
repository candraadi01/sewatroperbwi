import { requireBuyer } from "@/lib/auth/helpers";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { User, Phone, Mail, CheckCircle2, Shield } from "lucide-react";

export const metadata = {
  title: "Profil Akun | Sewa Trooper Banyuwangi",
  description: "Kelola profil dan informasi kontak akun Sewa Trooper Banyuwangi.",
};

export default async function ProfilPage() {
  const user = await requireBuyer("/akun/profil");

  return (
    <BuyerPortalLayout user={user} activeMenu="profil">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight">
            Profil Akun
          </h1>
          <p className="text-xs sm:text-sm text-[#73848e] mt-1">
            Informasi kontak yang digunakan driver untuk konfirmasi penjemputan dan notifikasi booking.
          </p>
        </div>

        {/* Kartu Profil Utama */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-[#f0f4f6]">
            <div className="w-14 h-14 rounded-2xl bg-[#5d7d8c] text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#263b46]">
                {user.fullName || "Pelanggan Trooper"}
              </h2>
              <p className="text-xs text-[#8b9ba5] mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Akun Aktif</span>
                </span>
                {user.roles.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded-md bg-[#f4f7f9] text-[#263b46] text-[10px] font-bold uppercase border border-[#e4ebef]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Detail Kontak */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#263b46] uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
                <input
                  type="text"
                  defaultValue={user.fullName}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ebef] bg-[#f8fafc] text-xs sm:text-sm text-[#263b46] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263b46] uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
                <input
                  type="email"
                  defaultValue={user.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ebef] bg-[#f8fafc] text-xs sm:text-sm text-[#263b46] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263b46] uppercase tracking-wider mb-1.5">
                Nomor WhatsApp Penjemputan
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  defaultValue=""
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e4ebef] text-xs sm:text-sm text-[#263b46] focus:outline-none focus:ring-2 focus:ring-[#327691]"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#8b9ba5] pt-1">
              Catatan: Pastikan nomor WhatsApp selalu aktif agar koordinator lapangan kami dapat mengonfirmasi jadwal titik penjemputan Jeep.
            </p>
          </div>
        </div>
      </div>
    </BuyerPortalLayout>
  );
}
