import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuyer } from "@/lib/auth/helpers";
import { getBookingById, getBookingHistory } from "@/lib/services/booking";
import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { PaymentButton } from "@/components/PaymentButton";
import {
  Calendar,
  Clock,
  Users,
  Car,
  MapPin,
  Receipt,
  Printer,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Info,
  Check,
  MessageCircle,
  Lock,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Detail Pesanan #${id} | Portal Pelanggan Sewa Trooper BWI`,
    description: `Detail reservasi dan status perjalanan wisata #${id}`,
  };
}

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireBuyer(`/buyer/pesanan/${encodeURIComponent(id)}`);

  const [b, settings] = await Promise.all([
    getBookingById(id),
    getSiteSettings(),
  ]);

  if (!b) notFound();

  const history = await getBookingHistory(b.database_id);
  const csWhatsapp = whatsappLink(
    settings.contact_whatsapp,
    `Halo Admin Sewa Trooper BWI, saya ingin bertanya mengenai pesanan #${b.id} (${b.product_name}).`
  );

  const isApproved = b.booking_status === "approved";
  const isConfirmed = ["confirmed", "payment_received", "in_progress"].includes(b.booking_status);
  const isCompleted = b.booking_status === "completed";
  const isCancelled = ["cancelled_by_admin", "cancelled_by_buyer", "rejected"].includes(b.booking_status);

  const isFullyPaid =
    b.remaining_amount <= 0 ||
    b.amount_paid >= b.total_amount ||
    b.payment_status === "settlement";

  const approvalExpired =
    isApproved &&
    !!b.approval_expires_at &&
    new Date(b.approval_expires_at) < new Date();

  const adminPhone = settings.contact_whatsapp || "081234567890";
  const driverPhone = b.assigned_driver_phone || "085234567899";
  const waAdminLink =
    whatsappLink(
      adminPhone,
      `Halo Admin Sewa Trooper, saya ${b.contact_name} pemesan #${b.id} untuk trip ${b.service_date}. Pembayaran saya sudah selesai. Mohon konfirmasi jadwal & koordinasinya ya.`
    ) || "#";
  const waDriverLink =
    whatsappLink(
      driverPhone,
      `Halo Driver Sewa Trooper, saya ${b.contact_name} pemesan #${b.id} untuk penjemputan trip ${b.service_date}. Pembayaran saya telah selesai. Mohon info titik jemput dan waktu ya.`
    ) || "#";

  const statusLabel = bookingStatus[b.booking_status] || b.booking_status;

  return (
    <BuyerPortalLayout user={user} activeMenu="pesanan">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            href="/buyer/pesanan"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#327691] dark:text-[#8abbd0] hover:underline"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Riwayat Booking Saya</span>
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f0f4f6] dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-sm sm:text-base font-extrabold text-[#327691] dark:text-[#8abbd0] px-3.5 py-1.5 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800">
                  #{b.id}
                </span>
                <span
                  className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 ${
                    isApproved
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                      : isConfirmed
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                      : isCancelled
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200"
                      : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200"
                  }`}
                >
                  {isConfirmed && <Check size={14} />}
                  {statusLabel}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1e293b] dark:text-neutral-100 mt-3">
                {b.product_name}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 mt-1">
                Dipesan pada {new Date(b.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })} WIB
              </p>
            </div>

            {/* Quick action buttons in header */}
            <div className="flex items-center gap-2 flex-wrap">
              {isConfirmed && (
                <>
                  <Link
                    href={`/buyer/pesanan/${b.id}/tiket`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] hover:bg-[#d5e9f1] text-xs sm:text-sm font-bold transition"
                  >
                    <Printer size={16} />
                    <span>E-Tiket</span>
                  </Link>
                  <Link
                    href={`/buyer/pesanan/${b.id}/nota`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 text-xs sm:text-sm font-bold transition"
                  >
                    <Receipt size={16} />
                    <span>Kwitansi / Nota</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* NOTIFIKASI KHUSUS JIKA SUDAH DISETUJUI ADMIN (PILIHAN DP ATAU LUNAS) */}
          {isApproved && !approvalExpired && (
            <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-700 space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Pesanan Disetujui Admin — Silakan Lakukan Pembayaran</span>
                </h2>
                <p className="text-xs text-amber-900/90 dark:text-amber-300 mt-1 leading-relaxed">
                  Admin telah mengonfirmasi kesiapan armada Anda. Silakan pilih metode pembayaran di bawah (<strong>Bayar DP 30%</strong> atau <strong>Bayar Lunas 100%</strong>) untuk mengunci jadwal trip secara resmi.
                </p>
                {b.approval_expires_at && (
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-bold mt-2 flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Batas Waktu Pembayaran: {new Date(b.approval_expires_at).toLocaleString("id-ID")} WIB</span>
                  </p>
                )}
              </div>

              {/* 2 Pilihan Pembayaran: DP vs Lunas */}
              <PaymentButton
                code={b.id}
                totalAmount={b.total_amount}
                dpAmount={b.amount_to_pay && b.amount_to_pay < b.total_amount ? b.amount_to_pay : Math.round(b.total_amount * 0.3)}
                defaultChoice={b.payment_choice === "full" ? "full" : "dp"}
              />
            </div>
          )}

          {/* NOTIFIKASI JIKA PEMBAYARAN TELAH SELESAI (KWITANSI & KONTAK ADMIN/DRIVER) */}
          {isConfirmed && (
            <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-400 dark:border-emerald-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <span>Pembayaran Terverifikasi & Jadwal Terkunci!</span>
                  </h2>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Kwitansi resmi dan E-Tiket perjalanan Anda telah terbit. Simpan atau cetak untuk bukti penjemputan.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/pesanan/${b.id}/nota`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition"
                  >
                    <Receipt size={15} />
                    <span>🧾 Buka Kwitansi Resmi</span>
                  </Link>
                  <Link
                    href={`/buyer/pesanan/${b.id}/tiket`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-600 text-emerald-800 dark:text-emerald-200 font-bold text-xs shadow-2xs hover:bg-emerald-50 transition"
                  >
                    <Printer size={15} />
                    <span>🎫 E-Tiket Wisata</span>
                  </Link>
                </div>
              </div>

              {/* Opsi Pelunasan Sisa Tagihan Online Via Web */}
              {!isFullyPaid && b.remaining_amount > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
                      <CreditCard size={16} className="text-[#327691]" />
                      Pelunasan Sisa Pembayaran (Via Web)
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-900 bg-white dark:bg-neutral-800 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                      Sisa Tagihan: {formatIDR(b.remaining_amount)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 dark:text-amber-300 leading-relaxed">
                    Uang Muka (DP) sebesar <strong>{formatIDR(b.amount_paid)}</strong> telah diterima. Seluruh sisa pelunasan wajib diselesaikan secara online melalui website ini (tanpa melalui driver) sebelum keberangkatan trip.
                  </p>
                  <div className="w-full sm:max-w-xs">
                    <PaymentButton
                      code={b.id}
                      label={`Bayar Pelunasan Sekarang (${formatIDR(b.remaining_amount)})`}
                    />
                  </div>
                </div>
              )}

              {/* Nomor Kontak Penting: No Admin // No Driver (HANYA DIBERIKAN JIKA SUDAH LUNAS 100%) */}
              <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80">
                {isFullyPaid ? (
                  <>
                    <h3 className="text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <Phone size={15} className="text-[#327691]" />
                      <span>Nomor Kontak Penting (No Admin // No Driver)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Admin */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-2xs space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block">
                            1. Nomor Admin Reservasi
                          </span>
                          <p className="font-extrabold text-slate-800 dark:text-neutral-100 text-xs sm:text-sm">
                            Admin Operasional
                          </p>
                          <p className="text-xs font-mono font-bold text-[#327691] dark:text-[#8abbd0]">
                            {adminPhone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <a
                            href={waAdminLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center transition flex items-center justify-center gap-1"
                          >
                            <MessageCircle size={13} />
                            <span>Chat WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${adminPhone}`}
                            className="py-1.5 px-2.5 bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 text-slate-700 dark:text-neutral-200 font-bold text-[11px] rounded-lg text-center transition"
                          >
                            Telepon
                          </a>
                        </div>
                      </div>

                      {/* Driver */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-2xs space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block">
                            2. Nomor Driver Lapangan
                          </span>
                          <p className="font-extrabold text-slate-800 dark:text-neutral-100 text-xs sm:text-sm truncate">
                            {b.assigned_driver_name || "Koordinator Driver Lapangan"}
                          </p>
                          <p className="text-xs font-mono font-bold text-[#327691] dark:text-[#8abbd0]">
                            {driverPhone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <a
                            href={waDriverLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center transition flex items-center justify-center gap-1"
                          >
                            <MessageCircle size={13} />
                            <span>Chat WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${driverPhone}`}
                            className="py-1.5 px-2.5 bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 text-slate-700 dark:text-neutral-200 font-bold text-[11px] rounded-lg text-center transition"
                          >
                            Telepon
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                        Nomor Kontak Admin & Driver Terkunci
                      </h4>
                      <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Nomor kontak resmi Admin dan Driver lapangan akan otomatis terbuka setelah seluruh pembayaran Anda <strong>Lunas 100%</strong> melalui website.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFIKASI MENUNGGU KONFIRMASI ADMIN */}
          {b.booking_status === "pending_payment" && (
            <div className="mt-6 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 flex items-center gap-3">
              <Clock size={17} className="text-sky-600 shrink-0" />
              <p className="text-xs font-semibold text-sky-900 dark:text-sky-300">
                Permintaan booking sedang ditinjau admin. Anda akan dihubungi setelah disetujui.
              </p>
            </div>
          )}
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Trip Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-6 shadow-xs space-y-5">
              <h2 className="text-base sm:text-lg font-black text-[#1e293b] dark:text-neutral-100 flex items-center gap-2">
                <Car size={18} className="text-[#327691]" />
                <span>Rincian Perjalanan Wisata</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block mb-1">
                    Tanggal Pelaksanaan
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                    <Calendar size={15} className="text-[#327691]" />
                    <span>{b.service_date}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block mb-1">
                    Waktu Keberangkatan
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                    <Clock size={15} className="text-[#327691]" />
                    <span>Pukul {b.start_time?.slice(0, 5) || "08:00"} WIB</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block mb-1">
                    Armada &amp; Kapasitas
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                    <Car size={15} className="text-[#327691]" />
                    <span>{b.num_units} Unit ({b.num_passengers} Peserta)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block mb-1">
                    Kontak Pemesan
                  </span>
                  <div className="text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                    {b.contact_name} ({b.contact_phone})
                  </div>
                </div>
              </div>

              {b.pickup_address && (
                <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block mb-1">
                    Titik Penjemputan
                  </span>
                  <div className="flex items-start gap-2 text-sm font-bold text-[#1e293b] dark:text-neutral-100">
                    <MapPin size={16} className="text-[#327691] shrink-0 mt-0.5" />
                    <span>{b.pickup_address}</span>
                  </div>
                </div>
              )}

              {b.notes && (
                <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/60 border border-[#e4ebef] dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block mb-1">
                    Catatan Tambahan
                  </span>
                  <p className="text-xs text-[#64748b] dark:text-neutral-300">{b.notes}</p>
                </div>
              )}
            </div>

            {/* Timeline / Status History */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-[#1e293b] dark:text-neutral-100 flex items-center gap-2">
                  <Clock size={16} className="text-[#327691]" />
                  <span>Riwayat Status Pemesanan</span>
                </h3>

                <div className="space-y-3 pl-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#327691] mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-[#1e293b] dark:text-neutral-200">
                          {bookingStatus[h.new_status] || h.new_status}
                        </span>
                        {h.reason && (
                          <span className="text-[#64748b] dark:text-neutral-400 ml-1.5">
                            — {h.reason}
                          </span>
                        )}
                        <p className="text-[10px] text-[#8e9da5]">
                          {new Date(h.created_at).toLocaleString("id-ID")} WIB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Financial & Actions (1 col) */}
          <div className="space-y-6">
            {/* Financial Summary Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-black text-[#1e293b] dark:text-neutral-100 flex items-center gap-2">
                <CreditCard size={18} className="text-[#327691]" />
                <span>Rincian Pembayaran</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-[#64748b] dark:text-neutral-400">
                  <span>Total Tarif Sewa</span>
                  <span className="font-extrabold text-[#1e293b] dark:text-neutral-100">
                    {formatIDR(b.total_amount)}
                  </span>
                </div>

                <div className="flex justify-between text-[#64748b] dark:text-neutral-400">
                  <span>Pilihan Pembayaran</span>
                  <span className="font-bold text-[#1e293b] dark:text-neutral-100">
                    {b.payment_choice === "dp" ? "Uang Muka (DP 30%)" : "Tarif Penuh (100%)"}
                  </span>
                </div>

                <div className="flex justify-between text-[#64748b] dark:text-neutral-400">
                  <span>Sudah Dibayar</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatIDR(b.amount_paid)}
                  </span>
                </div>

                {b.remaining_amount > 0 && (
                  <div className="flex justify-between text-[#64748b] dark:text-neutral-400">
                    <span>Sisa Pelunasan</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                      {formatIDR(b.remaining_amount)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#f0f4f6] dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#8e9da5]">Status Bayar</span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#327691] dark:text-[#8abbd0]">
                    {b.payment_status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {isApproved && (
                  <div className="w-full">
                    <PaymentButton
                      code={b.id}
                      label={`Bayar ${formatIDR(b.amount_to_pay)}`}
                    />
                  </div>
                )}

                {isConfirmed && !isFullyPaid && b.remaining_amount > 0 && (
                  <div className="w-full">
                    <PaymentButton
                      code={b.id}
                      label={`Bayar Pelunasan ${formatIDR(b.remaining_amount)}`}
                    />
                  </div>
                )}

                {isConfirmed && (
                  <>
                    <Link
                      href={`/buyer/pesanan/${b.id}/tiket`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition"
                    >
                      <Printer size={15} />
                      <span>Cetak / Unduh E-Tiket</span>
                    </Link>

                    <Link
                      href={`/buyer/pesanan/${b.id}/nota`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-xs transition"
                    >
                      <Receipt size={15} />
                      <span>Kwitansi / Nota Pembayaran</span>
                    </Link>
                  </>
                )}

                <a
                  href={csWhatsapp || "#"}
                  target={csWhatsapp ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#e4ebef] dark:border-neutral-700 hover:bg-[#f8fafc] dark:hover:bg-neutral-800 text-xs font-bold text-[#53636d] dark:text-neutral-300 transition"
                >
                  <Phone size={14} />
                  <span>Bantuan Admin WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BuyerPortalLayout>
  );
}
