import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { Wallet, ArrowUpRight, CheckCircle2, Clock, Building2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Tarik Tunai / Pencairan Saldo | Sewa Trooper Banyuwangi",
  description: "Formulir pencairan saldo pendapatan pemilik armada Trooper.",
};

export default async function OwnerTarikDanaPage() {
  await requireOwner("/owner/tarik-dana");
  const bookings = await getAllBookings();
  const totalRevenue = bookings
    .filter((b) => ["settlement", "dp_paid"].includes(b.payment_status))
    .reduce((sum, b) => sum + b.amount_paid, 0);

  const availableBalance = Math.round(totalRevenue * 0.85);

  return (
    <div className="space-y-7 font-sans max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#e4ebef]">
        <Link href="/owner" className="text-xs font-bold text-[#327691] hover:underline">
          ← Kembali ke Dashboard Pemilik
        </Link>
        <h1 className="heading-1 mt-2">Tarik Tunai / Pencairan Saldo</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Cairkan saldo pendapatan sewa armada Trooper Anda ke rekening bank yang terdaftar.
        </p>
      </div>

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-start">
        {/* Formulir Tarik Tunai */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <span className="text-xs text-neutral-500 font-semibold">Saldo yang Dapat Ditarik</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">
                {formatIDR(availableBalance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={24} />
            </div>
          </div>

          <form className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nominal Penarikan (Rp)
              </label>
              <input
                type="number"
                min={100000}
                max={availableBalance}
                defaultValue={availableBalance > 0 ? availableBalance : 500000}
                placeholder="Minimal Rp 100.000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-bold"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Batas minimal penarikan adalah Rp 100.000.
              </span>
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Bank Tujuan Transfer
              </label>
              <select className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]">
                <option value="BCA">Bank BCA (Bank Central Asia)</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">Bank BRI (Bank Rakyat Indonesia)</option>
                <option value="BNI">Bank BNI</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="JATIM">Bank Jatim</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                defaultValue="1800123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nama Pemilik Rekening (Sesuai Buku Tabungan)
              </label>
              <input
                type="text"
                defaultValue="CANDRA ADI PRASETYO"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
              />
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              Ajukan Pencairan Sekarang
            </button>
          </form>
        </div>

        {/* Riwayat Penarikan Dana */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-[#263b46]">
            Riwayat Pencairan Terakhir
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">18 Okt 2026 · 14:30 WIB</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} />
                  <span>Berhasil Ditransfer</span>
                </span>
              </div>
              <p className="text-lg font-black text-[#263b46] mt-2">
                {formatIDR(2500000)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                BCA 1800123456 a.n CANDRA ADI PRASETYO
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">10 Okt 2026 · 09:15 WIB</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} />
                  <span>Berhasil Ditransfer</span>
                </span>
              </div>
              <p className="text-lg font-black text-[#263b46] mt-2">
                {formatIDR(1850000)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                BCA 1800123456 a.n CANDRA ADI PRASETYO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
