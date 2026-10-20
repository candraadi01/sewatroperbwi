import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { createClient } from "@/lib/supabase/server";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import {
  Car,
  ReceiptText,
  Heart,
  User,
  LayoutGrid,
  Search,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "Beranda Saya | Sewa Trooper Banyuwangi",
  description: "Dashboard akun pelanggan pemesan sewa Jeep Trooper 4x4 Banyuwangi.",
};

export default async function AccountDashboard() {
  const user = await requireBuyer("/akun");
  const orders = await getOwnBookings();

  // Query wishlist count
  const db = await createClient();
  const { count: favoritesCount } = await db
    .from("user_favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const unpaidOrders = orders.filter((o) =>
    ["pending_review", "approved"].includes(o.booking_status)
  );
  const paidOrders = orders.filter((o) =>
    ["payment_received", "confirmed", "in_progress", "completed"].includes(o.booking_status)
  );

  return (
    <BuyerPortalLayout user={user} activeMenu="beranda">
      <div className="space-y-6">
        {/* Top Header (Exact Foto 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] tracking-tight">
              Beranda Saya
            </h1>
            <p className="text-xs sm:text-sm text-[#73848e] mt-1">
              Selamat datang, <strong className="text-[#263b46]">{user.fullName || "Pelanggan"}</strong>. Pantau reservasi dan paket tour favorit Anda.
            </p>
          </div>

          <Link
            href="/sewa"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Search size={14} />
            <span>Jelajahi Tour Trooper</span>
          </Link>
        </div>

        {/* 1. Ringkasan Aktivitas (4 Stat Cards with dots - Exact Foto 2) */}
        <div>
          <h2 className="text-sm font-bold text-[#263b46] mb-3">
            Ringkasan Aktivitas
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Belum Dibayar */}
            <Link
              href="/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#53636d]">Belum Dibayar</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#263b46] my-2">
                {unpaidOrders.length}
              </p>
              <span className="text-[11px] font-semibold text-amber-700 hover:underline">
                Perlu segera diselesaikan →
              </span>
            </Link>

            {/* Card 2: Sudah Dibayar */}
            <Link
              href="/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#53636d]">Sudah Dibayar</span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#263b46] my-2">
                {paidOrders.length}
              </p>
              <span className="text-[11px] font-semibold text-sky-700 hover:underline">
                Telah dibooking & lunas →
              </span>
            </Link>

            {/* Card 3: Disukai */}
            <Link
              href="/akun/favorit"
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#53636d]">Disukai</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#263b46] my-2">
                {favoritesCount || 0}
              </p>
              <span className="text-[11px] font-semibold text-rose-600 hover:underline">
                Paket favorit tersimpan →
              </span>
            </Link>

            {/* Card 4: Total Riwayat */}
            <Link
              href="/pesanan"
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#53636d]">Total Riwayat</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#263b46] my-2">
                {orders.length}
              </p>
              <span className="text-[11px] font-semibold text-slate-600 hover:underline">
                Semua pesanan Anda →
              </span>
            </Link>
          </div>
        </div>

        {/* 2. Pintasan Cepat (4 Big Shortcut Cards - Exact Foto 2) */}
        <div>
          <h2 className="text-sm font-bold text-[#263b46] mb-3">
            Pintasan Cepat
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Pintasan 1: Katalog */}
            <Link
              href="/sewa"
              className="p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center mb-2.5 group-hover:bg-[#327691] group-hover:text-white transition-colors">
                <LayoutGrid size={22} />
              </div>
              <span className="text-xs font-bold text-[#263b46] group-hover:text-[#327691] transition-colors">
                Katalog Tour Trooper
              </span>
            </Link>

            {/* Pintasan 2: Pesanan */}
            <Link
              href="/pesanan"
              className="p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ReceiptText size={22} />
              </div>
              <span className="text-xs font-bold text-[#263b46] group-hover:text-blue-600 transition-colors">
                Pesanan Saya
              </span>
            </Link>

            {/* Pintasan 3: Disukai */}
            <Link
              href="/akun/favorit"
              className="p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Heart size={22} />
              </div>
              <span className="text-xs font-bold text-[#263b46] group-hover:text-rose-500 transition-colors">
                Disukai
              </span>
            </Link>

            {/* Pintasan 4: Profil */}
            <Link
              href="/akun/profil"
              className="p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2.5 group-hover:bg-[#263b46] group-hover:text-white transition-colors">
                <User size={22} />
              </div>
              <span className="text-xs font-bold text-[#263b46] group-hover:text-[#263b46] transition-colors">
                Profil Akun
              </span>
            </Link>
          </div>
        </div>

        {/* 3. Empty State atau Pesanan Terbaru (Exact Foto 2) */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e4ebef] p-10 sm:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center mx-auto mb-3">
              <Car size={26} />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#263b46]">
              Belum Ada Pesanan
            </h3>
            <p className="text-xs text-[#73848e] max-w-md mx-auto mt-1 leading-relaxed">
              Mulai jelajahi wisata petualangan terbaik di Banyuwangi dengan armada Jeep Trooper 4x4 dan temukan paket liburan impian Anda.
            </p>
            <Link
              href="/sewa"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-bold shadow-xs transition"
            >
              <Compass size={14} />
              <span>Buka Katalog Wisata</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4ebef] p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f6]">
              <h2 className="text-sm font-bold text-[#263b46]">
                Pesanan Terkini
              </h2>
              <Link
                href="/pesanan"
                className="text-xs font-bold text-[#327691] hover:underline flex items-center gap-1"
              >
                <span>Semua Pesanan ({orders.length})</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {orders.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#f8fafc] border border-[#e4ebef] hover:border-[#327691] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#53636d] bg-white px-2 py-0.5 rounded border border-[#e4ebef]">
                        {b.id}
                      </span>
                      <span className="text-xs font-bold text-[#327691]">
                        {bookingStatus[b.booking_status] || b.booking_status}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#263b46] mt-1">
                      {b.product_name}
                    </h3>
                    <p className="text-xs text-[#73848e] mt-0.5 flex items-center gap-2">
                      <Calendar size={12} />
                      <span>{b.service_date} · {b.num_units} Unit</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-neutral-200">
                    <span className="font-bold text-sm text-[#263b46]">
                      {formatIDR(b.total_amount)}
                    </span>
                    <Link
                      href={`/pesanan/${b.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#327691] hover:text-white border border-[#e4ebef] text-[#263b46] text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <span>Detail</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BuyerPortalLayout>
  );
}
