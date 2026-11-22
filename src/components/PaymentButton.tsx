"use client";

import { useState, useRef } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";

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

      throw new Error("Respon gateway tidak dikenali.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Pembayaran belum dapat dibuka.",
      );
      setBusy(false);
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

    </>
  );
}
