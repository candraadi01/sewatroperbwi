import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import {
  Car,
  Wallet,
  CalendarCheck2,
  TrendingUp,
  ReceiptText,
  ArrowRight,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Dashboard Pemilik Armada | Sewa Trooper Banyuwangi",
  description: "Dashboard kontrol armada, pendapatan, dan penjadwalan sewa Trooper.",
};

export default async function OwnerDashboard() {
  const user = await requireOwner("/owner");
  const bookings = await getAllBookings();

  const totalRevenue = bookings
    .filter((b) => ["settlement", "dp_paid"].includes(b.payment_status))
    .reduce((sum, b) => sum + b.amount_paid, 0);

  // Estimasi komisi/saldo pemilik (misal 85% untuk pemilik armada, 15% platform)
  const ownerBalance = Math.round(totalRevenue * 0.85);

  const pendingApprovals = bookings.filter((b) => b.booking_status === "pending_review");
  const activeTrips = bookings.filter((b) => ["approved", "confirmed", "in_progress"].includes(b.booking_status));

  return (
    <div className="space-y-8 font-sans">
      {/* Header Dashboard Pemilik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Portal Mitra Pemilik Armada
          </span>
          <h1 className="heading-1 mt-1">Dashboard Pemilik</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Selamat datang, <strong>{user.fullName || "Pemilik Armada"}</strong>. Pantau jadwal dan kinerja armada Trooper Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/owner/jadwal"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#263b46] hover:bg-[#1b2b33] text-white text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <CalendarCheck2 size={16} />
            <span>+ Jadwal Luar Web</span>
          </Link>
          <Link
            href="/owner/tarik-dana"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <Wallet size={16} />
            <span>Tarik Tunai</span>
          </Link>
        </div>
      </div>

      {/* Alert Jika Ada Pesanan yang Perlu Konfirmasi */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-amber-950">
                {pendingApprovals.length} Pesanan Baru Menunggu Konfirmasi Armada!
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                Pastikan unit Trooper Anda siap pada tanggal yang dipilih pemesan, lalu setujui di menu transaksi.
              </p>
            </div>
          </div>
          <Link
            href="/admin/pesanan?status=pending_review"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 text-center shadow-xs transition"
          >
            Konfirmasi Sekarang →
          </Link>
        </div>
      )}

      {/* 4 Kartu Metrik Finansial & Armada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Siap Ditarik */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Saldo Siap Ditarik
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#263b46] mt-2">
            {formatIDR(ownerBalance)}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Bisa dicairkan</span>
            </span>
            <Link href="/owner/tarik-dana" className="text-xs font-bold text-[#327691] hover:underline">
              Tarik Dana →
            </Link>
          </div>
        </div>

        {/* Total Omset Terverifikasi */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Total Omset Trip
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#263b46] mt-2">
            {formatIDR(totalRevenue)}
          </p>
          <span className="text-xs text-neutral-400 mt-1 block">Dari transaksi web</span>
        </div>

        {/* Armada Siap / Terdaftar */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Armada Trooper
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Car size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#263b46] mt-2">
            10 Unit
          </p>
          <span className="text-xs text-sky-700 font-semibold mt-1 block">Kondisi 4x4 Prima</span>
        </div>

        {/* Trip Berjalan & Selesai */}
        <div className="p-5 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Trip Aktif & Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ReceiptText size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#263b46] mt-2">
            {activeTrips.length} Trip
          </p>
          <span className="text-xs text-purple-700 font-semibold mt-1 block">Terkonfirmasi & Siap</span>
        </div>
      </div>

      {/* Grid 2 Kolom: Fitur Utama Pemilik */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Penjadwalan Luar Web / Offline Orders */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={18} className="text-[#327691]" />
                <h3 className="font-extrabold text-base text-[#263b46]">
                  Penjadwalan Luar Web (Offline)
                </h3>
              </div>
              <Link
                href="/owner/jadwal"
                className="text-xs font-bold text-[#327691] hover:underline"
              >
                Kelola Jadwal →
              </Link>
            </div>
            <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
              Jika ada tamu yang menyewa armada Trooper langsung via WhatsApp, telepon, atau pihak ketiga di luar website ini, segera input jadwalnya di sini agar tanggal tersebut otomatis terkunci dan tidak bisa dipesan ganda (*double booking*) oleh pengunjung web.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e4ebef] space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-neutral-700">
                <span>Unit: Jeep Trooper 4x4 (P 1845 BWI)</span>
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Terkunci</span>
              </div>
              <p className="text-neutral-500">
                Tamu: Rombongan Keluarga Jakarta · Trip Kawah Ijen 2D1N (Via WhatsApp)
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-100">
            <Link
              href="/owner/jadwal"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <PlusCircle size={15} />
              <span>Tambah Jadwal Sewa Luar Web</span>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Tarik Tunai / Pencairan Saldo Cepat */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-emerald-600" />
                <h3 className="font-extrabold text-base text-[#263b46]">
                  Pencairan Saldo (Tarik Tunai)
                </h3>
              </div>
              <Link
                href="/owner/tarik-dana"
                className="text-xs font-bold text-[#327691] hover:underline"
              >
                Riwayat Tarik Dana →
              </Link>
            </div>
            <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
              Pendapatan dari seluruh trip yang telah selesai otomatis masuk ke saldo pemilik. Anda dapat mengajukan pencairan dana kapan saja ke rekening bank yang terdaftar.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-semibold">Saldo Tersedia:</span>
                <p className="text-xl font-black text-emerald-950 mt-0.5">{formatIDR(ownerBalance)}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                BCA •••• 5678
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-100">
            <Link
              href="/owner/tarik-dana"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <Wallet size={15} />
              <span>Ajukan Penarikan Dana Sekarang</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Daftar Transaksi Terbaru Armada Pemilik */}
      <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="font-extrabold text-base text-[#263b46]">
              Pesanan Terbaru yang Menggunakan Armada Anda
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Daftar trip dari website Sewa Trooper Banyuwangi.
            </p>
          </div>
          <Link
            href="/owner/transaksi"
            className="text-xs font-bold text-[#327691] hover:underline flex items-center gap-1"
          >
            <span>Semua Transaksi</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-neutral-100">
          {bookings.slice(0, 4).map((b) => (
            <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                    {b.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {bookingStatus[b.booking_status] || b.booking_status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#263b46] mt-1">{b.product_name}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {b.service_date} · {b.num_units} Unit Trooper · Tamu: {b.contact_name}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-neutral-400 block">Total Tarif:</span>
                <span className="font-black text-sm text-[#263b46]">{formatIDR(b.total_amount)}</span>
              </div>
            </div>
          ))}

          {!bookings.length && (
            <div className="text-center py-8 text-xs text-neutral-400">
              Belum ada transaksi sewa armada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
