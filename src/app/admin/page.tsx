import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { midtransConfigured } from "@/lib/midtrans/snap";
import {
  Clock,
  Car,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Calendar,
  Users,
  Settings,
  BarChart3,
  ChevronRight,
  Phone,
  ArrowUpRight,
  Sparkles,
  Wallet,
  Package,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/components/ui";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending_review":
      return {
        label: "Menunggu Konfirmasi Admin",
        bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-bold",
        dot: "bg-amber-500 animate-pulse",
      };
    case "approved":
      return {
        label: "Disetujui (Menunggu Bayar)",
        bg: "bg-sky-50 dark:bg-sky-950/40 text-[#2c6881] dark:text-[#8abbd0] border-[#cfe2ec] dark:border-sky-800/60 font-semibold",
        dot: "bg-sky-500",
      };
    case "payment_received":
      return {
        label: "Pembayaran Diterima",
        bg: "bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800/60 font-semibold",
        dot: "bg-teal-500",
      };
    case "confirmed":
      return {
        label: "Armada Terkonfirmasi",
        bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60 font-bold",
        dot: "bg-emerald-500",
      };
    case "in_progress":
      return {
        label: "Trip Sedang Berjalan",
        bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60 font-semibold",
        dot: "bg-indigo-500 animate-pulse",
      };
    case "completed":
      return {
        label: "Trip Selesai",
        bg: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
        dot: "bg-neutral-400",
      };
    case "cancelled_by_buyer":
    case "cancelled_by_admin":
    case "cancelled":
      return {
        label: "Dibatalkan",
        bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/60",
        dot: "bg-rose-500",
      };
    case "refund_pending":
      return {
        label: "Refund Perlu Ditinjau",
        bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/60 font-semibold",
        dot: "bg-purple-500",
      };
    default:
      return {
        label: bookingStatus[status] || status,
        bg: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
        dot: "bg-neutral-400",
      };
  }
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  // Ambil semua data pesanan secara terpusat & aman
  const bookings = await getAllBookings();

  // Hitung metrik operasional secara akurat
  const pendingReviewBookings = bookings.filter((b) => b.booking_status === "pending_review");
  const approvedBookings = bookings.filter((b) => b.booking_status === "approved");
  const confirmedBookings = bookings.filter((b) =>
    ["payment_received", "confirmed", "in_progress"].includes(b.booking_status)
  );
  const completedBookings = bookings.filter((b) => b.booking_status === "completed");

  // Hitung total omzet dari pesanan valid
  const totalRevenue = bookings
    .filter((b) => !b.booking_status.includes("cancel"))
    .reduce((acc, b) => acc + (b.total_amount || 0), 0);

  // Ambil 7 pesanan terbaru untuk ditampilkan di tabel
  const recentBookings = bookings.slice(0, 7);

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-7 font-sans select-none">
      {/* 1. Header Halaman */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e4ebef] dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] bg-[#e9f3f7] dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-[#d2e4ec] dark:border-neutral-700 inline-block mb-2">
            Operasional & Manajemen Jeep 4x4
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263b46] dark:text-neutral-100 tracking-tight">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#53636d] dark:text-neutral-400 max-w-2xl leading-relaxed">
            Pantau pesanan baru masuk dari buyer, jadwalkan armada Jeep Trooper, dan kelola operasional wisata secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
              Tanggal Operasional
            </span>
            <span className="text-xs font-bold text-[#263b46] dark:text-neutral-200">
              {todayStr}
            </span>
          </div>
          <Link
            href="/admin/pesanan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <ShoppingBag size={15} />
            <span>Kelola Semua Pesanan</span>
          </Link>
        </div>
      </header>

      {/* 2. Banner Perhatian Khusus: Ada Pesanan Baru Menunggu Konfirmasi */}
      {pendingReviewBookings.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                  Perlu Tindakan
                </span>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">
                  {pendingReviewBookings.length} Pesanan Baru Menunggu Persetujuan
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-1">
                Pesanan terbaru: <strong className="text-amber-900 dark:text-amber-300">{pendingReviewBookings[0].id}</strong> oleh{" "}
                <strong>{pendingReviewBookings[0].contact_name}</strong> untuk trip{" "}
                <em>{pendingReviewBookings[0].product_name}</em> ({pendingReviewBookings[0].service_date}).
              </p>
            </div>
          </div>

          <Link
            href="/admin/pesanan?status=pending_review"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Tinjau & Konfirmasi Sekarang</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* 3. 4 Kartu Metrik Operasional Utama (Indikator Warna & Angka Terbaca Jelas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Menunggu Konfirmasi */}
        <Link
          href="/admin/pesanan?status=pending_review"
          className={cn(
            "p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md group flex flex-col justify-between",
            pendingReviewBookings.length > 0
              ? "border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-400/20"
              : "border-[#e4ebef] dark:border-neutral-800 hover:border-[#327691]"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
              Menunggu Konfirmasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#263b46] dark:text-neutral-100">
                {pendingReviewBookings.length}
              </span>
              <span className="text-xs font-semibold text-neutral-500">pesanan</span>
            </div>
            <p className="text-[11px] text-[#8e9da5] dark:text-neutral-400 mt-1">
              Pesanan baru butuh persetujuan armada
            </p>
          </div>
        </Link>

        {/* Card 2: Menunggu Pembayaran */}
        <Link
          href="/admin/pesanan?status=approved"
          className="p-5 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md hover:border-[#327691] transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
              Menunggu Pembayaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-[#327691] dark:text-[#8abbd0] flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#263b46] dark:text-neutral-100">
                {approvedBookings.length}
              </span>
              <span className="text-xs font-semibold text-neutral-500">pesanan</span>
            </div>
            <p className="text-[11px] text-[#8e9da5] dark:text-neutral-400 mt-1">
              Disetujui admin, menunggu buyer bayar
            </p>
          </div>
        </Link>

        {/* Card 3: Trip Terkonfirmasi & Berjalan */}
        <Link
          href="/admin/pesanan?status=confirmed"
          className="p-5 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
              Trip Terkonfirmasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Car size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#263b46] dark:text-neutral-100">
                {confirmedBookings.length}
              </span>
              <span className="text-xs font-semibold text-neutral-500">trip siap jalan</span>
            </div>
            <p className="text-[11px] text-[#8e9da5] dark:text-neutral-400 mt-1">
              Pembayaran lunas/DP & jadwal siap
            </p>
          </div>
        </Link>

        {/* Card 4: Total Omzet Terjadwal */}
        <Link
          href="/admin/laporan"
          className="p-5 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md hover:border-indigo-500 transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-neutral-400">
              Total Nilai Booking
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-[#263b46] dark:text-neutral-100 truncate">
                {formatIDR(totalRevenue)}
              </span>
            </div>
            <p className="text-[11px] text-[#8e9da5] dark:text-neutral-400 mt-1">
              Dari {bookings.length} total pesanan masuk
            </p>
          </div>
        </Link>
      </div>

      {/* 4. Tabel Pesanan Terbaru (Format Modern, Berisi Paket, Kontak, Nominal & Status Badge) */}
      <div className="rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        {/* Header Tabel */}
        <div className="p-4 sm:p-5 border-b border-[#e4ebef] dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900">
          <div>
            <h2 className="font-extrabold text-base text-[#263b46] dark:text-neutral-100 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#327691] dark:text-[#8abbd0]" />
              Pesanan Terbaru Masuk
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Daftar reservasi sewa Jeep Trooper terbaru dari buyer yang perlu dipantau & diproses.
            </p>
          </div>

          <Link
            href="/admin/pesanan"
            className="text-xs font-bold text-[#327691] dark:text-[#8abbd0] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Pesanan ({bookings.length})</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* List Pesanan dalam Format Kartu Rapi & Terstruktur */}
        {recentBookings.length > 0 ? (
          <div className="divide-y divide-[#e4ebef] dark:divide-neutral-800">
            {recentBookings.map((b) => {
              const statusInfo = getStatusBadge(b.booking_status);
              const isPending = b.booking_status === "pending_review";

              return (
                <div
                  key={b.id}
                  className={cn(
                    "p-4 sm:p-5 hover:bg-[#fbfcfd] dark:hover:bg-neutral-800/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4",
                    isPending && "bg-amber-50/40 dark:bg-amber-950/20"
                  )}
                >
                  {/* Info Pemesan & Paket */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-xs sm:text-sm text-[#263b46] dark:text-neutral-100">
                        {b.id}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border",
                          statusInfo.bg
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
                        <span>{statusInfo.label}</span>
                      </span>

                      {isPending && (
                        <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs">
                          Perlu Dicek
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#53636d] dark:text-neutral-400">
                      <span className="font-bold text-[#263b46] dark:text-neutral-200">
                        👤 {b.contact_name}
                      </span>
                      {b.contact_phone && (
                        <span className="flex items-center gap-1 text-neutral-500">
                          <Phone size={11} />
                          {b.contact_phone}
                        </span>
                      )}
                      <span>
                        📍 <strong>{b.product_name}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6e7f8a] dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#327691]" />
                        Jadwal Trip: <strong className="text-[#263b46] dark:text-neutral-200">{b.service_date}</strong>
                        {b.start_time && ` (${b.start_time})`}
                      </span>
                      <span>• {b.num_units} Unit Armada</span>
                    </div>
                  </div>

                  {/* Nominal & Tombol Tindakan */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#f0f4f6] dark:border-neutral-800">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        Total Biaya
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-[#263b46] dark:text-neutral-100">
                        {formatIDR(b.total_amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <Link
                          href={`/admin/pesanan?status=pending_review&q=${encodeURIComponent(b.id)}`}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Tinjau & Setujui</span>
                          <ChevronRight size={13} />
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/pesanan?q=${encodeURIComponent(b.id)}`}
                          className="px-3.5 py-2 rounded-xl border border-[#d2e4ec] dark:border-neutral-700 hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] font-bold text-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Detail</span>
                          <ChevronRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={22} />
            </div>
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              Belum ada pesanan masuk
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Saat buyer melakukan checkout sewa Jeep Trooper, pesanan akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      {/* 5. Section Dua Kolom: Aksi Cepat Operasional & Kesiapan Sistem */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Menu Pintasan Cepat (Quick Actions) */}
        <div className="rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
          <h3 className="font-extrabold text-sm sm:text-base text-[#263b46] dark:text-neutral-100 flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#327691] dark:text-[#8abbd0]" />
            Aksi Cepat Operasional
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Navigasi instan ke modul-modul penting pengelolaan wisata dan armada.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/admin/jadwal"
              className="p-3 rounded-xl border border-[#e4ebef] dark:border-neutral-800 hover:bg-[#f6fafc] dark:hover:bg-neutral-800/70 transition flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-neutral-800 text-[#327691] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#263b46] dark:text-neutral-200 block truncate">
                  Jadwal & Kuota
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  Kalender ketersediaan
                </span>
              </div>
            </Link>

            <Link
              href="/admin/produk"
              className="p-3 rounded-xl border border-[#e4ebef] dark:border-neutral-800 hover:bg-[#f6fafc] dark:hover:bg-neutral-800/70 transition flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-neutral-800 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package size={16} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#263b46] dark:text-neutral-200 block truncate">
                  Tour & Armada
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  Kelola paket & tarif
                </span>
              </div>
            </Link>

            <Link
              href="/admin/tim"
              className="p-3 rounded-xl border border-[#e4ebef] dark:border-neutral-800 hover:bg-[#f6fafc] dark:hover:bg-neutral-800/70 transition flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-neutral-800 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={16} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#263b46] dark:text-neutral-200 block truncate">
                  Tim Driver
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  Daftar driver lokal
                </span>
              </div>
            </Link>

            <Link
              href="/admin/pengaturan"
              className="p-3 rounded-xl border border-[#e4ebef] dark:border-neutral-800 hover:bg-[#f6fafc] dark:hover:bg-neutral-800/70 transition flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-neutral-800 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings size={16} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#263b46] dark:text-neutral-200 block truncate">
                  Pengaturan
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  DP, kontak & website
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Status Kesiapan Operasional & Sistem */}
        <div className="rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
          <h3 className="font-extrabold text-sm sm:text-base text-[#263b46] dark:text-neutral-100 flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Kesiapan Sistem & Payment Gateway
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Status konfigurasi gateway pembayaran online dan database aplikasi.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <CreditCard size={16} className="text-[#327691]" />
                <span className="text-xs font-bold text-[#263b46] dark:text-neutral-200">
                  Midtrans Snap Payment:
                </span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                  midtransConfigured()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                )}
              >
                {midtransConfigured()
                  ? process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
                    ? "✓ Siap (Produksi)"
                    : "✓ Siap (Sandbox)"
                  : "Belum Dikonfigurasi"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Car size={16} className="text-[#327691]" />
                <span className="text-xs font-bold text-[#263b46] dark:text-neutral-200">
                  SOP Verifikasi Booking:
                </span>
              </div>
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                Admin review &rarr; Setujui &rarr; Buyer Bayar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
