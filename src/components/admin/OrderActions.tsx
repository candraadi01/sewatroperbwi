"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ActionMode = "status" | "approve" | "reject";

export function OrderActions({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [mode, setMode] = useState<ActionMode>("status");
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
      const r = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: form.get("status"),
          reason: form.get("reason"),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.refresh();
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
      const r = await fetch("/api/admin/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          note: String(form.get("note") || ""),
          expiresHours: Number(form.get("expiresHours") || 48),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.refresh();
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
      if (!r.ok) throw new Error(d.error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menolak pesanan.");
    } finally {
      setBusy(false);
    }
  }

  // Pending review: show approve / reject buttons
  if (status === "pending_review") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⏳ Menunggu konfirmasi admin — periksa ketersediaan kendaraan.
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 action-link text-center justify-center"
            onClick={() => setMode(mode === "approve" ? "status" : "approve")}
            type="button"
          >
            ✓ Setujui
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
            onClick={() => setMode(mode === "reject" ? "status" : "reject")}
            type="button"
          >
            ✕ Tolak
          </button>
        </div>
        {mode === "approve" && (
          <form onSubmit={approve} className="space-y-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <label className="admin-field">
              Catatan untuk buyer (opsional)
              <input name="note" maxLength={1000} placeholder="Kendaraan tersedia. Silakan lanjutkan pembayaran." />
            </label>
            <label className="admin-field">
              Batas waktu pembayaran (jam)
              <input name="expiresHours" type="number" min={1} max={720} defaultValue={48} required />
            </label>
            {error && <p role="alert" className="notice-error">{error}</p>}
            <button className="action-link w-full justify-center" disabled={busy}>
              {busy ? "Menyetujui…" : "Konfirmasi Persetujuan"}
            </button>
          </form>
        )}
        {mode === "reject" && (
          <form onSubmit={reject} className="space-y-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <label className="admin-field">
              Alasan penolakan (wajib)
              <input name="reason" required maxLength={1000} placeholder="Kendaraan tidak tersedia untuk tanggal yang dipilih." />
            </label>
            {error && <p role="alert" className="notice-error">{error}</p>}
            <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium w-full hover:bg-red-700 transition-colors" disabled={busy}>
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
      <div className="space-y-4">
        <p className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ Disetujui — menunggu pembayaran buyer.
        </p>
        <button
          className="text-sm text-red-600 underline"
          onClick={() => setMode(mode === "reject" ? "status" : "reject")}
          type="button"
        >
          Batalkan persetujuan
        </button>
        {mode === "reject" && (
          <form onSubmit={reject} className="space-y-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <label className="admin-field">
              Alasan pembatalan
              <input name="reason" required maxLength={1000} />
            </label>
            {error && <p role="alert" className="notice-error">{error}</p>}
            <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium w-full hover:bg-red-700 transition-colors" disabled={busy}>
              {busy ? "Membatalkan…" : "Konfirmasi Pembatalan"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Standard status transitions
  if (!next[status])
    return (
      <p className="text-sm text-neutral-500">
        Tidak ada perubahan status yang tersedia.
      </p>
    );
  return (
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
      <button className="action-link" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan status"}
      </button>
    </form>
  );
}