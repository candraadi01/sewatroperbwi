"use client";

import { useState, useRef } from "react";
import {
  QrCode,
  CreditCard,
  Building2,
  Landmark,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";

interface SimulationData {
  isDemo: boolean;
  requiresSimulation: boolean;
  bookingCode: string;
  amountToPay: number;
  totalAmount: number;
  amountPaid: number;
  outstanding: number;
  paymentChoice: string;
  message?: string;
}

export function PaymentButton({
  code,
  label,
  totalAmount,
  dpAmount,
  defaultChoice = "dp",
}: {
  code: string;
  label?: string;
  totalAmount?: number;
  dpAmount?: number;
  defaultChoice?: "dp" | "full";
}) {
  const [choice, setChoice] = useState<"dp" | "full">(defaultChoice);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("qris");
  const [simulating, setSimulating] = useState(false);
  const [success, setSuccess] = useState(false);
  const key = useRef("");

  const effectiveDp = dpAmount || (totalAmount ? Math.round(totalAmount * 0.3) : 0);
  const effectiveTotal = totalAmount || 0;
  const currentPayAmount = choice === "dp" ? effectiveDp : effectiveTotal;

  async function openPayment() {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      key.current ||= crypto.randomUUID();
      const res = await fetch("/api/payments/" + encodeURIComponent(code), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: key.current,
          paymentChoice: choice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pembayaran.");
      }

      // Jika Midtrans sungguhan sudah terkonfigurasi dan ada redirectUrl
      if (data.redirectUrl) {
        const url = new URL(data.redirectUrl);
        if (
          url.protocol !== "https:" ||
          !["app.midtrans.com", "app.sandbox.midtrans.com"].includes(url.hostname)
        ) {
          throw new Error("Tautan gateway pembayaran tidak valid.");
        }
        window.location.assign(url.href);
        return;
      }

      // Jika dalam mode simulasi / demo sandbox
      if (data.requiresSimulation || data.isDemo) {
        setSimData({
          ...data,
          amountToPay: currentPayAmount || data.amountToPay,
          paymentChoice: choice,
        });
        setModalOpen(true);
        setBusy(false);
        return;
      }

      throw new Error("Respon gateway tidak dikenali.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Pembayaran belum dapat dibuka.",
      );
      setBusy(false);
    }
  }

  async function handleSimulatePayment() {
    if (simulating || success) return;
    setSimulating(true);
    setError("");

    try {
      const res = await fetch(
        "/api/payments/" + encodeURIComponent(code) + "/simulate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: selectedMethod,
            paymentChoice: choice,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Simulasi pembayaran gagal.");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.assign(`/pesanan/${encodeURIComponent(code)}/nota`);
      }, 1400);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal menyimulasikan pembayaran.",
      );
      setSimulating(false);
    }
  }

  return (
    <>
      <div className="w-full space-y-3.5">
        {/* PILIHAN 2 OPSI: DP (30%) ATAU LUNAS (100%) */}
        {effectiveTotal > 0 && effectiveDp > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wide flex items-center gap-1.5">
              <span>Pilih Jenis Pembayaran:</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.2 rounded-full">
                2 Opsi Tersedia
              </span>
            </span>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {/* Opsi DP */}
              <button
                type="button"
                onClick={() => setChoice("dp")}
                className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  choice === "dp"
                    ? "border-[#327691] bg-white dark:bg-neutral-800 shadow-sm ring-2 ring-[#327691]/20"
                    : "border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900/60 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-900 dark:text-neutral-100">
                    1. Bayar DP (30%)
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      choice === "dp" ? "border-[#327691] bg-[#327691]" : "border-slate-300"
                    }`}
                  >
                    {choice === "dp" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-base sm:text-lg font-black text-[#263b46] dark:text-[#8abbd0] mt-1.5">
                  {formatIDR(effectiveDp)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-snug">
                  Kunci jadwal trip sekarang (30%). Sisa pelunasan 70% dilunasi via website sebelum keberangkatan.
                </p>
              </button>

              {/* Opsi Lunas */}
              <button
                type="button"
                onClick={() => setChoice("full")}
                className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  choice === "full"
                    ? "border-[#327691] bg-white dark:bg-neutral-800 shadow-sm ring-2 ring-[#327691]/20"
                    : "border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900/60 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-900 dark:text-neutral-100">
                    2. Bayar Lunas (100%)
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      choice === "full" ? "border-[#327691] bg-[#327691]" : "border-slate-300"
                    }`}
                  >
                    {choice === "full" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-base sm:text-lg font-black text-[#263b46] dark:text-[#8abbd0] mt-1.5">
                  {formatIDR(effectiveTotal)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-snug">
                  Bayar penuh sekarang (100%), transaksi beres dan jadwal langsung lunas resmi.
                </p>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={openPayment}
          disabled={busy}
          className="w-full py-3.5 px-6 rounded-xl bg-[#327691] hover:bg-[#263b46] active:scale-[0.99] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[46px]"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Menyiapkan Gateway Pembayaran…</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>
                {label ||
                  `Bayar ${choice === "dp" ? "DP (30%)" : "Lunas (100%)"} Sekarang (${formatIDR(
                    currentPayAmount || 0
                  )})`}
              </span>
            </>
          )}
        </button>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* POPUP MODAL MIDTRANS SIMULATOR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
            {/* Header Midtrans Navy Style */}
            <div className="bg-gradient-to-r from-[#002238] via-[#023b5f] to-[#002238] text-white p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-wider text-base">midtrans</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 uppercase tracking-widest">
                    Sandbox Simulator
                  </span>
                </div>
                {!success && !simulating && (
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/70 block">Total Tagihan</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {simData?.amountToPay ? formatIDR(simData.amountToPay) : "Rp 0"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-white/60 block">Kode Booking</span>
                  <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    {code}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {success ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                    Pembayaran Berhasil Dikonfirmasi!
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                    Kwitansi / Nota resmi pembayaran Anda telah diterbitkan. Membuka dokumen kwitansi...
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 pt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuka kwitansi pembayaran resmi...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Mode Simulasi Pengujian Aktif</strong>
                      <span>
                        Pilih metode pembayaran di bawah dan klik tombol konfirmasi untuk mensimulasikan pembayaran lunas secara instan.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">
                      Pilih Metode Pembayaran:
                    </label>

                    <div className="grid grid-cols-1 gap-2.5">
                      {/* 1. QRIS */}
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("qris")}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                          selectedMethod === "qris"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                QRIS Instan
                              </span>
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                Otomatis
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-500 block">
                              GoPay, ShopeePay, OVO, Dana, LinkAja, BCA
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedMethod === "qris"}
                          onChange={() => setSelectedMethod("qris")}
                          className="accent-emerald-600"
                        />
                      </button>

                      {/* 2. BCA VA */}
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("bca_va")}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                          selectedMethod === "bca_va"
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                              BCA Virtual Account
                            </span>
                            <span className="text-[11px] text-neutral-500 block">
                              Transfer via m-BCA, KlikBCA, ATM BCA
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedMethod === "bca_va"}
                          onChange={() => setSelectedMethod("bca_va")}
                          className="accent-blue-600"
                        />
                      </button>

                      {/* 3. Mandiri VA */}
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("mandiri_va")}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                          selectedMethod === "mandiri_va"
                            ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                              Mandiri Bill Payment
                            </span>
                            <span className="text-[11px] text-neutral-500 block">
                              Livin&apos; by Mandiri & ATM Mandiri
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedMethod === "mandiri_va"}
                          onChange={() => setSelectedMethod("mandiri_va")}
                          className="accent-amber-600"
                        />
                      </button>

                      {/* 4. Kartu Kredit */}
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("credit_card")}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                          selectedMethod === "credit_card"
                            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/20"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                              Kartu Kredit / Debit Online
                            </span>
                            <span className="text-[11px] text-neutral-500 block">
                              Visa, Mastercard, JCB (3D Secure)
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedMethod === "credit_card"}
                          onChange={() => setSelectedMethod("credit_card")}
                          className="accent-purple-600"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      disabled={simulating}
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={simulating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {simulating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses Midtrans...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Bayar Sekarang (Simulasi)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
