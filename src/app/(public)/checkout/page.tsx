"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PricingQuote } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
import { createClient } from "@/lib/supabase/client";

interface DraftFields {
  name?: string;
  phone?: string;
  email?: string;
  pickupAddress?: string;
  notes?: string;
  choice?: "dp" | "full";
}

function Checkout() {
  const params = useSearchParams();
  const [quote, setQuote] = useState<PricingQuote | null>(null),
    [ready, setReady] = useState(false),
    [choice, setChoice] = useState<"dp" | "full">("dp"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [draft, setDraft] = useState<DraftFields>({}),
    [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const key = useRef("");

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!active) return;
      try {
        const raw =
          sessionStorage.getItem("pending_booking_quote") ||
          localStorage.getItem("pending_booking_quote") ||
          "null";
        const saved = JSON.parse(raw);
        if (
          saved &&
          (!params.get("quote_id") || saved.quote_id === params.get("quote_id"))
        ) {
          setQuote(saved);
        }

        // Restore draft fields if saved before login
        const savedDraft = JSON.parse(
          sessionStorage.getItem("checkout_draft_fields") ||
            localStorage.getItem("checkout_draft_fields") ||
            "{}"
        );
        if (savedDraft) {
          setDraft(savedDraft);
          if (savedDraft.choice) setChoice(savedDraft.choice);
        }

        // Check user auth state to prefill email/name if not in draft
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          setDraft((prev) => ({
            ...prev,
            email: prev.email || user.email || "",
            name:
              prev.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              "",
            phone: prev.phone || user.user_metadata?.phone || "",
          }));
        } else {
          setIsLoggedIn(false);
        }
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
    const form = e.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setError("");

    const formDataPayload = {
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
      idempotencyKey: "",
      expectedTotal: quote.total_amount,
    };

    try {
      const intent = "booking-intent:" + quote.quote_id;
      key.current ||= sessionStorage.getItem(intent) || crypto.randomUUID();
      sessionStorage.setItem(intent, key.current);
      formDataPayload.idempotencyKey = key.current;

      const r = await fetch("/api/checkout/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataPayload),
      });
      const data = await r.json();

      if (r.status === 401) {
        // User not logged in: persist draft fields so nothing is lost upon login
        try {
          const draftToSave = {
            name: formDataPayload.contactName,
            phone: formDataPayload.contactPhone,
            email: formDataPayload.contactEmail,
            pickupAddress: formDataPayload.pickupAddress,
            notes: formDataPayload.notes,
            choice,
          };
          sessionStorage.setItem("checkout_draft_fields", JSON.stringify(draftToSave));
          localStorage.setItem("checkout_draft_fields", JSON.stringify(draftToSave));
          sessionStorage.setItem("pending_booking_quote", JSON.stringify(quote));
          localStorage.setItem("pending_booking_quote", JSON.stringify(quote));
        } catch {}

        const returnPath = window.location.pathname + window.location.search;
        window.location.assign(`/login?redirectTo=${encodeURIComponent(returnPath)}`);
        return;
      }

      if (!r.ok) throw new Error(data.error || "Pesanan belum dapat diproses.");

      // Booking submitted — clean up all pending draft storage
      try {
        sessionStorage.removeItem("pending_booking_quote");
        localStorage.removeItem("pending_booking_quote");
        sessionStorage.removeItem("checkout_draft_fields");
        localStorage.removeItem("checkout_draft_fields");
      } catch {}

      window.location.assign("/pesanan/" + encodeURIComponent(data.data.bookingId));
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
        Isi data pemesan, lalu kirim permintaan. Admin akan mengonfirmasi ketersediaan kendaraan
        sebelum kamu diminta membayar.
      </p>

      {isLoggedIn === false && (
        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold">💡 Kamu belum masuk ke akun</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Masuk agar pesanan langsung terhubung ke profilmu. Rincian perjalanan yang sudah dipilih akan tetap tersimpan aman.
            </p>
          </div>
          <Link
            href={`/login?redirectTo=${encodeURIComponent(
              typeof window !== "undefined"
                ? window.location.pathname + window.location.search
                : "/checkout"
            )}`}
            className="action-link text-xs py-2 px-3 whitespace-nowrap shrink-0"
          >
            Masuk sekarang →
          </Link>
        </div>
      )}

      {/* 3-Step Visual Flow Indicator */}
      <div className="mt-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
        <div className="p-3 rounded-xl border-2 border-[#327691] bg-[#e9f3f7] font-bold text-[#263b46] shadow-xs">
          <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-[#327691] text-white text-[11px] font-bold mr-2">
            1
          </span>
          Pengajuan Booking (Rp 0)
        </div>
        <div className="p-3 rounded-xl border border-[#e4ebef] bg-white text-[#53636d] flex items-center">
          <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 text-[11px] font-bold mr-2">
            2
          </span>
          Admin Cek Ketersediaan
        </div>
        <div className="p-3 rounded-xl border border-[#e4ebef] bg-white text-[#53636d] flex items-center">
          <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 text-[11px] font-bold mr-2">
            3
          </span>
          Bayar Setelah Disetujui
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 mt-4">
        <form
          key={`${draft.email || ""}-${draft.name || ""}`}
          onSubmit={submit}
          className="admin-panel space-y-5"
        >
          <h2 className="text-xl font-semibold">Data pemesan</h2>
          <label className="admin-field">
            Nama lengkap
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              defaultValue={draft.name || ""}
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
              defaultValue={draft.phone || ""}
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
              defaultValue={draft.email || ""}
            />
          </label>
          <label className="admin-field">
            Detail titik jemput
            <input
              name="pickupAddress"
              maxLength={500}
              defaultValue={draft.pickupAddress || quote.pickup_address}
            />
          </label>
          <label className="admin-field">
            Catatan (opsional)
            <textarea
              name="notes"
              maxLength={1000}
              rows={3}
              defaultValue={draft.notes || ""}
            />
          </label>
          <fieldset>
            <legend className="font-semibold mb-1.5">Rencana pembayaran (Dibayar setelah disetujui admin)</legend>
            <p className="text-xs text-neutral-500 mb-3">
              Tidak ada penagihan sekarang. Pilih rencana pembayaran saat admin menyetujui kendaraan Anda:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["dp", "full"] as const).map((v) => (
                <label
                  key={v}
                  className={
                    "flex gap-3 rounded-xl border p-4 cursor-pointer " +
                    (choice === v
                      ? "border-[#327691] bg-[#e9f3f7]"
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
                    {v === "dp" ? "Rencana Bayar DP" : "Rencana Bayar Lunas"}
                    <strong className="block mt-1 text-[#263b46]">
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
            className="action-link w-full justify-center py-3 text-sm font-bold"
            disabled={busy || quote.is_sample_pricing}
          >
            {busy ? "Mengirim pengajuan…" : "Kirim Pengajuan Booking (Tanpa Bayar Sekarang)"}
          </button>
          <p className="text-xs text-neutral-500">
            Pesanan akan disimpan dengan status{" "}
            <strong>Menunggu konfirmasi admin</strong>. Setelah admin menyetujui ketersediaan kendaraan,
            kamu akan menerima notifikasi untuk menyelesaikan pembayaran.
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
              <dt>Total Nilai Sewa</dt>
              <dd>{formatIDR(quote.total_amount)}</dd>
            </div>
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-emerald-800 font-semibold">
              <dt>Dibayar sekarang</dt>
              <dd className="text-base font-extrabold">Rp 0 (Gratis)</dd>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 pt-1">
              <dt>Tagihan saat disetujui ({choice === "dp" ? "DP" : "Lunas"})</dt>
              <dd className="font-semibold text-neutral-700">
                {formatIDR(choice === "dp" ? quote.dp_amount : quote.total_amount)}
              </dd>
            </div>
            {choice === "dp" && (
              <div className="flex justify-between text-xs text-neutral-400">
                <dt>Sisa setelah pelunasan</dt>
                <dd>{formatIDR(quote.remaining_amount)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 p-3 rounded-xl bg-[#f4f9fb] border border-[#e4ebef] text-xs text-[#53636d] space-y-1">
            <p className="font-semibold text-[#263b46]">🛡 Jaminan Keamanan:</p>
            <p>
              Admin memastikan kendaraan dan sopir siap sebelum Anda diminta membayar, sehingga Anda tidak perlu khawatir unit tidak tersedia.
            </p>
          </div>
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
