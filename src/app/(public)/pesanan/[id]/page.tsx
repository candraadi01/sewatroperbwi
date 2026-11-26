import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuyer } from "@/lib/auth/helpers";
import { getBookingById } from "@/lib/services/booking";
import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
import { formatIDR } from "@/lib/utils/currency";
import { PaymentButton } from "@/components/PaymentButton";
import { BookingSuccessCheckmark } from "@/components/booking/BookingSuccessCheckmark";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  Phone,
  ArrowLeft,
  MessageCircle,
  FileText,
  Ticket,
  XCircle,
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

export default async function Order({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireBuyer("/pesanan/" + encodeURIComponent(id));
  const [b, settings] = await Promise.all([
    getBookingById(id),
    getSiteSettings(),
  ]);
  if (!b) notFound();

  const contact = whatsappLink(
    settings.contact_whatsapp,
    `Halo Admin Sewa Trooper, saya pemesan #${b.id} untuk paket ${b.product_name} tanggal ${b.service_date}. Mohon info status pemesanan saya. Terima kasih!`
  );

  const approvalExpired =
    b.booking_status === "approved" &&
    !!b.approval_expires_at &&
    new Date(b.approval_expires_at) < new Date();

  const isPaid =
    b.amount_paid > 0 ||
    ["confirmed", "payment_received", "in_progress"].includes(b.booking_status);

  const isFullyPaid =
    isPaid && (b.remaining_amount <= 0 || b.amount_paid >= b.total_amount);

  const isApproved = [
    "approved",
    "pending_payment",
    "payment_received",
    "confirmed",
    "in_progress",
    "completed",
  ].includes(b.booking_status);

  const isCancelled = ["cancelled", "rejected"].includes(b.booking_status);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 font-sans">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/pesanan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#327691] hover:text-[#263b46] bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Riwayat Booking</span>
          </Link>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            #{b.id}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        {/* CARD 1: Status Banner & Stepper */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 text-center">
          <div className="mb-3.5 flex items-center justify-center">
            {isCancelled ? (
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-xs">
                <XCircle size={32} />
              </div>
            ) : (
              <BookingSuccessCheckmark size={56} />
            )}
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {isCancelled
              ? "Booking Dibatalkan"
              : isPaid
              ? "Jadwal Trip Terkonfirmasi!"
              : b.booking_status === "approved"
              ? "Armada Siap • Menunggu Pembayaran"
              : "Booking Berhasil Diajukan!"}
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {isCancelled ? (
              b.cancellation_reason || "Reservasi ini telah dibatalkan."
            ) : isPaid ? (
              <>Pembayaran {formatIDR(b.amount_paid)} telah diverifikasi. Jadwal trip Anda resmi terkunci.</>
            ) : b.booking_status === "approved" ? (
              <>Armada Jeep Trooper telah siap. Selesaikan pembayaran untuk mengonfirmasi jadwal Anda.</>
            ) : (
              <>
                Pesanan Anda sedang diverifikasi admin. Pembayaran (DP atau Lunas) dapat dilakukan setelah pesanan disetujui.
              </>
            )}
          </p>

          {/* Stepper Horizontal Ringkas (3 Tahap Utama) */}
          {!isCancelled && (
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              {/* Step 1 */}
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto shadow-2xs">
                  ✓
                </div>
                <p className="font-bold text-[11px] sm:text-xs text-slate-900">Diajukan</p>
                <p className="text-[10px] text-emerald-600 font-medium">Tercatat</p>
              </div>

              {/* Step 2 */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center mx-auto shadow-2xs ${
                    isApproved
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white animate-pulse"
                  }`}
                >
                  {isApproved ? "✓" : "2"}
                </div>
                <p className="font-bold text-[11px] sm:text-xs text-slate-900">Konfirmasi</p>
                <p className="text-[10px] font-medium text-slate-500">
                  {isApproved ? "Disetujui" : "Sedang dicek"}
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-1">
                <div
                  className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center mx-auto shadow-2xs ${
                    isPaid
                      ? "bg-emerald-600 text-white"
                      : b.booking_status === "approved"
                      ? "bg-[#327691] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isPaid ? "✓" : "3"}
                </div>
                <p className="font-bold text-[11px] sm:text-xs text-slate-900">Pembayaran</p>
                <p className="text-[10px] font-medium text-slate-500">
                  {isPaid ? "Lunas" : b.booking_status === "approved" ? "Buka" : "Setelah ACC"}
                </p>
              </div>
            </div>
          )}

          {/* Action jika status Disetujui (Approved) & belum bayar */}
          {b.booking_status === "approved" && !approvalExpired && (
            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Batas Waktu Pembayaran</span>
                {b.approval_expires_at && (
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(b.approval_expires_at).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })} WIB
                  </span>
                )}
              </div>
              <PaymentButton
                code={b.id}
                totalAmount={b.total_amount}
                dpAmount={
                  b.amount_to_pay && b.amount_to_pay < b.total_amount
                    ? b.amount_to_pay
                    : Math.round(b.total_amount * 0.3)
                }
                defaultChoice={b.payment_choice === "full" ? "full" : "dp"}
              />
            </div>
          )}

          {/* Action jika sudah bayar: Akses Tiket & Kwitansi */}
          {isPaid && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2.5 flex-wrap">
              <Link
                href={`/buyer/pesanan/${b.id}/tiket`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#327691] hover:bg-[#265b70] text-white font-bold text-xs transition shadow-2xs"
              >
                <Ticket size={14} />
                <span>Buka E-Tiket Wisata</span>
              </Link>
              <Link
                href={`/pesanan/${b.id}/nota`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
              >
                <FileText size={14} />
                <span>Lihat Nota / Kwitansi</span>
              </Link>
            </div>
          )}
        </div>

        {/* CARD 2: Rincian Pesanan (To The Point & Rapi) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#327691] block">
                Paket Sewa Terpilih
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {b.product_name}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap shrink-0">
              {b.num_units} Unit Jeep
            </span>
          </div>

          {/* Grid Informasi Inti */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar size={15} className="text-[#327691] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Jadwal Trip</span>
                <p className="font-bold text-slate-800">{formatIndonesianDate(b.service_date)}</p>
                <p className="text-slate-500 text-[11px]">Pukul {b.start_time?.slice(0, 5)} WIB</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Users size={15} className="text-[#327691] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Peserta</span>
                <p className="font-bold text-slate-800">{b.num_passengers} Orang</p>
                <p className="text-slate-500 text-[11px]">{b.num_units} Unit Trooper 4x4</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin size={15} className="text-[#327691] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Titik Jemput</span>
                <p className="font-bold text-slate-800 truncate">{b.pickup_address || "Banyuwangi Kota"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Phone size={15} className="text-[#327691] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kontak Pemesan</span>
                <p className="font-bold text-slate-800 truncate">{b.contact_name}</p>
                <p className="text-slate-500 text-[11px] truncate">{b.contact_phone}</p>
              </div>
            </div>
          </div>

          {/* Rincian Finansial & Status */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Total Biaya Sewa</span>
              <span className="text-sm font-black text-slate-900">{formatIDR(b.total_amount)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Status Pembayaran</span>
              <span className="font-bold px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                {b.remaining_amount <= 0 && isPaid
                  ? "Lunas"
                  : isPaid
                  ? `DP Terbayar (${formatIDR(b.amount_paid)})`
                  : isApproved
                  ? "Siap Dibayar"
                  : "Menunggu Konfirmasi Admin"}
              </span>
            </div>

            {/* Jika DP dan masih ada sisa pelunasan */}
            {isPaid && b.remaining_amount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-amber-950">Sisa Pelunasan:</span>
                  <span className="font-black text-amber-950">{formatIDR(b.remaining_amount)}</span>
                </div>
                <PaymentButton
                  code={b.id}
                  label={`Bayar Pelunasan (${formatIDR(b.remaining_amount)})`}
                />
              </div>
            )}
          </div>
        </div>

        {/* CARD Kontak Driver & Admin jika sudah Lunas 100% */}
        {isFullyPaid && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone size={15} className="text-[#327691]" />
                <span>Kontak Layanan & Driver</span>
              </h3>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Siap Dihubungi
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Admin Operasional</span>
                  <p className="font-bold text-slate-800">{settings.contact_whatsapp || "081234567890"}</p>
                </div>
                <a
                  href={
                    whatsappLink(
                      settings.contact_whatsapp || "081234567890",
                      `Halo Admin Sewa Trooper, saya ${b.contact_name} pemesan #${b.id}.`
                    ) || "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={13} />
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Driver Lapangan</span>
                  <p className="font-bold text-slate-800">{b.assigned_driver_name || "Koordinator Driver"}</p>
                </div>
                <a
                  href={
                    whatsappLink(
                      b.assigned_driver_phone || "085234567899",
                      `Halo Driver Sewa Trooper, saya ${b.contact_name} pemesan #${b.id}.`
                    ) || "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={13} />
                  <span>Chat WhatsApp Driver</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link
            href="/pesanan"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition"
          >
            Lihat Riwayat Booking
          </Link>

          {contact && (
            <a
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition"
            >
              <MessageCircle size={14} />
              <span>Butuh Bantuan? Hubungi Admin</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
