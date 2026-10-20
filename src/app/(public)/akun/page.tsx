import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import {
  Car,
  ReceiptText,
  Heart,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Shield,
  Briefcase,
  Compass,
  Calendar,
} from "lucide-react";

export const metadata = {
  title: "Dashboard Pelanggan | Sewa Trooper Banyuwangi",
  description: "Dashboard akun pemesan sewa Jeep Trooper 4x4 Banyuwangi.",
};

export default async function AccountDashboard() {
  const user = await requireBuyer("/akun");
  const orders = await getOwnBookings();

  const pendingOrders = orders.filter((o) => o.booking_status === "pending_review");
  const approvedOrders = orders.filter((o) => o.booking_status === "approved");
  const confirmedOrders = orders.filter((o) =>
    ["payment_received", "confirmed", "in_progress", "completed"].includes(o.booking_status)
  );

  return (
    <div className="container-app py-10 md:py-14 max-w-5xl font-sans">
      {/* 1. Header Profil & Sapaan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4ebef]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#327691] to-[#254958] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight">
                Halo, {user.fullName || "Pelanggan Trooper"}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e9f3f7] text-[#327691] text-xs font-bold">
                Buyer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#53636d] mt-1">
              {user.email} · Kelola pesanan dan destinasi wisata petualangan Anda.
            </p>
          </div>
        </div>

        {/* Shortcut Role Switcher jika punya akses admin atau owner */}
        <div className="flex items-center gap-2">
          {user.roles.includes("admin") && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
            >
              <Shield size={14} />
              <span>Portal Admin</span>
            </Link>
          )}
          {(user.roles.includes("owner") || user.roles.includes("admin")) && (
            <Link
              href="/owner"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#263b46] hover:bg-[#1a2931] text-white text-xs font-bold transition shadow-xs"
            >
              <Briefcase size={14} />
              <span>Portal Pemilik</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Banner Notifikasi Prioritas jika ada Pesanan Siap Bayar */}
      {approvedOrders.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-black uppercase tracking-wide">
                Pemberitahuan Pembayaran
              </span>
              <h2 className="text-base sm:text-lg font-black text-emerald-950 mt-1">
                {approvedOrders.length} Pesanan Anda Telah Disetujui Admin!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                Ketersediaan armada telah dikonfirmasi. Selesaikan pembayaran sekarang untuk mengunci jadwal sewa Trooper Anda.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {approvedOrders.map((ao) => (
                  <Link
                    key={ao.id}
                    href={`/pesanan/${ao.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <CreditCard size={14} />
                    <span>Bayar {ao.id} ({formatIDR(ao.amount_to_pay)})</span>
                    <ArrowRight size={13} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Ringkasan Statistik Pesanan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697780]">Total Booking</span>
            <ReceiptText size={18} className="text-[#327691]" />
          </div>
          <p className="text-2xl font-black text-[#263b46] mt-2">{orders.length}</p>
          <span className="text-[11px] text-[#697780]">Sepanjang waktu</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Menunggu Review</span>
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{pendingOrders.length}</p>
          <span className="text-[11px] text-amber-700">Verifikasi armada admin</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Siap Dibayar</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900 mt-2">{approvedOrders.length}</p>
          <span className="text-[11px] text-emerald-700">Telah disetujui admin</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sky-200 bg-sky-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800">Terkonfirmasi</span>
            <Car size={18} className="text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-900 mt-2">{confirmedOrders.length}</p>
          <span className="text-[11px] text-sky-700">Jadwal aktif & selesai</span>
        </div>
      </div>

      {/* 4. 4 Menu Utama Pelanggan (Sesuai List Permintaan) */}
      <div className="mt-8">
        <h2 className="text-base sm:text-lg font-extrabold text-[#263b46] tracking-tight mb-4">
          Menu Layanan Pelanggan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Katalog Paket Tour */}
          <Link
            href="/sewa"
            className="group p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#e9f3f7] text-[#327691] group-hover:bg-[#327691] group-hover:text-white flex items-center justify-center transition-colors">
                <Compass size={22} />
              </div>
              <h3 className="font-extrabold text-[#263b46] text-base mt-3.5 group-hover:text-[#327691] transition-colors">
                Katalog Tour & Sewa
              </h3>
              <p className="text-xs text-[#53636d] mt-1 leading-relaxed">
                Jelajahi paket wisata Kawah Ijen, Baluran, Sukamade, dan sewa harian + sopir.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0f4f6] flex items-center justify-between text-xs font-bold text-[#327691]">
              <span>Pesan Sekarang</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. History Transaksi */}
          <Link
            href="/pesanan"
            className="group p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#e9f3f7] text-[#327691] group-hover:bg-[#327691] group-hover:text-white flex items-center justify-center transition-colors">
                <ReceiptText size={22} />
              </div>
              <h3 className="font-extrabold text-[#263b46] text-base mt-3.5 group-hover:text-[#327691] transition-colors">
                History Transaksi
              </h3>
              <p className="text-xs text-[#53636d] mt-1 leading-relaxed">
                Pantau status review armada, lakukan pembayaran pesanan disetujui, dan unduh invoice.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0f4f6] flex items-center justify-between text-xs font-bold text-[#327691]">
              <span>Lihat Riwayat ({orders.length})</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Sukai / Favorit */}
          <Link
            href="/akun/favorit"
            className="group p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#e9f3f7] text-[#327691] group-hover:bg-[#327691] group-hover:text-white flex items-center justify-center transition-colors">
                <Heart size={22} />
              </div>
              <h3 className="font-extrabold text-[#263b46] text-base mt-3.5 group-hover:text-[#327691] transition-colors">
                Paket Disukai
              </h3>
              <p className="text-xs text-[#53636d] mt-1 leading-relaxed">
                Daftar destinasi dan paket sewa Trooper impian yang Anda simpan sebagai favorit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0f4f6] flex items-center justify-between text-xs font-bold text-[#327691]">
              <span>Buka Wishlist</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Profil */}
          <Link
            href="/akun/profil"
            className="group p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#e9f3f7] text-[#327691] group-hover:bg-[#327691] group-hover:text-white flex items-center justify-center transition-colors">
                <User size={22} />
              </div>
              <h3 className="font-extrabold text-[#263b46] text-base mt-3.5 group-hover:text-[#327691] transition-colors">
                Profil Akun
              </h3>
              <p className="text-xs text-[#53636d] mt-1 leading-relaxed">
                Perbarui nama lengkap, nomor WhatsApp penjemputan, email, dan keamanan kata sandi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f0f4f6] flex items-center justify-between text-xs font-bold text-[#327691]">
              <span>Kelola Profil</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Daftar Booking Terbaru (Maks 3) */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-[#263b46] tracking-tight">
            Pesanan Terbaru Anda
          </h2>
          {orders.length > 0 && (
            <Link
              href="/pesanan"
              className="text-xs font-bold text-[#327691] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Pesanan</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#e4ebef] text-sm text-[#53636d]">
            <Car size={36} className="mx-auto text-[#ccd8de] mb-2" />
            <p className="font-bold text-[#263b46]">Belum ada pesanan aktif.</p>
            <p className="text-xs text-[#697780] mt-1">
              Temukan pengalaman offroad seru di Banyuwangi sekarang!
            </p>
            <Link
              href="/sewa"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-[#327691] text-white text-xs font-bold shadow-xs transition"
            >
              <span>Buka Katalog Wisata</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#53636d] bg-[#f4f7f9] px-2 py-0.5 rounded">
                      {b.id}
                    </span>
                    <span className="text-xs font-bold text-[#327691]">
                      {bookingStatus[b.booking_status] || b.booking_status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#263b46] mt-1.5">
                    {b.product_name}
                  </h3>
                  <p className="text-xs text-[#697780] mt-0.5 flex items-center gap-2">
                    <Calendar size={13} />
                    <span>{b.service_date} · {b.num_units} Unit · {b.num_passengers} Orang</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#f0f4f6]">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#697780] block">Total:</span>
                    <span className="font-extrabold text-sm text-[#263b46]">
                      {formatIDR(b.total_amount)}
                    </span>
                  </div>
                  <Link
                    href={`/pesanan/${b.id}`}
                    className="px-3.5 py-2 rounded-xl bg-[#f4f7f9] hover:bg-[#327691] hover:text-white text-[#263b46] text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <span>Detail</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
