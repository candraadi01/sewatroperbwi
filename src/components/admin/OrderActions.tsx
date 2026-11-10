"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ActionMode = "status" | "approve" | "reject";

export function OrderActions({
  id,
  status,
  currentStartTime,
}: {
  id: string;
  status: string;
  currentStartTime?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ActionMode>("status");
  const router = useRouter();

  // Standard admin status transitions (post-approval flow)
  const next: Record<string, { value: string; label: string }[]> = {
    payment_received: [
      { value: "confirmed", label: "Konfirmasi kendaraan" },
      { value: "cancelled_by_admin", label: "Batalkan oleh admin" },
    ],
    confirmed: [
      { value: "in_progress", label: "Mulai perjalanan" },
      { value: "cancelled_by_admin", label: "Batalkan oleh admin" },
    ],
    in_progress: [{ value: "completed", label: "Selesaikan perjalanan" }],
  };

  async function change(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        id,
        status: form.get("status"),
        reason: form.get("reason"),
      };
      const st = String(form.get("start_time") || "").trim();
      if (st) body.start_time = st;

      const r = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal mengubah status.");
      router.refresh();
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah status.");
    } finally {
      setBusy(false);
    }
  }

  async function approve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        id,
        note: String(form.get("note") || ""),
        expiresHours: Number(form.get("expiresHours") || 48),
      };
      const st = String(form.get("start_time") || "").trim();
      if (st) body.start_time = st;

      const r = await fetch("/api/admin/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal menyetujui pesanan.");
      router.refresh();
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyetujui pesanan.");
    } finally {
      setBusy(false);
    }
  }

  async function reject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/orders/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          reason: String(form.get("reason") || ""),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Gagal menolak pesanan.");
      router.refresh();
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menolak pesanan.");
    } finally {
      setBusy(false);
    }
  }

  // Pending review: show approve / reject buttons
  if (status === "pending_review") {
    return (
      <div className="space-y-3.5">
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Perlu Konfirmasi Admin</span>
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-snug">
            Cek kesiapan unit Trooper &amp; jadwal driver sebelum menyetujui pesanan ini.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setMode(mode === "approve" ? "status" : "approve")}
            className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
              mode === "approve"
                ? "bg-[#263b46] text-white ring-2 ring-[#327691]"
                : "bg-[#327691] hover:bg-[#263b46] text-white"
            }`}
          >
            <span>✓ Setujui</span>
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "reject" ? "status" : "reject")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
              mode === "reject"
                ? "bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-200"
                : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <span>✕ Tolak</span>
          </button>
        </div>

        {mode === "approve" && (
          <form
            onSubmit={approve}
            className="space-y-3 bg-white dark:bg-neutral-800 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl p-3.5 shadow-sm"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-200 uppercase tracking-wider mb-1">
                Catatan untuk Buyer (Opsional)
              </label>
              <input
                name="note"
                maxLength={1000}
                placeholder="Armada ready & driver siap tepat waktu."
                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-lg px-3 py-2 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-200 uppercase tracking-wider mb-1">
                Batas Waktu Pembayaran (Jam)
              </label>
              <input
                name="expiresHours"
                type="number"
                min={1}
                max={720}
                defaultValue={48}
                required
                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-lg px-3 py-2 outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Buyer diberi waktu 48 jam untuk membayar setelah disetujui.
              </span>
            </div>

            {error && (
              <p role="alert" className="text-xs text-rose-600 font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 px-4 rounded-xl bg-[#327691] hover:bg-[#263b46] text-white font-black text-xs shadow-xs transition cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-1.5"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyetujui…</span>
                </>
              ) : (
                <span>Konfirmasi Persetujuan (ACC) →</span>
              )}
            </button>
          </form>
        )}

        {mode === "reject" && (
          <form
            onSubmit={reject}
            className="space-y-3 bg-white dark:bg-neutral-800 border-2 border-rose-300 dark:border-rose-700 rounded-xl p-3.5 shadow-sm"
          >
            <div>
              <label className="block text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1">
                Alasan Penolakan (Wajib)
              </label>
              <input
                name="reason"
                required
                maxLength={1000}
                placeholder="Armada penuh untuk tanggal yang dipilih."
                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-rose-400 rounded-lg px-3 py-2 outline-hidden"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-rose-600 font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-1.5"
            >
              {busy ? "Menolak…" : "Konfirmasi Penolakan"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Approved: show reject option (buyer hasn't paid yet, admin can still cancel)
  if (status === "approved") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
          ✓ Disetujui — menunggu pembayaran buyer.
        </p>
        <button
          className="text-sm text-red-600 dark:text-red-400 underline cursor-pointer"
          onClick={() => setMode(mode === "reject" ? "status" : "reject")}
          type="button"
        >
          Batalkan persetujuan
        </button>
        {mode === "reject" && (
          <form
            onSubmit={reject}
            className="space-y-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <label className="admin-field">
              Alasan pembatalan
              <input name="reason" required maxLength={1000} />
            </label>
            {error && (
              <p role="alert" className="notice-error">
                {error}
              </p>
            )}
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium w-full hover:bg-red-700 transition-colors cursor-pointer"
              disabled={busy}
            >
              {busy ? "Membatalkan…" : "Konfirmasi Pembatalan"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Standard status transitions
  if (!next[status]) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-neutral-500">
          Tidak ada perubahan status yang tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={change} className="space-y-3">
        <label className="admin-field">
          Tindakan
          <select name="status">
            {next[status].map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          Alasan / catatan untuk riwayat buyer
          <input name="reason" maxLength={1000} required />
        </label>
        {error && (
          <p role="alert" className="notice-error">
            {error}
          </p>
        )}
        <button className="action-link cursor-pointer" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan status"}
        </button>
      </form>
    </div>
  );
}
