"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/lib/utils/currency";
import type { Product, PickupZone, PricingQuote } from "@/types/database";
export function BookingWidget({
  product,
  pickupZones,
  initialDate,
  today,
}: {
  product: Product;
  pickupZones: PickupZone[];
  initialDate: string;
  today: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate),
    [time, setTime] = useState(
      product.default_start_time?.slice(0, 5) || "08:00",
    ),
    [units, setUnits] = useState(1),
    [passengers, setPassengers] = useState(
      Math.min(4, product.passenger_capacity),
    ),
    [zone, setZone] = useState(""),
    [address, setAddress] = useState(""),
    [promo, setPromo] = useState("");
  const [quote, setQuote] = useState<PricingQuote | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setQuote(null);
      setError("");
      try {
        const r = await fetch("/api/pricing/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            productId: product.id,
            serviceDate: date,
            startTime: time,
            numUnits: units,
            numPassengers: passengers,
            pickupZoneId: zone || undefined,
            pickupAddress: address,
            promoCode: promo.trim(),
          }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Harga belum tersedia.");
        if (!controller.signal.aborted) setQuote(data.data);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Jaringan bermasalah.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [product.id, date, time, units, passengers, zone, address, promo]);
  const pending =
    loading ||
    !quote ||
    quote.service_date !== date ||
    quote.start_time !== time ||
    quote.num_units !== units ||
    quote.num_passengers !== passengers ||
    (quote.pickup_zone?.id || "") !== zone ||
    quote.pickup_address !== address ||
    (quote.promo_code || "") !== promo.trim();
  function next() {
    if (!quote || pending) return;
    try {
      sessionStorage.setItem("pending_booking_quote", JSON.stringify(quote));
      localStorage.setItem("pending_booking_quote", JSON.stringify(quote));
    } catch {}
    router.push("/checkout?quote_id=" + encodeURIComponent(quote.quote_id));
  }
  return (
    <aside className="admin-panel lg:sticky lg:top-24">
      <h2 className="text-xl font-semibold">Rencanakan perjalanan</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Pilih tanggal untuk melihat rincian harga.
      </p>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <label className="admin-field">
          Tanggal
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
          />
        </label>
        <label className="admin-field">
          Jam berangkat (WIB)
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <label className="admin-field">
          Jumlah unit
          <input
            type="number"
            min={1}
            max={10}
            value={units}
            onChange={(e) => {
              const n = Math.max(1, Math.min(10, Number(e.target.value)));
              setUnits(n);
              setPassengers((p) => Math.min(p, n * product.passenger_capacity));
            }}
          />
        </label>
        <label className="admin-field">
          Jumlah peserta
          <input
            type="number"
            min={1}
            max={units * product.passenger_capacity}
            value={passengers}
            onChange={(e) =>
              setPassengers(
                Math.max(
                  1,
                  Math.min(
                    units * product.passenger_capacity,
                    Number(e.target.value),
                  ),
                ),
              )
            }
          />
        </label>
      </div>
      <p className="text-xs text-neutral-500 mt-2">
        Maksimal {product.passenger_capacity} peserta per unit.
      </p>
      <div className="mt-5 space-y-4">
        <label className="admin-field">
          Area penjemputan
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="">Titik awal layanan / tanpa tambahan jemput</option>
            {pickupZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}{" "}
                {z.surcharge
                  ? `(+${formatIDR(z.surcharge)} / unit)`
                  : "(termasuk)"}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          Detail titik jemput
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            placeholder="Nama hotel, alamat, atau titik temu"
          />
        </label>
        <label className="admin-field">
          Kode promo (opsional)
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value.toUpperCase())}
            maxLength={50}
          />
        </label>
      </div>
      <div className="mt-6 border-t border-neutral-200 pt-5" aria-live="polite">
        {loading ? (
          <p className="text-sm text-neutral-500">Menghitung harga…</p>
        ) : error ? (
          <p className="notice-error">{error}</p>
        ) : (
          quote && (
            <>
              <div className="space-y-3 text-sm">
                {quote.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <span className="text-neutral-600">{b.label}</span>
                    <span className="shrink-0">{formatIDR(b.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-200 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatIDR(quote.total_amount)}</span>
              </div>
              <div className="mt-3 text-sm flex justify-between">
                <span>DP</span>
                <span>{formatIDR(quote.dp_amount)}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Bisa pilih DP atau lunas saat checkout.
              </p>
            </>
          )
        )}
      </div>
      {quote?.is_sample_pricing && (
        <p className="notice-warning mt-4">
          Tarif ilustrasi. Pembayaran belum dibuka untuk paket ini.
        </p>
      )}
      <button
        className="action-link mt-6 w-full justify-center text-sm py-3 font-bold"
        onClick={next}
        disabled={pending || !quote || quote.is_sample_pricing}
      >
        Lanjutkan Pengajuan Booking →
      </button>
      <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-sky-800">
          <span>✓</span> Pengajuan Tanpa Bayar di Awal
        </p>
        <p className="text-sky-700">
          Admin akan memeriksa ketersediaan armada Trooper terlebih dahulu. Setelah admin menyetujui, Anda baru dapat melakukan pembayaran DP atau lunas.
        </p>
      </div>
    </aside>
  );
}
