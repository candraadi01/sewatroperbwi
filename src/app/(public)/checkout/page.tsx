"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PricingQuote } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
function Checkout() {
  const params = useSearchParams();
  const [quote, setQuote] = useState<PricingQuote | null>(null),
    [ready, setReady] = useState(false),
    [choice, setChoice] = useState<"dp" | "full">("dp"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = useRef("");
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("pending_booking_quote") || "null",
        );
        if (
          saved &&
          (!params.get("quote_id") || saved.quote_id === params.get("quote_id"))
        )
          setQuote(saved);
      } catch {}
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [params]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quote || busy) return;
    const fields = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const intent = "booking-intent:" + quote.quote_id;
      key.current ||= sessionStorage.getItem(intent) || crypto.randomUUID();
      sessionStorage.setItem(intent, key.current);
      const r = await fetch("/api/checkout/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: quote.product_id,
          serviceDate: quote.service_date,
          startTime: quote.start_time,
          numUnits: quote.num_units,
          numPassengers: quote.num_passengers,
          pickupZoneId: quote.pickup_zone?.id,
          pickupAddress: String(fields.get("pickupAddress") || ""),
          promoCode: quote.promo_code || "",
          contactName: String(fields.get("name")),
          contactPhone: String(fields.get("phone")),
          contactEmail: String(fields.get("email")),
          paymentChoice: choice,
          termsAccepted: fields.get("terms") === "on",
          notes: String(fields.get("notes") || ""),
          idempotencyKey: key.current,
          expectedTotal: quote.total_amount,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Pesanan belum dapat diproses.");
      const url = new URL(data.data.redirectUrl);
      if (
        url.protocol !== "https:" ||
        !["app.midtrans.com", "app.sandbox.midtrans.com"].includes(url.hostname)
      )
        throw new Error("Tautan pembayaran tidak valid.");
      sessionStorage.removeItem("pending_booking_quote");
      window.location.assign(url.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Jaringan bermasalah.");
      setBusy(false);
    }
  }
  if (!ready) return <div className="container-app py-16">Memuat rincian…</div>;
  if (!quote)
    return (
      <div className="container-app py-16 max-w-2xl">
        <h1 className="section-heading">Pilih layanan terlebih dahulu.</h1>
        <p className="mt-4 text-neutral-600">
          Rincian perjalanan belum tersedia di perangkat ini.
        </p>
        <Link href="/sewa" className="action-link mt-6">
          Buka katalog
        </Link>
        <Link href="/akun/pesanan" className="block mt-5 underline">
          Lihat pesanan yang sudah dibuat
        </Link>
      </div>
    );
  return (
    <div className="container-app py-9 md:py-14">
      <Link href="/sewa" className="text-sm text-neutral-600">
        ← Kembali ke katalog
      </Link>
      <h1 className="section-heading mt-5">Lengkapi pemesananmu.</h1>
      <p className="mt-3 text-neutral-600">
        Pembayaran diterima lebih dulu. Ketersediaan unit kemudian dikonfirmasi
        admin.
      </p>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 mt-8">
        <form onSubmit={submit} className="admin-panel space-y-5">
          <h2 className="text-xl font-semibold">Data pemesan</h2>
          <label className="admin-field">
            Nama lengkap
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
          </label>
          <label className="admin-field">
            Nomor WhatsApp
            <input
              name="phone"
              type="tel"
              required
              maxLength={18}
              autoComplete="tel"
              placeholder="08…"
            />
          </label>
          <label className="admin-field">
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
            />
          </label>
          <label className="admin-field">
            Detail titik jemput
            <input
              name="pickupAddress"
              maxLength={500}
              defaultValue={quote.pickup_address}
            />
          </label>
          <label className="admin-field">
            Catatan (opsional)
            <textarea name="notes" maxLength={1000} rows={3} />
          </label>
          <fieldset>
            <legend className="font-semibold mb-3">Pilihan pembayaran</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["dp", "full"] as const).map((v) => (
                <label
                  key={v}
                  className={
                    "flex gap-3 rounded-xl border p-4 cursor-pointer " +
                    (choice === v
                      ? "border-primary-700 bg-primary-50"
                      : "border-neutral-200")
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={choice === v}
                    onChange={() => setChoice(v)}
                    value={v}
                  />
                  <span className="text-sm">
                    {v === "dp" ? "Bayar DP" : "Bayar lunas"}
                    <strong className="block mt-1">
                      {formatIDR(
                        v === "dp" ? quote.dp_amount : quote.total_amount,
                      )}
                    </strong>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-3 text-sm">
            <input name="terms" type="checkbox" required className="mt-1" />
            <span>
              Saya menyetujui{" "}
              <Link
                href="/syarat-ketentuan"
                target="_blank"
                className="underline"
              >
                syarat dan ketentuan
              </Link>
              ,{" "}
              <Link
                href="/kebijakan-pembatalan"
                target="_blank"
                className="underline"
              >
                kebijakan pembatalan
              </Link>
              , serta tahap konfirmasi kendaraan oleh admin.
            </span>
          </label>
          {error && (
            <p role="alert" className="notice-error">
              {error}
            </p>
          )}
          <button
            className="action-link w-full justify-center"
            disabled={busy || quote.is_sample_pricing}
          >
            {busy ? "Membuat tagihan…" : "Lanjut ke pembayaran"}
          </button>
          <p className="text-xs text-neutral-500">
            Pembayaran diproses melalui halaman Midtrans. Status pesanan dapat
            diperiksa di{" "}
            <Link href="/akun/pesanan" className="underline">
              Pesanan Saya
            </Link>
            .
          </p>
        </form>
        <aside className="admin-panel h-fit">
          <p className="eyebrow">Rincian perjalanan</p>
          <h2 className="text-xl font-semibold mt-3">{quote.product_name}</h2>
          <p className="mt-4 text-sm text-neutral-600">
            {quote.service_date} · {quote.start_time} WIB
            <br />
            {quote.num_units} unit · {quote.num_passengers} peserta
            <br />
            {quote.pickup_zone?.name || "Titik awal layanan"}
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            {quote.breakdown.map((b, i) => (
              <div key={i} className="flex justify-between gap-4">
                <dt>{b.label}</dt>
                <dd className="shrink-0">{formatIDR(b.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t pt-4 border-neutral-200 font-semibold">
              <dt>Total</dt>
              <dd>{formatIDR(quote.total_amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Dibayar sekarang</dt>
              <dd>
                {formatIDR(
                  choice === "dp" ? quote.dp_amount : quote.total_amount,
                )}
              </dd>
            </div>
            <div className="flex justify-between text-neutral-500">
              <dt>Sisa setelah pembayaran</dt>
              <dd>{formatIDR(choice === "dp" ? quote.remaining_amount : 0)}</dd>
            </div>
          </dl>
          <p className="text-xs text-neutral-500 mt-6">
            Harga diverifikasi ulang oleh server sebelum tagihan dibuat. Jika
            berubah, kamu akan diminta memeriksa rincian terbaru.
          </p>
        </aside>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<div className="container-app py-16">Memuat…</div>}>
      <Checkout />
    </Suspense>
  );
}
