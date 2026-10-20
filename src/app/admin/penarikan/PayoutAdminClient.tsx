"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Building2, 
  User, 
  AlertCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";

export interface PayoutItem {
  id: string;
  owner_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: string;
  admin_notes: string | null;
  transfer_proof_url: string | null;
  requested_at: string;
  processed_at: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

export function PayoutAdminClient({ initialRequests }: { initialRequests: PayoutItem[] }) {
  const [requests, setRequests] = useState<PayoutItem[]>(initialRequests);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PayoutItem | null>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject" | "transfer" | null>(null);
  const [noteInput, setNoteInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Stats calculation
  const totalPending = requests.filter((r) => r.status === "pending").length;
  const totalApproved = requests.filter((r) => r.status === "approved").length;
  const totalTransferredAmount = requests
    .filter((r) => r.status === "transferred")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredRequests = requests.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch =
      search === "" ||
      r.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      r.account_holder.toLowerCase().includes(search.toLowerCase()) ||
      r.bank_name.toLowerCase().includes(search.toLowerCase()) ||
      r.account_number.includes(search);
    return matchFilter && matchSearch;
  });

  const handleOpenAction = (item: PayoutItem, action: "approve" | "reject" | "transfer") => {
    setSelectedItem(item);
    setModalAction(action);
    setNoteInput(
      action === "transfer"
        ? "Dana telah ditransfer ke rekening pemilik."
        : action === "approve"
        ? "Permohonan penarikan dana telah disetujui, siap ditransfer."
        : ""
    );
    setErrorMessage("");
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !modalAction) return;

    setActionLoading(selectedItem.id);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          action: modalAction,
          adminNotes: noteInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permohonan");
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                status: data.status,
                admin_notes: noteInput,
                processed_at: new Date().toISOString(),
              }
            : item
        )
      );

      setModalAction(null);
      setSelectedItem(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Keuangan & Mitra
          </span>
          <h1 className="heading-1 mt-1">Penarikan Dana Pemilik</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Verifikasi dan selesaikan pencairan dana saldo komisi pemilik armada Jeep Trooper Banyuwangi.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#e4ebef] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Perlu Ditinjau</p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">{totalPending} Permohonan</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e4ebef] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Siap Ditransfer</p>
            <p className="text-2xl font-bold text-neutral-900 mt-0.5">{totalApproved} Permohonan</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e4ebef] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Dana Dicairkan</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{formatIDR(totalTransferredAmount)}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e4ebef]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "Semua Status" },
            { id: "pending", label: "Menunggu" },
            { id: "approved", label: "Disetujui" },
            { id: "transferred", label: "Ditransfer" },
            { id: "rejected", label: "Ditolak" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? "bg-[#183b4e] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pemilik, bank, rekening..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-[#e4ebef] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f8fafc] text-[#53636d] uppercase tracking-wider text-[11px] border-b border-[#e4ebef]">
              <tr>
                <th className="py-3 px-4 font-semibold">Pemilik Armada</th>
                <th className="py-3 px-4 font-semibold">Tujuan Rekening</th>
                <th className="py-3 px-4 font-semibold">Nominal</th>
                <th className="py-3 px-4 font-semibold">Waktu Permohonan</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4ebef]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <CreditCard size={32} className="mx-auto text-neutral-400 mb-2 opacity-50" />
                    <p className="font-semibold">Tidak ada riwayat penarikan dana ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Pemilik */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{req.owner_name}</div>
                      <div className="text-[11px] text-neutral-500">{req.owner_email}</div>
                      {req.owner_phone && (
                        <div className="text-[11px] text-[#327691] font-medium">{req.owner_phone}</div>
                      )}
                    </td>

                    {/* Rekening */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <Building2 size={14} className="text-[#327691]" />
                        <span>{req.bank_name}</span>
                      </div>
                      <div className="text-xs text-neutral-600 font-mono tracking-wider">{req.account_number}</div>
                      <div className="text-[11px] text-neutral-500">a.n. {req.account_holder}</div>
                    </td>

                    {/* Nominal */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-neutral-900 text-sm">
                        {formatIDR(req.amount)}
                      </span>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3 px-4 text-xs text-neutral-600">
                      <div>{new Date(req.requested_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                      <div className="text-[11px] text-neutral-400">
                        {new Date(req.requested_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                          <Clock size={12} /> Menunggu
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                          <CheckCircle2 size={12} /> Disetujui
                        </span>
                      )}
                      {req.status === "transferred" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 size={12} /> Ditransfer
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                          <XCircle size={12} /> Ditolak
                        </span>
                      )}

                      {req.admin_notes && (
                        <p className="text-[10px] text-neutral-500 mt-1 max-w-[200px] truncate" title={req.admin_notes}>
                          Catatan: {req.admin_notes}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleOpenAction(req, "approve")}
                              disabled={actionLoading === req.id}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleOpenAction(req, "reject")}
                              disabled={actionLoading === req.id}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {req.status === "approved" && (
                          <button
                            onClick={() => handleOpenAction(req, "transfer")}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                          >
                            Transfer Selesai
                          </button>
                        )}

                        {req.status === "transferred" && (
                          <span className="text-xs text-emerald-600 font-medium">Selesai</span>
                        )}

                        {req.status === "rejected" && (
                          <span className="text-xs text-neutral-400">Dibatalkan</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalAction && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-bold text-neutral-900 text-base">
                {modalAction === "approve" && "Setujui Permohonan Penarikan"}
                {modalAction === "transfer" && "Konfirmasi Transfer Berhasil"}
                {modalAction === "reject" && "Tolak Permohonan Penarikan"}
              </h3>
              <button
                onClick={() => setModalAction(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                <p><span className="text-neutral-500">Pemilik:</span> <span className="font-bold">{selectedItem.owner_name}</span></p>
                <p><span className="text-neutral-500">Nominal:</span> <span className="font-bold text-emerald-600">{formatIDR(selectedItem.amount)}</span></p>
                <p><span className="text-neutral-500">Rekening:</span> <span className="font-mono">{selectedItem.bank_name} {selectedItem.account_number} ({selectedItem.account_holder})</span></p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Catatan untuk Pemilik Armada (Opsional):
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Tambahkan nomor referensi transfer atau alasan penolakan..."
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={actionLoading !== null}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                    modalAction === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : modalAction === "transfer"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {actionLoading ? "Memproses..." : "Konfirmasi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
