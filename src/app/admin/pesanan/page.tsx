import Link from "next/link";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { OrderActions } from "@/components/admin/OrderActions";
import {
  Calendar,
  Clock,
  Car,
  Users,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function formatIndonesianDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const bookings = await getAllBookings();
  const pendingCount = bookings.filter((b) => b.booking_status === "pending_review").length;
  const approvedCount = bookings.filter((b) => b.booking_status === "approved").length;
  const confirmedCount = bookings.filter((b) => ["payment_received", "confirmed"].includes(b.booking_status)).length;

  const rows = bookings.filter(
    (b) =>
      (!q.status || b.booking_status === q.status) &&
      (!q.q ||
        `${b.id} ${b.contact_name} ${b.contact_phone} ${b.product_name}`
          .toLowerCase()
          .includes(q.q.toLowerCase())),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Halaman */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e4ebef] dark:border-neutral-800">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] bg-[#e9f3f7] dark:bg-neutral-800 px-2.5 py-1 rounded-full border border-[#d2e4ec] dark:border-neutral-700 inline-block mb-1.5">
              Operasional &amp; Konfirmasi Armada
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-neutral-100 tracking-tight">
              Daftar Pesanan Masuk
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Kelola konfirmasi ketersediaan unit Jeep Trooper 4x4 dan pantau alur booking buyer secara real-time.
            </p>
          </div>

          {pendingCount > 0 && (
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500 text-white text-xs sm:text-sm font-black flex items-center gap-2.5 shadow-md shadow-amber-500/25 shrink-0 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>{pendingCount} Pesanan Baru Menunggu ACC!</span>
            </div>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/admin/pesanan"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              !q.status
                ? "bg-[#263b46] text-white shadow-xs"
                : "bg-white dark:bg-neutral-800 hover:bg-slate-100 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
            }`}
          >
            <span>Semua ({bookings.length})</span>
          </Link>
          <Link
            href="/admin/pesanan?status=pending_review"
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-2xs ${
              q.status === "pending_review"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 hover:bg-amber-100"
            }`}
          >
            <span>⏳ Menunggu Persetujuan ({pendingCount})</span>
          </Link>
          <Link
            href="/admin/pesanan?status=approved"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              q.status === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            <span>✓ Siap Bayar ({approvedCount})</span>
          </Link>
          <Link
            href="/admin/pesanan?status=confirmed"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              q.status === "confirmed"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 border border-sky-300 hover:bg-sky-100"
            }`}
          >
            <span>🚗 Terkonfirmasi ({confirmedCount})</span>
          </Link>
        </div>
      </header>

      {/* Form Pencarian & Filter Cepat */}
      <form className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 p-4 shadow-xs grid sm:grid-cols-[1.5fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Search size={12} className="text-[#327691]" />
            <span>Pencarian Cepat</span>
          </label>
          <input
            type="search"
            name="q"
            defaultValue={q.q || ""}
            maxLength={100}
            placeholder="Cari kode booking, nama pemesan, rute, atau HP…"
            className="w-full text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 bg-slate-50 dark:bg-neutral-800 focus:bg-white border border-slate-200 dark:border-neutral-700 focus:border-[#327691] rounded-xl px-3.5 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter size={12} className="text-[#327691]" />
            <span>Filter Status</span>
          </label>
          <select
            name="status"
            defaultValue={q.status || ""}
            className="w-full text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-100 bg-slate-50 dark:bg-neutral-800 focus:bg-white border border-slate-200 dark:border-neutral-700 focus:border-[#327691] rounded-xl px-3 py-2.5 outline-hidden transition shadow-2xs cursor-pointer"
          >
            <option value="">Semua Status Operasional</option>
            {Object.entries(bookingStatus).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#327691] hover:bg-[#263b46] text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
        >
          <Search size={14} />
          <span>Cari</span>
        </button>
      </form>

      {/* List Kartu Pesanan Profesional */}
      <div className="space-y-5">
        {rows.map((b) => {
          const isPending = b.booking_status === "pending_review";
          const isApproved = b.booking_status === "approved";
          const isConfirmed = ["payment_received", "confirmed"].includes(b.booking_status);

          return (
            <article
              key={b.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs bg-white dark:bg-neutral-900 ${
                isPending
                  ? "border-amber-400 dark:border-amber-600 ring-2 ring-amber-100 dark:ring-amber-950/40"
                  : isApproved
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/10"
                  : isConfirmed
                  ? "border-sky-300 dark:border-sky-700 bg-sky-50/10"
                  : "border-slate-200 dark:border-neutral-800 hover:border-slate-300"
              }`}
            >
              {/* Header Kartu: Kode Booking & Status */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs sm:text-sm font-black text-[#327691] dark:text-[#8abbd0] px-3 py-1 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200/90 dark:border-neutral-700 shadow-2xs">
                    #{b.id}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>
                      {new Date(b.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isPending ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Menunggu Konfirmasi Admin
                    </span>
                  ) : isApproved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                      ✓ Disetujui (Menunggu Bayar)
                    </span>
                  ) : isConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200 border border-sky-300">
                      🚗 Armada Terkonfirmasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border border-slate-200">
                      {bookingStatus[b.booking_status] || b.booking_status}
                    </span>
                  )}
                </div>
              </div>

              {/* Isi Utama Kartu: 2 Kolom Responsif */}
              <div className="p-4 sm:p-6 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
                {/* Kolom Kiri: Rincian Paket, Kontak Pemesan, Titik Jemput & Finansial */}
                <div className="space-y-4">
                  {/* Judul Paket & Spesifikasi */}
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-neutral-100 tracking-tight">
                      {b.product_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e9f3f7] dark:bg-neutral-800 text-[#263b46] dark:text-[#8abbd0] font-bold border border-[#d2e4ec] dark:border-neutral-700">
                        <Calendar size={13} className="text-[#327691]" />
                        <span>{formatIndonesianDate(b.service_date)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold border border-slate-200 dark:border-neutral-700">
                        <Clock size={13} className="text-[#327691]" />
                        <span>Pukul {b.start_time?.slice(0, 5)} WIB</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold border border-slate-200 dark:border-neutral-700">
                        <Car size={13} className="text-[#327691]" />
                        <span>{b.num_units} Unit Trooper 4x4</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold border border-slate-200 dark:border-neutral-700">
                        <Users size={13} className="text-[#327691]" />
                        <span>{b.num_passengers} Orang</span>
                      </span>
                    </div>
                  </div>

                  {/* Tile Kontak Pemesan & Titik Jemput */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {/* Kontak Pemesan */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">
                        Identitas Pemesan
                      </span>
                      <p className="font-black text-slate-900 dark:text-neutral-100 text-sm">
                        {b.contact_name}
                      </p>
                      <div className="space-y-1 text-slate-600 dark:text-neutral-300">
                        <a
                          href={`https://wa.me/62${b.contact_phone.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          <Phone size={12} className="shrink-0" />
                          <span>{b.contact_phone}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-normal">WA ↗</span>
                        </a>
                        <p className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 truncate">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{b.contact_email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Titik Jemput & Catatan */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">
                        Titik Penjemputan
                      </span>
                      <p className="font-bold text-slate-800 dark:text-neutral-200 flex items-start gap-1.5">
                        <MapPin size={13} className="text-[#327691] shrink-0 mt-0.5" />
                        <span className="leading-snug">{b.pickup_address || "Titik awal layanan / Kota Banyuwangi"}</span>
                      </p>
                      {b.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 italic pt-1 border-t border-slate-200/60">
                          &ldquo;{b.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ringkasan Finansial */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-[#f0f7fa] dark:from-neutral-800 dark:to-neutral-800/70 border border-slate-200/80 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                        Total Nilai Sewa
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#263b46] dark:text-neutral-100">
                        {formatIDR(b.total_amount)}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 dark:text-neutral-400 space-y-0.5">
                      <p>
                        Terverifikasi: <strong className="text-slate-800 dark:text-neutral-200">{formatIDR(b.amount_paid)}</strong>
                      </p>
                      <p>
                        Sisa: <strong className="text-slate-800 dark:text-neutral-200">{formatIDR(b.remaining_amount)}</strong>
                      </p>
                    </div>

                    <div>
                      <Link
                        href={"/pesanan/" + b.id}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#327691] dark:text-[#8abbd0] hover:underline bg-white dark:bg-neutral-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-600 shadow-2xs transition"
                      >
                        <span>Lihat Rincian Buyer</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Aksi Operasional (Setujui / Tolak / Konfirmasi) */}
                <div className="bg-slate-50/80 dark:bg-neutral-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-neutral-700 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block pb-2 border-b border-slate-200 dark:border-neutral-700">
                    Aksi Operasional Admin
                  </span>

                  <OrderActions
                    id={b.database_id}
                    status={b.booking_status}
                    currentStartTime={b.start_time}
                  />
                </div>
              </div>
            </article>
          );
        })}

        {/* Empty State */}
        {!rows.length && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 p-12 sm:p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 text-slate-400 flex items-center justify-center mx-auto mb-3 text-3xl">
              📋
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-neutral-200">
              Tidak Ada Pesanan Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {q.status || q.q
                ? "Coba ubah kata kunci pencarian atau reset filter status."
                : "Belum ada pesanan masuk. Saat buyer mengajukan sewa Jeep Trooper, pesanan akan langsung tampil di sini."}
            </p>
            {(q.status || q.q) && (
              <div className="mt-5">
                <Link
                  href="/admin/pesanan"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <span>Reset Filter</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
