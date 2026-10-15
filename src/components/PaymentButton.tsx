"use client";
import { useState, useRef } from "react";
export function PaymentButton({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const key = useRef("");
  async function pay() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      key.current ||= crypto.randomUUID();
      const r = await fetch("/api/payments/" + encodeURIComponent(code), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: key.current }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const url = new URL(d.redirectUrl);
      if (
        url.protocol !== "https:" ||
        !["app.midtrans.com", "app.sandbox.midtrans.com"].includes(url.hostname)
      )
        throw new Error("Tautan pembayaran tidak valid.");
      window.location.assign(url.href);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Pembayaran belum dapat dibuka.",
      );
      setBusy(false);
    }
  }
  return (
    <div>
      <button onClick={pay} disabled={busy} className="action-link">
        {busy ? "Membuka pembayaran…" : label}
      </button>
      {error && (
        <p role="alert" className="notice-error mt-3">
          {error}
        </p>
      )}
    </div>
  );
}
