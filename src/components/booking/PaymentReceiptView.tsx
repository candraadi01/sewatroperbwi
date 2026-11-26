"use client";

import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Car,
} from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";
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
    if (raw.includes("credit") || raw.includes("card")) return "Kartu Kredit / Debit";
    return "Midtrans Payment Gateway (Online)";
  })();

  const receiptNumber = `KW-${booking.id.replace("TRP-", "")}`;
  const amountPaid = booking.amount_paid > 0 ? booking.amount_paid : booking.total_amount;
  const remainingAmount = booking.remaining_amount ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-6 sm:py-10 px-4 sm:px-6 font-sans print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Navigasi & Tombol Cetak (Hidden saat Print) */}
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#255b71] transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Link>

          <div className="flex items-center gap-2">
            {ticketUrl && (
              <Link
                href={ticketUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
              >
                <Ticket size={14} className="text-[#327691]" />
                <span>E-Tiket</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Kartu Kwitansi Resmi */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-md p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header Kwitansi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#327691] text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                <Car size={22} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-neutral-100 uppercase tracking-tight">
                  Sewa Trooper Banyuwangi
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                  Kwitansi Pembayaran Resmi
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                Nomor Kwitansi
              </span>
              <p className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-neutral-100">
                {receiptNumber}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Ref: #{booking.id}
              </p>
            </div>
          </div>

          {/* Status Badge Pembayaran (DP vs Lunas) */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${
              isFullyPaid
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  isFullyPaid ? "bg-emerald-600" : "bg-amber-600"
                }`}
              >
                ✓
              </span>
              <div>
                <span
                  className={`text-xs sm:text-sm font-black uppercase tracking-wide block ${
                    isFullyPaid ? "text-emerald-900 dark:text-emerald-300" : "text-amber-950 dark:text-amber-300"
                  }`}
                >
                  {isFullyPaid ? "Pembayaran Lunas (100%)" : "Pembayaran DP Berhasil Diterima"}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-neutral-400 mt-0.5">
                  {isFullyPaid
                    ? "Seluruh tagihan telah lunas. Jadwal trip terkunci resmi."
                    : `Uang muka DP telah diterima. Sisa tagihan sebesar ${formatIDR(remainingAmount)} dapat dilunasi via website.`}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300">
              {formattedPaymentDate} WIB
            </span>
          </div>

          {/* Grid Informasi Pembayar & Transaksi */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                Diterima Dari (Penyewa)
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100">
                {booking.contact_name}
              </p>
              <p className="text-slate-600 dark:text-neutral-400">{booking.contact_phone}</p>
              <p className="text-slate-500 dark:text-neutral-500 truncate">{booking.contact_email || "-"}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                Metode Pembayaran
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100">
                {paymentMethodLabel}
              </p>
              <p className="text-slate-600 dark:text-neutral-400">
                Skema: {isFullyPaid ? "Pembayaran Penuh (100% Lunas)" : "Down Payment (DP 30%)"}
              </p>
              <p className="text-slate-500 dark:text-neutral-500 font-mono text-[10.5px]">
                ID: {paymentAttempt?.midtrans_order_id || `${booking.id}-1`}
              </p>
            </div>
          </div>

          {/* Rincian Paket Layanan */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
              Rincian Layanan Sewa
            </span>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-neutral-100">
                    {booking.product_name}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Sewa Jeep Trooper 4x4 Offroad (Termasuk Sopir &amp; BBM)
                  </span>
                </div>
                <span className="font-black text-slate-900 dark:text-neutral-100 shrink-0">
                  {formatIDR(booking.total_amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-neutral-700 text-[11px] text-slate-600 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#327691] shrink-0" />
                  <span>{booking.service_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#327691] shrink-0" />
                  <span>Pukul {booking.start_time?.slice(0, 5) || "08:00"} WIB</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <MapPin size={13} className="text-[#327691] shrink-0" />
                  <span className="truncate">{booking.pickup_address || "Banyuwangi Kota"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Angka Pembayaran (DP vs Lunas) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs">
            <div className="flex justify-between py-1 text-slate-600 dark:text-neutral-400">
              <span>Total Nilai Sewa:</span>
              <span className="font-semibold text-slate-800 dark:text-neutral-200">
                {formatIDR(booking.total_amount)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 font-bold">
              <span className="text-emerald-900 dark:text-emerald-300">
                {isFullyPaid ? "Jumlah Dibayarkan (Lunas):" : "Jumlah DP Dibayarkan:"}
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                {formatIDR(amountPaid)}
              </span>
            </div>

            <div className="flex justify-between py-1 text-slate-700 dark:text-neutral-300 font-bold">
              <span>Sisa Tagihan Pelunasan:</span>
              <span className={remainingAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                {remainingAmount > 0 ? formatIDR(remainingAmount) : "Rp 0 (Lunas 100%)"}
              </span>
            </div>
          </div>

          {/* Footer Dokumen Sah */}
          <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Bukti Pembayaran Resmi Komputerisasi</span>
            </span>
            <span className="font-mono text-[10px]">Sewa Trooper BWI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
