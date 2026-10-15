"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function OrderActions({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  const next: Record<string, { value: string; label: string }[]> = {
    pending_payment: [
      { value: "cancelled_by_admin", label: "Tutup pesanan belum dibayar" },
    ],
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
  if (!next[status])
    return (
      <p className="text-sm text-neutral-500">
        {status === "pending_payment"
          ? "Menunggu pembayaran terverifikasi."
          : "Tidak ada perubahan status yang tersedia."}
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
