import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuyer } from "@/lib/auth/helpers";
import { getBookingById, getBookingHistory } from "@/lib/services/booking";
import { getSiteSettings, whatsappLink } from "@/lib/services/settings";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { PaymentButton } from "@/components/PaymentButton";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  Car,
  Users,
  Phone,
  ArrowLeft,
  RotateCw,
  MessageCircle,
  FileText,
  Ticket,
  Sparkles,
  Check,
  CreditCard,
  Lock,
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
  const history = await getBookingHistory(b.database_id);
  const contact = whatsappLink(
    settings.contact_whatsapp,
    `Halo Admin Sewa Trooper, saya baru saja mengajukan booking #${b.id} untuk paket ${b.product_name} tanggal ${b.service_date}. Mohon konfirmasi ketersediaan armada dan driver ya. Terima kasih!`
  );
  const payable =
    b.remaining_amount > 0 &&
    ["approved", "pending_payment", "payment_received", "confirmed"].includes(
      b.booking_status
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

  // Status step calculation
  const isApproved = ["approved", "pending_payment", "payment_received", "confirmed", "in_progress", "completed"].includes(b.booking_status);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 md:pb-24 font-sans">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="container-app py-3 flex items-center justify-between gap-3">
          <Link
            href="/pesanan"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#263b46] bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Riwayat Booking Saya</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {b.id}
            </span>
          </div>
        </div>
      </div>

      <div className="container-app pt-6 sm:pt-8 max-w-3xl mx-auto space-y-6">
        {/* HERO CARD: Animasi Centang Hijau & Status Sukses Terkirim */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 text-center flex flex-col items-center">
          {/* Animasi Bouncy Pulse Green Checkmark */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 transition-transform duration-500 hover:scale-105">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25" />
              <svg
                className="w-9 h-9 sm:w-11 sm:h-11 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-300 mb-2.5 inline-flex items-center gap-1.5 shadow-2xs">
            {isPaid ? (
              <span className="text-emerald-700">Pembayaran Berhasil Terverifikasi</span>
            ) : b.booking_status === "approved" ? (
              <span className="text-emerald-700">Armada Siap • Menunggu Pembayaran</span>
            ) : (
              <>
                <Clock size={13} className="text-amber-600 animate-spin" />
                <span>Booking Diajukan • Menunggu Konfirmasi Admin</span>
              </>
            )}
          </span>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {isPaid
              ? "Jadwal Trip Anda Resmi Terkunci!"
              : b.booking_status === "approved"
              ? "Armada Siap! Silakan Selesaikan Pembayaran"
              : "Booking Berhasil Diajukan!"}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
            {isPaid ? (
              <>
                Pembayaran sebesar <strong>{formatIDR(b.amount_paid)}</strong> telah diterima. E-Tiket Anda siap digunakan saat penjemputan.
              </>
            ) : b.booking_status === "approved" ? (
              <>
                Admin & Pemilik telah mengonfirmasi kesiapan armada Jeep Trooper. Selesaikan pembayaran{" "}
                <strong>{b.payment_choice === "dp" ? `DP (${formatIDR(b.amount_to_pay)})` : `Lunas (${formatIDR(b.amount_to_pay)})`}</strong>{" "}
                agar unit terkunci resmi.
              </>
            ) : (
              <>
                Data reservasi Anda telah berhasil tercatat dengan Kode Booking <strong className="font-mono text-[#327691]">#{b.id}</strong>. Saat ini pesanan Anda sedang dalam proses verifikasi unit & driver oleh Admin.
              </>
            )}
          </p>

          {/* Kotak Informasi Khusus: Menunggu Konfirmasi & Pembayaran */}
          {!isApproved && !isPaid && (
            <div className="mt-6 w-full max-w-xl text-left bg-gradient-to-br from-amber-50/90 to-sky-50/70 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/80">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#327691]" />
                  Status Pengajuan & Ketentuan Pembayaran
                </span>
                <span className="text-[11px] font-extrabold text-amber-800 bg-white px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                  Menunggu ACC Admin
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-900">1. Pengajuan Booking Berhasil</p>
                    <p className="text-slate-600 text-[11.5px] mt-0.5 leading-snug">
                      Data pemesanan telah tersimpan aman di sistem kami dengan Kode Pesanan: <strong className="font-mono text-[#327691]">#{b.id}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ⏳
                  </span>
                  <div>
                    <p className="font-extrabold text-slate-900">2. Menunggu Konfirmasi Ketersediaan Unit</p>
                    <p className="text-slate-600 text-[11.5px] mt-0.5 leading-snug">
                      Admin & Tim Operasional sedang memverifikasi kesiapan armada Jeep Trooper dan driver untuk tanggal keberangkatan Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-[#327691] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    💳
                  </span>
                  <div>
                    <p className="font-extrabold text-[#263b46]">3. Pembayaran Dilakukan Setelah Di-ACC Admin</p>
                    <p className="text-slate-700 text-[11.5px] mt-0.5 leading-relaxed">
                      <strong>Anda belum perlu membayar sekarang</strong>. Pembayaran (pilihan DP 30% atau Lunas) baru dapat dilakukan setelah booking disetujui (di-ACC) oleh admin. Tombol pembayaran akan langsung aktif di halaman ini dan Anda juga akan dikonfirmasi melalui WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Akses Cepat Tombol Aksi & Pembayaran 2 Pilihan (DP / LUNAS) */}
          {b.booking_status === "approved" && !approvalExpired && (
            <div className="mt-6 w-full max-w-xl text-left space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Pesanan Telah Disetujui Admin! Silakan Lakukan Pembayaran</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  Admin telah menyetujui reservasi Anda. Silakan pilih metode pembayaran di bawah ini (<strong>Bayar DP 30%</strong> atau <strong>Bayar Lunas 100%</strong>) untuk mengonfirmasi jadwal trip Anda secara resmi.
                </p>
                {b.approval_expires_at && (
                  <p className="text-[11px] text-amber-800 font-bold flex items-center gap-1.5 pt-1 border-t border-amber-200">
                    <Clock size={13} />
                    <span>Batas Waktu Pembayaran: {new Date(b.approval_expires_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</span>
                  </p>
                )}
              </div>

              {/* 2 Pilihan Pembayaran: DP vs LUNAS */}
              <PaymentButton
                code={b.id}
                totalAmount={b.total_amount}
                dpAmount={b.amount_to_pay && b.amount_to_pay < b.total_amount ? b.amount_to_pay : Math.round(b.total_amount * 0.3)}
                defaultChoice={b.payment_choice === "full" ? "full" : "dp"}
              />
            </div>
          )}

          {/* Setelah Pembayaran Selesai: Kwitansi Resmi & Nomor Kontak (No Admin // No Driver) */}
          {isPaid && (
            <div className="mt-6 w-full max-w-xl text-left space-y-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={`/pesanan/${b.id}/nota`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
                >
                  <FileText size={16} />
                  <span>🧾 Buka Kwitansi / Nota Resmi</span>
                </Link>
                <Link
                  href={`/buyer/pesanan/${b.id}/tiket`}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 transition"
                >
                  <Ticket size={16} className="text-[#327691]" />
                  <span>🎫 Buka E-Tiket Wisata</span>
                </Link>
              </div>

              {/* Opsi Pelunasan Sisa Pembayaran Online Via Web */}
              {b.remaining_amount > 0 ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                      <CreditCard size={16} className="text-[#327691]" />
                      Pelunasan Sisa Pembayaran (Via Web)
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-900 bg-white px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                      Sisa Tagihan: {formatIDR(b.remaining_amount)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    Pembayaran DP sebesar <strong>{formatIDR(b.amount_paid)}</strong> telah diterima. Pembayaran sisa pelunasan wajib diselesaikan secara online melalui website ini sebelum hari keberangkatan trip.
                  </p>
                  <PaymentButton
                    code={b.id}
                    label={`Bayar Pelunasan Sekarang (${formatIDR(b.remaining_amount)})`}
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                  <span>Pembayaran Telah Lunas 100% via Website. Tidak ada tagihan tersisa.</span>
                </div>
              )}

              {/* Nomor Kontak Penting: No Admin // No Driver (HANYA DIBERIKAN JIKA SUDAH LUNAS 100%) */}
              {isFullyPaid ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Phone size={16} className="text-[#327691]" />
                      <span>Nomor Kontak Penting (No Admin // No Driver)</span>
                    </h3>
                    <span className="text-[10.5px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Siap Dihubungi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Kontak Admin */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          1. Nomor Admin Reservasi
                        </span>
                        <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                          Admin Operasional
                        </p>
                        <p className="text-xs font-mono font-bold text-[#327691]">
                          {settings.contact_whatsapp || "081234567890"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <a
                          href={
                            whatsappLink(
                              settings.contact_whatsapp || "081234567890",
                              `Halo Admin Sewa Trooper, saya ${b.contact_name} pemesan #${b.id} untuk trip ${b.service_date}. Pembayaran sudah berhasil dilakukan. Mohon konfirmasi jadwal & koordinasinya ya.`
                            ) || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center transition flex items-center justify-center gap-1"
                        >
                          <MessageCircle size={13} />
                          <span>Chat WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${settings.contact_whatsapp || "081234567890"}`}
                          className="py-1.5 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg text-center transition"
                        >
                          Telepon
                        </a>
                      </div>
                    </div>

                    {/* Kontak Driver */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          2. Nomor Driver Lapangan
                        </span>
                        <p className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
                          {b.assigned_driver_name || "Koordinator Driver Lapangan"}
                        </p>
                        <p className="text-xs font-mono font-bold text-[#327691]">
                          {b.assigned_driver_phone || "085234567899"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <a
                          href={
                            whatsappLink(
                              b.assigned_driver_phone || "085234567899",
                              `Halo Driver Sewa Trooper, saya ${b.contact_name} pemesan #${b.id} untuk penjemputan trip ${b.service_date}. Pembayaran saya telah selesai. Mohon info titik jemput dan waktu ya.`
                            ) || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center transition flex items-center justify-center gap-1"
                        >
                          <MessageCircle size={13} />
                          <span>Chat WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${b.assigned_driver_phone || "085234567899"}`}
                          className="py-1.5 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg text-center transition"
                        >
                          Telepon
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Nomor Kontak Admin & Driver Terkunci
                    </h4>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
                      Nomor kontak resmi Admin dan Driver lapangan akan otomatis dibuka setelah pembayaran Anda <strong>Lunas 100%</strong> melalui website.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: Alur & Histori Status Perjalanan (Visual Step-by-Step Tracker) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-[#327691]" />
              <span>Status & Riwayat Perjalanan</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Tahap 1 dari 3</span>
          </div>

          {/* Stepper Horizontal Ringkas */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold inline-flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                ✓
              </span>
              <p className="font-extrabold text-[11.5px] sm:text-xs text-slate-900">1. Booking Diajukan</p>
              <p className="text-[10px] text-emerald-700 font-bold">Data Tercatat ✓</p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-xl border transition shadow-2xs ${
                isApproved
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-amber-50 border-2 border-amber-400 text-amber-950 ring-2 ring-amber-100"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-black inline-flex items-center justify-center mx-auto mb-1.5 shadow-xs ${
                  isApproved ? "bg-emerald-600 text-white" : "bg-amber-500 text-white animate-pulse"
                }`}
              >
                {isApproved ? "✓" : "2"}
              </span>
              <p className="font-extrabold text-[11.5px] sm:text-xs text-slate-900">2. Konfirmasi Admin</p>
              <p className="text-[10px] font-bold text-amber-800">
                {isApproved ? "Unit Disetujui (ACC) ✓" : "Sedang Menunggu ACC ⏳"}
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-xl border shadow-2xs ${
                isPaid
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : b.booking_status === "approved"
                  ? "bg-[#e9f3f7] border-2 border-[#327691] text-[#263b46] ring-2 ring-sky-100"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center mx-auto mb-1.5 shadow-xs ${
                  isPaid
                    ? "bg-emerald-600 text-white"
                    : b.booking_status === "approved"
                    ? "bg-[#327691] text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isPaid ? "✓" : "3"}
              </span>
              <p className="font-extrabold text-[11.5px] sm:text-xs text-slate-900">3. Pembayaran</p>
              <p className="text-[10px] font-medium opacity-80">
                {isPaid
                  ? "Lunas Terverifikasi"
                  : b.booking_status === "approved"
                  ? "Siap Dibayar 💳"
                  : "Setelah Di-ACC Admin"}
              </p>
            </div>
          </div>

          {/* Histori Log Aktivitas Pesanan */}
          {!!history.length && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Riwayat Log Status
              </span>
              <div className="space-y-2.5">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#327691] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">
                        {bookingStatus[h.new_status] || h.new_status}
                      </p>
                      {h.reason && (
                        <p className="text-slate-600 mt-0.5 leading-snug">{h.reason}</p>
                      )}
                    </div>
                    <span className="text-[10.5px] text-slate-400 whitespace-nowrap shrink-0">
                      {new Date(h.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: Ringkasan Tiket & Rincian Pesanan (To The Point) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#327691]">
                Paket Sewa Jeep Terpilih
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mt-0.5">
                {b.product_name}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e9f3f7] text-[#2c6881] border border-[#ccd8de] whitespace-nowrap shrink-0">
              {b.num_units} Unit Jeep
            </span>
          </div>

          {/* 4 Tile Ringkas & Mobile-Friendly */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px] flex items-center gap-1">
                <Calendar size={12} className="text-[#327691]" />
                Jadwal Trip
              </span>
              <p className="font-extrabold text-slate-800">
                {formatIndonesianDate(b.service_date)}
              </p>
              <p className="text-slate-500 text-[11px]">Pukul {b.start_time?.slice(0, 5)} WIB</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px] flex items-center gap-1">
                <Users size={12} className="text-[#327691]" />
                Kapasitas
              </span>
              <p className="font-extrabold text-slate-800">
                {b.num_passengers} Orang Peserta
              </p>
              <p className="text-slate-500 text-[11px]">{b.num_units} Unit Trooper 4x4</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px] flex items-center gap-1">
                <MapPin size={12} className="text-[#327691]" />
                Titik Jemput
              </span>
              <p className="font-bold text-slate-800 truncate">
                {b.pickup_address || "Titik Awal Layanan (Kota Banyuwangi)"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px] flex items-center gap-1">
                <Phone size={12} className="text-[#327691]" />
                Kontak Pemesan
              </span>
              <p className="font-bold text-slate-800 truncate">
                {b.contact_name}
              </p>
              <p className="text-slate-500 text-[11px]">{b.contact_phone}</p>
            </div>
          </div>

          {/* Rincian Finansial Bersih */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Nilai Sewa:</span>
              <span className="font-bold text-slate-900">{formatIDR(b.total_amount)}</span>
            </div>
            {/* Status Pembayaran & Ketentuan ACC */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-900 text-xs">Status Pembayaran:</span>
                <span className="font-black text-[11px] text-amber-800 bg-white px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                  {b.remaining_amount <= 0 && isPaid ? "Lunas 100%" : isPaid ? "DP Terverifikasi (Sisa Tagihan Aktif)" : isApproved ? "Siap Dibayar" : "Menunggu ACC Admin"}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-snug">
                {b.remaining_amount <= 0 && isPaid
                  ? "Pembayaran Anda telah LUNAS 100% via website dan jadwal trip resmi terkunci."
                  : isPaid
                  ? `Uang Muka (DP) ${formatIDR(b.amount_paid)} telah diterima. Sisa ${formatIDR(b.remaining_amount)} wajib dilunasi via website sebelum keberangkatan.`
                  : isApproved
                  ? "Armada siap! Silakan selesaikan pembayaran melalui tombol di atas."
                  : "Belum ada pembayaran saat ini. Pembayaran baru dapat dilakukan setelah booking disetujui (ACC) oleh admin."}
              </p>
            </div>

            {!isPaid && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Pilihan DP (30% saat di-ACC):</span>
                  <span className="font-bold text-slate-900">
                    {formatIDR(b.amount_to_pay || b.total_amount * 0.3)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200">
                  <span>Pilihan Lunas (100%):</span>
                  <span className="font-semibold text-slate-700">{formatIDR(b.total_amount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: Tombol Aksi & Navigasi */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isFullyPaid && contact && (
            <a
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              <span>Chat WhatsApp Admin</span>
            </a>
          )}
          <Link
            href="/buyer/pesanan"
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition flex items-center justify-center gap-2"
          >
            <Clock size={15} className="text-[#327691]" />
            <span>Riwayat Booking Saya</span>
          </Link>
          <a
            href={"/pesanan/" + encodeURIComponent(b.id)}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm shadow-2xs transition flex items-center justify-center gap-1.5"
          >
            <RotateCw size={14} />
            <span>Perbarui</span>
          </a>
        </div>
      </div>
    </div>
  );
}
