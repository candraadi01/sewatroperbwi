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

  const waDriverLink =
    b.assigned_driver_phone && (isConfirmed || isFullyPaid)
      ? `https://wa.me/62${b.assigned_driver_phone.replace(/^0/, "")}?text=${encodeURIComponent(
          `Halo ${b.assigned_driver_name || "Driver"}, saya ${b.contact_name} pemesan Jeep Trooper #${b.id} untuk trip ${b.service_date}.`
        )}`
      : "";

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

          {/* NOTIFIKASI KHUSUS JIKA SUDAH DISETUJUI ADMIN */}
          {isApproved && !approvalExpired && (
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border-2 border-emerald-500 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
                    ✓
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-black uppercase tracking-wide">
                      Persetujuan Admin Diterima
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 dark:text-emerald-200 mt-1">
                      Armada Siap! Segera Selesaikan Pembayaran
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-300 mt-1 leading-relaxed">
                      Jadwal dan unit Jeep Trooper Anda telah dikunci sementara. Selesaikan pembayaran{" "}
                      <strong>{formatIDR(b.amount_to_pay)}</strong> ({b.payment_choice === "dp" ? "Uang Muka / DP" : "Tarif Penuh"}) melalui Midtrans.
                    </p>
                    {b.approval_expires_at && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>Batas Waktu Bayar: {new Date(b.approval_expires_at).toLocaleString("id-ID")} WIB</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <PaymentButton
                    code={b.id}
                    label={`Bayar ${formatIDR(b.amount_to_pay)} Sekarang`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFIKASI JIKA KENDARAAN SUDAH TERKONFIRMASI */}
          {isConfirmed && (
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                    Kendaraan Terkonfirmasi &amp; Jadwal Perjalanan Terkunci!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Pembayaran telah diverifikasi. Anda dapat mencetak <strong>E-Tiket Resmi</strong> atau menyimpan <strong>Kwitansi Pembayaran</strong>. Driver dan armada siap melayani petualangan Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFIKASI MENUNGGU KONFIRMASI ADMIN */}
          {b.booking_status === "pending_payment" && (
            <div className="mt-6 p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-800">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-extrabold text-sky-950 dark:text-sky-200">
                    Menunggu Konfirmasi Admin
                  </h3>
                  <p className="text-xs text-sky-800 dark:text-sky-300 mt-0.5">
                    Permintaan booking Anda sedang diperiksa ketersediaan armadanya oleh admin dan pemilik kendaraan. Anda akan menerima notifikasi segera setelah disetujui.
                  </p>
                </div>
              </div>
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

            {/* Driver & Vehicle Box (if assigned or confirmed) */}
            {isConfirmed && (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-emerald-300 dark:border-emerald-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <span>Driver &amp; Armada Ditugaskan</span>
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Siap Berangkat
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-extrabold text-[#1e293b] dark:text-neutral-100">
                      {b.assigned_driver_name || "Pak Slamet Hidayat"}
                    </div>
                    <div className="text-xs text-[#64748b] dark:text-neutral-400">
                      Plat: <span className="font-mono font-bold text-[#1e293b] dark:text-neutral-200">{b.assigned_vehicle_plate || "P 1888 VJ"}</span> · {b.assigned_vehicle_model || "Isuzu Trooper 4x4 Offroad"}
                    </div>
                    <div className="text-xs text-[#64748b] dark:text-neutral-400">
                      Telepon: {b.assigned_driver_phone || "085234567899"}
                    </div>
                  </div>

                  {waDriverLink && (
                    <a
                      href={waDriverLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shrink-0"
                    >
                      <Phone size={14} />
                      <span>WhatsApp Driver</span>
                    </a>
                  )}
                </div>
              </div>
            )}

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
