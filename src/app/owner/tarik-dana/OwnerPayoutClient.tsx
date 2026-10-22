"use client";

import { useState } from "react";
import { formatIDR } from "@/lib/utils/currency";
import {
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  Loader2,
  FileCheck,
  XCircle,
} from "lucide-react";

export interface PayoutItem {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: string;
  admin_notes?: string | null;
  transfer_proof_url?: string | null;
  requested_at: string;
  processed_at?: string | null;
}

export interface BankPrefill {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export function OwnerPayoutClient({
  availableBalance,
  initialRequests,
  prefill,
}: {
  availableBalance: number;
  initialRequests: PayoutItem[];
  prefill: BankPrefill;
}) {
  const [requests, setRequests] = useState<PayoutItem[]>(initialRequests);
  const [amount, setAmount] = useState<number>(
    availableBalance >= 100000 ? Math.min(availableBalance, 1000000) : 100000,
  );
  const [bankName, setBankName] = useState(prefill.bankName || "BCA (Bank Central Asia)");
  const [accountNumber, setAccountNumber] = useState(prefill.accountNumber || "");
  const [accountHolder, setAccountHolder] = useState(prefill.accountHolder || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (amount < 100000) {
      setErrorMessage("Nominal penarikan minimal Rp 100.000.");
      setIsSubmitting(false);
      return;
    }

    if (amount > availableBalance && availableBalance > 0) {
      setErrorMessage(
        `Nominal melebihi saldo yang tersedia (${formatIDR(availableBalance)}).`,
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/owner/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bankName,
          accountNumber,
          accountHolder,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengajukan penarikan dana.");
      }

      setSuccessMessage("Permohonan penarikan dana berhasil diajukan! Admin akan memverifikasi transfer.");
      if (data.data) {
        setRequests([data.data, ...requests]);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function setQuickAmount(ratio: number) {
    const val = Math.floor((availableBalance * ratio) / 10000) * 10000;
    setAmount(Math.max(100000, val));
  }

  return (
    <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-start">
      {/* Formulir Tarik Tunai */}
      <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <span className="text-xs text-neutral-500 font-semibold">
              Saldo Pendapatan Tersedia
            </span>
            <p className="text-2xl font-black text-emerald-800 mt-1">
              {formatIDR(availableBalance)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet size={24} />
          </div>
        </div>

        {/* Notifikasi Status */}
        {successMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#263b46] mb-1">
              Nominal Penarikan (Rp)
            </label>
            <input
              type="number"
              min={100000}
              required
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Minimal Rp 100.000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-bold"
            />
            {availableBalance > 0 && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setQuickAmount(0.25)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAmount(0.5)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold"
                >
                  Tarik Semua (100%)
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-[#263b46] mb-1">
              Bank Tujuan Transfer
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] bg-white"
            >
              <option value="BCA (Bank Central Asia)">Bank BCA (Bank Central Asia)</option>
              <option value="Bank Mandiri">Bank Mandiri</option>
              <option value="Bank BRI (Bank Rakyat Indonesia)">Bank BRI (Bank Rakyat Indonesia)</option>
              <option value="Bank BNI">Bank BNI</option>
              <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
              <option value="Bank Jatim">Bank Jatim</option>
              <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#263b46] mb-1">
              Nomor Rekening
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Contoh: 1800123456"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-[#263b46] mb-1">
              Nama Pemilik Rekening (Sesuai Buku Tabungan)
            </label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Contoh: CANDRA ADI PRASETYO"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memproses Pengajuan...</span>
              </>
            ) : (
              <span>Ajukan Pencairan Sekarang</span>
            )}
          </button>
        </form>
      </div>

      {/* Riwayat Penarikan Dana */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-[#263b46]">
          Riwayat Pencairan Terakhir
        </h2>

        <div className="space-y-3">
          {requests.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-[#e4ebef] shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 font-mono">
                    {new Date(item.requested_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <p className="text-base font-black text-[#263b46] mt-0.5">
                    {formatIDR(item.amount)}
                  </p>
                </div>

                <div>
                  {item.status === "transferred" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={12} />
                      <span>Berhasil Ditransfer</span>
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      <FileCheck size={12} />
                      <span>Disetujui Admin</span>
                    </span>
                  )}
                  {item.status === "pending" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      <Clock size={12} />
                      <span>Menunggu Konfirmasi</span>
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                      <XCircle size={12} />
                      <span>Ditolak</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
                <p>
                  Rekening: <strong>{item.bank_name}</strong> · {item.account_number} ({item.account_holder})
                </p>
                {item.admin_notes && (
                  <p className="text-neutral-600 bg-neutral-50 p-2 rounded-lg text-[11px]">
                    Catatan Admin: {item.admin_notes}
                  </p>
                )}
                {item.transfer_proof_url && (
                  <a
                    href={item.transfer_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#327691] hover:underline font-bold text-[11px] inline-flex items-center gap-1 pt-0.5"
                  >
                    <span>Lihat Bukti Transfer Bank</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-neutral-300">
              <Clock size={28} className="mx-auto text-neutral-400 mb-2" />
              <p className="text-xs font-bold text-neutral-600">
                Belum ada riwayat penarikan dana
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Gunakan form di samping untuk mencairkan saldo komisi sewa Trooper Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
