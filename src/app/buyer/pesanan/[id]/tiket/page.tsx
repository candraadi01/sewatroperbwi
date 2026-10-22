import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getBookingById } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  QrCode,
  Lock,
  CreditCard
} from "lucide-react";
import { PrintButton } from "./PrintButton";

export const metadata = {
  title: "E-Tiket & Voucher Tour | Sewa Trooper Banyuwangi",
  description: "Voucher resmi reservasi sewa Jeep Trooper 4x4 Banyuwangi.",
};

export default async function ETiketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireBuyer(`/buyer/pesanan/${encodeURIComponent(id)}/tiket`);
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  const isConfirmed = ["confirmed", "payment_received", "in_progress", "completed"].includes(booking.booking_status);
  const isFullyPaid =
    (booking.remaining_amount ?? 0) <= 0 ||
    (booking.amount_paid ?? 0) >= (booking.total_amount ?? 0) ||
    booking.payment_status === "settlement";
  const waDriverLink =
    booking.assigned_driver_phone && isFullyPaid
      ? `https://wa.me/62${booking.assigned_driver_phone.replace(/^0/, "")}?text=${encodeURIComponent(
          `Halo ${booking.assigned_driver_name || "Driver"}, saya ${booking.contact_name} pemesan Jeep Trooper dengan kode booking #${booking.id} untuk trip ${booking.service_date}.`
        )}`
      : "";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Tombol Navigasi Kembali & Cetak (Hidden in print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/buyer/pesanan"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#2c6881] transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Pesanan Saya</span>
          </Link>

          <PrintButton />
        </div>

        {/* DOKUMEN RESMI E-TIKET */}
        <div className="bg-white rounded-3xl border-2 border-[#e4ebef] shadow-lg overflow-hidden print:border print:shadow-none print:rounded-none">
          {/* Top Banner E-Tiket */}
          <div className="bg-[#1f3039] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-4 border-[#327691]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#327691]/40 border border-[#327691] text-xs font-bold uppercase tracking-wider text-sky-200">
                <ShieldCheck size={14} />
                <span>Official E-Ticket & Tour Voucher</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                Sewa Trooper Banyuwangi
              </h1>
              <p className="text-xs text-sky-100/80">
                Layanan Rental Jeep 4x4 Resmi & Pemandu Wisata Profesional
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                KODE BOOKING
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300">
                #{booking.id}
              </span>
              <span className="text-[10px] text-sky-100/70 mt-0.5">
                Tanggal Terbit: {new Date(booking.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Status Bar */}
          <div className="px-6 sm:px-8 py-3 bg-[#e8f3f7] border-b border-[#d2e4ec] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#263b46]">Status Tiket:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold ${
                  isFullyPaid
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-amber-600 text-white shadow-2xs"
                }`}
              >
                <CheckCircle2 size={13} />
                <span>{isFullyPaid ? "LUNAS & TERKONFIRMASI" : "DP TERBAYAR - MENUNGGU PELUNASAN"}</span>
              </span>
            </div>
            <span className="text-xs font-semibold text-[#53636d]">
              Metode: {booking.payment_choice === "dp" ? "Down Payment (DP)" : "Bayar Lunas Penuh"}
            </span>
          </div>

          {/* Konten Utama Tiket */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Info Paket Tour */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#327691] uppercase tracking-wider">
                Paket Perjalanan & Destinasi
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e293b]">
                {booking.product_name}
              </h2>
            </div>

            {/* Grid Jadwal & Penjemputan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#f8fafc] border border-[#e4ebef]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase">Tanggal Trip</span>
                  <p className="text-sm font-bold text-[#1e293b]">{booking.service_date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase">Jam Berangkat</span>
                  <p className="text-sm font-bold text-[#1e293b]">Pukul {booking.start_time?.slice(0, 5) || "08:00"} WIB</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center shrink-0">
                  <Car size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase">Armada & Kapasitas</span>
                  <p className="text-sm font-bold text-[#1e293b]">{booking.num_units} Unit Jeep · {booking.num_passengers} Peserta</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8e9da5] uppercase">Titik Jemput</span>
                  <p className="text-sm font-bold text-[#1e293b] line-clamp-2">{booking.pickup_address || "Area Kota Banyuwangi / Stasiun / Hotel"}</p>
                </div>
              </div>
            </div>

            {/* SEKSI INFORMASI DRIVER & ARMADA RESMI (FITUR 1) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#e9f3f7] to-[#f4f9fb] border border-[#d2e4ec]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ccd8de]">
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-[#327691]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#263b46]">
                    Driver & Armada yang Bertugas
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Siap Melayani
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8e9da5] font-semibold block">Nama Driver / Pemandu:</span>
                  <span className="font-bold text-sm text-[#1e293b] block mt-0.5">
                    {booking.assigned_driver_name || "Pak Budi Santoso"}
                  </span>
                  <span className="text-[#53636d] block text-[11px]">Senior Driver 4x4 & Pemandu Lokal</span>
                </div>

                <div>
                  <span className="text-[#8e9da5] font-semibold block">Unit Kendaraan & Plat Nomor:</span>
                  <span className="font-bold text-sm text-[#1e293b] block mt-0.5">
                    {booking.assigned_vehicle_plate || "P 1982 XX"} · {booking.assigned_vehicle_model || "Isuzu Trooper 4x4 Offroad Edition"}
                  </span>
                </div>
              </div>

              {isFullyPaid && waDriverLink ? (
                <div className="mt-4 pt-3 border-t border-[#ccd8de] flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-[#53636d]">
                    No. WhatsApp Driver: <strong>{booking.assigned_driver_phone}</strong>
                  </span>
                  <a
                    href={waDriverLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition print:hidden"
                  >
                    <Phone size={13} />
                    <span>Hubungi Driver via WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-[#ccd8de] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-900 font-medium">
                      Kontak & WhatsApp Driver: <strong className="font-bold text-amber-950">Terkunci (Terbuka setelah Pelunasan Sisa)</strong>
                    </span>
                  </div>
                  <div className="print:hidden">
                    <Link
                      href={`/pesanan/${booking.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      <CreditCard size={13} />
                      <span>Selesaikan Pelunasan</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Data Pemesan & Rincian Biaya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-[#327691] uppercase tracking-wider">
                  Informasi Kontak Pemesan
                </span>
                <div className="text-xs space-y-1 text-[#53636d]">
                  <p><strong className="text-[#1e293b]">Nama:</strong> {booking.contact_name}</p>
                  <p><strong className="text-[#1e293b]">No. WhatsApp:</strong> {booking.contact_phone}</p>
                  <p><strong className="text-[#1e293b]">Email:</strong> {booking.contact_email}</p>
                  {booking.notes && (
                    <p><strong className="text-[#1e293b]">Catatan Khusus:</strong> {booking.notes}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:text-right">
                <span className="text-xs font-extrabold text-[#327691] uppercase tracking-wider">
                  Rincian Pembayaran
                </span>
                <div className="text-xs space-y-1 text-[#53636d]">
                  <p>Total Tarif: <strong className="text-[#1e293b]">{formatIDR(booking.total_amount)}</strong></p>
                  <p>Jumlah Terbayar: <strong className="text-emerald-700">{formatIDR(booking.amount_paid)}</strong></p>
                  <p>Sisa Pelunasan: <strong className="text-[#1e293b]">{formatIDR(booking.remaining_amount)}</strong></p>
                </div>
              </div>
            </div>

            {/* Checklist Persiapan Wisata (Catatan Penting) */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>Panduan Penting Sebelum Berangkat:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 pl-1 leading-relaxed">
                <li>Harap siap di titik penjemputan 15 menit sebelum jam keberangkatan.</li>
                <li><strong>Untuk Trip Kawah Ijen:</strong> Wajib membawa jaket tebal hangat (suhu 5-10°C), sepatu trekking tidak licin, masker gas respirator, dan senter.</li>
                <li><strong>Untuk Trip Baluran / Pantai:</strong> Bawa kacamata hitam, tabir surya/sunblock, dan pakaian santai menyerap keringat.</li>
                <li>Tunjukkan E-Tiket ini langsung dari layar ponsel Anda kepada Driver saat penjemputan.</li>
              </ul>
            </div>

            {/* Footer Voucher dengan Barcode Visual */}
            <div className="pt-6 border-t border-[#e4ebef] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="font-mono text-xs font-bold text-[#263b46]">
                  VERIFIED BY SEWA TROOPER BWI SYSTEM
                </p>
                <p className="text-[10px] text-[#8e9da5] mt-0.5">
                  Layanan Bantuan CS 24 Jam: 0812-3456-7890 · www.sewatroperbwi.com
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 text-[#263b46] font-mono text-xs font-bold">
                <QrCode size={22} className="text-[#327691]" />
                <span>VALID TICKET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
