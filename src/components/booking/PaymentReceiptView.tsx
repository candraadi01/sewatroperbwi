"use client";

import Link from "next/link";
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Ticket, 
  Calendar, 
  Car, 
  CreditCard,
  Building,
  Receipt
} from "lucide-react";
import { formatIDR, terbilang } from "@/lib/utils/currency";
import type { BookingRecord } from "@/lib/services/booking";

interface PaymentAttemptRecord {
  id?: string;
  midtrans_order_id?: string;
  purpose?: string;
  expected_amount?: number;
  paid_amount?: number;
  status?: string;
  payment_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaymentReceiptViewProps {
  booking: BookingRecord;
  paymentAttempt?: PaymentAttemptRecord | null;
  backUrl?: string;
  ticketUrl?: string;
}

export function PaymentReceiptView({
  booking,
  paymentAttempt,
  backUrl = "/buyer/pesanan",
  ticketUrl,
}: PaymentReceiptViewProps) {
  const isFullyPaid =
    (booking.remaining_amount ?? 0) <= 0 ||
    (booking.amount_paid ?? 0) >= (booking.total_amount ?? 0);

  const paymentDate = paymentAttempt?.updated_at
    ? new Date(paymentAttempt.updated_at)
    : new Date(booking.created_at);

  const formattedPaymentDate = paymentDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const paymentMethodLabel = (() => {
    const raw = paymentAttempt?.payment_type?.toLowerCase() || "";
    if (raw.includes("qris")) return "QRIS (GoPay / ShopeePay / Bank App)";
    if (raw.includes("bca")) return "BCA Virtual Account";
    if (raw.includes("mandiri")) return "Mandiri Bill Payment";
    if (raw.includes("bni")) return "BNI Virtual Account";
    if (raw.includes("bri")) return "BRI Virtual Account (BRIVA)";
    if (raw.includes("credit") || raw.includes("card")) return "Kartu Kredit / Debit Online";
    return "Midtrans Payment Gateway (Online)";
  })();

  const receiptNumber = `KW-${booking.id.replace("TRP-", "")}`;
  const amountPaidInWords = terbilang(booking.amount_paid || booking.total_amount);

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:p-0 print:m-0">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* NAVIGASI & TOMBOL CETAK (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#255b71] transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Detail Pesanan</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {ticketUrl && (
              <Link
                href={ticketUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#327691] text-[#327691] hover:bg-[#e9f3f7] text-xs font-bold transition shadow-xs"
              >
                <Ticket size={14} />
                <span>Lihat E-Tiket</span>
              </Link>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
            >
              <Printer size={16} />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* DOKUMEN FISIK KWITANSI RESMI (A4 Optimized) */}
        <div className="bg-white text-neutral-900 rounded-3xl border-2 border-neutral-300/80 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none relative">
          
          {/* HEADER KOP SURAT RESMI */}
          <div className="p-6 sm:p-8 border-b-2 border-neutral-900">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              
              {/* Logo & Info Perusahaan */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#002b49] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                    <Car size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#002b49] uppercase">
                      SEWA TROOPER BANYUWANGI
                    </h2>
                    <p className="text-xs font-bold text-[#327691]">
                      PT SEWA TROOPER BWI INDONESIA
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-neutral-600 leading-relaxed max-w-md">
                  <p>Jl. Raya Licin No. 88, Kawah Ijen, Banyuwangi, Jawa Timur 68454</p>
                  <p>WhatsApp Hotline: 0812-3456-7890 · Email: finance@sewatrooperbwi.com</p>
                  <p>Website Resmi: https://sewatrooperbwi.com</p>
                </div>
              </div>

              {/* Box Nomor Kwitansi & Tanggal */}
              <div className="sm:text-right bg-neutral-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-neutral-200">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded bg-[#002b49] text-white inline-block">
                  KWITANSI PEMBAYARAN RESMI
                </span>
                <p className="font-mono text-sm sm:text-base font-extrabold text-neutral-900 mt-2">
                  NO: {receiptNumber}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Ref Booking: <span className="font-mono font-bold text-neutral-800">#{booking.id}</span>
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Waktu: {formattedPaymentDate} WIB
                </p>
              </div>

            </div>
          </div>

          {/* WATERMARK / STEMPEL LUNAS VISUAL */}
          <div className="absolute right-8 top-56 sm:top-52 pointer-events-none select-none z-10 opacity-85 rotate-[-12deg]">
            <div className={`px-6 py-2.5 rounded-2xl border-4 text-center ${
              isFullyPaid 
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/90 shadow-md" 
                : "border-amber-600 text-amber-700 bg-amber-50/90 shadow-md"
            }`}>
              <span className="font-black text-2xl sm:text-3xl tracking-widest block uppercase">
                {isFullyPaid ? "LUNAS / PAID" : "DP DITERIMA"}
              </span>
              <span className="text-[10px] font-bold block tracking-wider uppercase">
                VERIFIED BY MIDTRANS GATEWAY
              </span>
            </div>
          </div>

          {/* KONTEN KWITANSI */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Informasi Pembayar & Transaksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                  Telah Diterima Dari (Penyewa):
                </span>
                <p className="text-sm font-extrabold text-neutral-900">{booking.contact_name}</p>
                <p className="text-neutral-600 mt-0.5">WhatsApp: {booking.contact_phone}</p>
                <p className="text-neutral-600">Email: {booking.contact_email || "-"}</p>
                <p className="text-neutral-600 mt-1 line-clamp-2">
                  Penjemputan: {booking.pickup_address || "Area Kota Banyuwangi"}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                  Kanal Pembayaran & Gateway:
                </span>
                <p className="text-sm font-extrabold text-neutral-900">{paymentMethodLabel}</p>
                <p className="text-neutral-600 mt-0.5">
                  ID Transaksi: <span className="font-mono text-neutral-800">{paymentAttempt?.midtrans_order_id || `${booking.id}-1`}</span>
                </p>
                <p className="text-neutral-600">Status: <strong className="text-emerald-700">Settlement (Lunas & Terverifikasi)</strong></p>
                <p className="text-neutral-600 mt-1">
                  Skema: {booking.payment_choice === "dp" ? "Down Payment (Uang Muka 30%)" : "Pembayaran Penuh (100% Lunas)"}
                </p>
              </div>
            </div>

            {/* TABEL RINCIAN ITEM / LAYANAN */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-900 bg-neutral-100 text-neutral-800 font-extrabold">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">Deskripsi Layanan Wisata</th>
                    <th className="py-3 px-3 text-center">Jadwal Trip</th>
                    <th className="py-3 px-3 text-center">Jumlah Unit</th>
                    <th className="py-3 px-3 text-right">Tarif Satuan</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr className="align-top">
                    <td className="py-3.5 px-3 text-center font-bold">1</td>
                    <td className="py-3.5 px-3">
                      <strong className="text-sm text-neutral-900 block font-bold">
                        {booking.product_name}
                      </strong>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Sewa Jeep Isuzu Trooper 4x4 Offroad Edition termasuk BBM, Driver & Pemandu Profesional.
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold block mt-1">
                        Kapasitas: {booking.num_passengers} Peserta ({booking.num_units} Unit Kendaraan)
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="font-bold text-neutral-800 block">{booking.service_date}</span>
                      <span className="text-[11px] text-neutral-500 block">Pukul {booking.start_time?.slice(0, 5) || "08:00"} WIB</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-neutral-800">
                      {booking.num_units} Unit
                    </td>
                    <td className="py-3.5 px-3 text-right text-neutral-700">
                      {formatIDR(Math.round(booking.total_amount / (booking.num_units || 1)))}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-neutral-900">
                      {formatIDR(booking.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* REKAPITULASI BIAYA & STATUS PEMBAYARAN */}
            <div className="border-t-2 border-neutral-900 pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                
                {/* Kolom Terbilang */}
                <div className="sm:max-w-md w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 block">
                    JUMLAH DITERIMA TERBILANG:
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold text-[#002b49] italic bg-white p-2.5 rounded-xl border border-neutral-200">
                    &ldquo;# {amountPaidInWords} Rupiah #&rdquo;
                  </p>
                  <p className="text-[10px] text-neutral-500 leading-tight">
                    * Kwitansi ini sah dan diterbitkan secara komputerisasi sebagai bukti transaksi resmi yang diakui hukum.
                  </p>
                </div>

                {/* Kolom Hitungan Angka */}
                <div className="w-full sm:w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal Layanan:</span>
                    <span className="font-medium">{formatIDR(booking.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Potongan / Diskon:</span>
                    <span className="font-medium">Rp 0</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-neutral-900 border-t border-neutral-300 pt-2">
                    <span>TOTAL TAGIHAN:</span>
                    <span>{formatIDR(booking.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-emerald-700 border-t border-neutral-200 pt-1.5">
                    <span>JUMLAH DIBAYARKAN:</span>
                    <span>{formatIDR(booking.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-neutral-800 border-t border-neutral-200 pt-1.5">
                    <span>SISA TAGIHAN:</span>
                    <span>{formatIDR(booking.remaining_amount)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* SEKSI TANDA TANGAN & PENGESAHAN DOKUMEN */}
            <div className="pt-8 border-t border-dashed border-neutral-300">
              <div className="grid grid-cols-2 gap-8 text-center text-xs">
                
                {/* Tanda Tangan Pembayar */}
                <div className="space-y-16">
                  <div>
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                      Tanda Tangan Pembayar:
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 border-b border-neutral-400 pb-1 max-w-[180px] mx-auto">
                      {booking.contact_name}
                    </p>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Penyewa Resmi</span>
                  </div>
                </div>

                {/* Tanda Tangan & Cap Kasir / Admin */}
                <div className="space-y-4">
                  <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                    Banyuwangi, {new Date(booking.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    <br />
                    Manajemen Keuangan Sewa Trooper:
                  </span>
                  
                  {/* Digital Signature Emblem & QR */}
                  <div className="flex items-center justify-center gap-3 py-1">
                    <div className="w-16 h-16 rounded-xl border-2 border-emerald-600 flex flex-col items-center justify-center p-1 bg-emerald-50 text-emerald-800 font-mono text-[9px] font-black text-center shadow-xs">
                      <QrCode size={30} className="text-emerald-700" />
                      <span>VALID</span>
                    </div>
                    <div className="text-left text-[10px] text-neutral-500">
                      <span className="font-bold text-emerald-800 block">DIGITALLY CERTIFIED</span>
                      <span>Midtrans Verified</span>
                      <span className="block text-[9px] text-neutral-400">ID: {booking.id.slice(0, 16)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-[#002b49] border-b border-neutral-400 pb-1 max-w-[200px] mx-auto">
                      FINANCE DEPT. SEWA TROOPER BWI
                    </p>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Otorisasi Resmi Kasir & Akuntansi</span>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER INFORMASI TAMBAHAN */}
            <div className="pt-6 border-t border-neutral-200 text-[10px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p>Simpan dokumen kwitansi ini sebagai bukti pembayaran sah untuk kebutuhan administrasi Anda.</p>
                <p className="mt-0.5">E-Tiket dan kontak Driver resmi dapat diakses melalui portal pemesan.</p>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-neutral-700 font-mono">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>SEWA TROOPER OFFICIAL RECEIPT</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

