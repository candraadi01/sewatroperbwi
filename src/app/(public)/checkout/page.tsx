"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { PricingQuote } from "@/types/database";
import styles from "@/components/landing/cinematic.module.css";
import { formatIDR } from "@/lib/utils/currency";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  Car,
  MapPin,
  User,
  Lock,
  MessageCircle,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react";

interface DraftFields {
  name?: string;
  phone?: string;
  email?: string;
  pickupAddress?: string;
  notes?: string;
  choice?: "dp" | "full";
}

function formatIndonesianDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const [quote, setQuote] = useState<(PricingQuote & { product_slug?: string }) | null>(null);
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<"dp" | "full">("dp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<DraftFields>({});
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const key = useRef("");

  function updateDraft(field: keyof DraftFields, val: string | "dp" | "full") {
    setDraft((prev) => {
      const nextDraft = { ...prev, [field]: val };
      try {
        sessionStorage.setItem("checkout_draft_fields", JSON.stringify(nextDraft));
        localStorage.setItem("checkout_draft_fields", JSON.stringify(nextDraft));
      } catch {}
      return nextDraft;
    });
  }

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
        if (saved && (saved.product_id || saved.quote_id)) {
          setQuote(saved);
        }

        // Restore draft fields if saved before login
        const savedDraft = JSON.parse(
          sessionStorage.getItem("checkout_draft_fields") ||
            localStorage.getItem("checkout_draft_fields") ||
            "{}"
        );
        const initialPickup =
          savedDraft?.pickupAddress ||
          saved?.pickup_address ||
          saved?.pickup_zone?.name ||
          "";

        if (savedDraft) {
          setDraft({
            ...savedDraft,
            ...(initialPickup ? { pickupAddress: initialPickup } : {}),
          });
          if (savedDraft.choice) setChoice(savedDraft.choice);
        } else if (initialPickup) {
          setDraft((prev) => ({
            ...prev,
            pickupAddress: initialPickup,
          }));
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
        router.push(`/auth/login?redirectTo=${encodeURIComponent(returnPath)}`);
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

      router.push("/pesanan/" + encodeURIComponent(data.data.bookingId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Jaringan bermasalah.");
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="container-app py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-3 border-[#327691] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Memuat formulir pengajuan sewa…</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container-app py-16 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Pilih Paket Wisata Terlebih Dahulu</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Belum ada rincian paket sewa Jeep yang dipilih di perangkat ini. Silakan pilih paket wisata impian Anda dari katalog kami.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sewa"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#327691] hover:bg-[#263b46] text-white text-sm font-bold shadow-md transition"
          >
            Buka Katalog Sewa Jeep →
          </Link>
          <Link
            href="/akun/pesanan"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
          >
            Lihat Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 sm:pb-24">
      {/* Header Navigasi Breadcrumb Ringkas */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="container-app py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#263b46] bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Kembali ke Katalog</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Lock size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Checkout Aman •</span>
            <span className="text-slate-700">SSL 256-bit</span>
          </div>
        </div>
      </div>

      <div className="container-app pt-5 sm:pt-7 max-w-5xl mx-auto">
        {/* Judul Halaman Ringkas */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Pengajuan Sewa
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Konfirmasi jadwal dan kontak penjemputan. Pembayaran dibuka setelah admin mengonfirmasi armada.
          </p>
        </div>

        {/* Notifikasi Jika Belum Login (Kompak & Elegan) */}
        {isLoggedIn === false && (
          <div className="mb-5 bg-sky-50 border border-sky-200 text-sky-900 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Info size={18} className="text-[#327691] shrink-0" />
              <p className="text-xs sm:text-sm text-slate-700 truncate">
                Memesan tanpa akun? Anda juga dapat <strong className="text-[#327691]">masuk akun</strong> agar tersimpan ke profil.
              </p>
            </div>
            <Link
              href={`/auth/login?redirectTo=${encodeURIComponent(
                typeof window !== "undefined"
                  ? window.location.pathname + window.location.search
                  : "/checkout"
              )}`}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#327691] border border-slate-200 font-bold text-xs rounded-xl transition shrink-0 shadow-2xs"
            >
              Masuk
            </Link>
          </div>
        )}

        {/* Grid 2 Kolom Responsif: Form di Kiri, Ringkasan di Kanan */}
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-6 items-start">
          {/* Kolom Ringkasan Pemesanan */}
          <aside
            aria-label="Ringkasan pemesanan"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 lg:sticky lg:top-24 space-y-4 lg:col-start-2"
          >
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Ringkasan Pemesanan
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
                {quote.product_name}
              </h2>
            </div>

            {/* Jadwal & Detail Spesifikasi Ringkas */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#327691] shrink-0" />
                <span className="font-semibold">{formatIndonesianDate(quote.service_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#327691] shrink-0" />
                <span>Pukul {quote.start_time} WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Car size={14} className="text-[#327691] shrink-0" />
                <span>
                  <strong>{quote.num_units} Unit</strong> Jeep Trooper •{" "}
                  <strong>{quote.num_passengers} Orang</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#327691] shrink-0" />
                <span className="truncate">
                  {quote.pickup_zone?.name || "Banyuwangi Kota"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                <Link
                  href={`/sewa/${quote.product_slug || quote.product_id}?date=${encodeURIComponent(quote.service_date)}#booking-card`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#327691] hover:underline"
                >
                  <span>Ubah Jadwal</span>
                </Link>
              </div>
            </div>

            {/* Rincian Biaya Bersih */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                {quote.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between gap-3 text-slate-600">
                    <span>{b.label}</span>
                    <span className="font-semibold text-slate-900 shrink-0">
                      {formatIDR(b.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Biaya */}
              <div className="pt-2 flex justify-between items-baseline border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600">Total Biaya:</span>
                <span className="text-lg sm:text-xl font-black text-[#263b46]">
                  {formatIDR(quote.total_amount)}
                </span>
              </div>

              {quote.dp_amount > 0 && quote.dp_amount < quote.total_amount && (
                <div className="flex items-center justify-between text-xs text-[#2c6881] font-semibold pt-0.5">
                  <span>Pilihan DP Saat Disetujui:</span>
                  <span className="font-extrabold">{formatIDR(quote.dp_amount)}</span>
                </div>
              )}
            </div>

            {/* Bantuan CS Ringkas */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Sewa%20Trooper,%20saya%20ada%20pertanyaan%20tentang%20booking"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
              >
                <MessageCircle size={14} className="text-emerald-600" />
                <span>Ada pertanyaan? Chat WhatsApp Admin</span>
              </a>
            </div>
          </aside>

          {/* Kolom Form Data Pemesan */}
          <form
            onSubmit={submit}
            className={`${styles.bookingMotion} bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4 lg:col-start-1 lg:row-start-1`}
          >
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <User size={18} className="text-[#327691]" />
                <span>Kontak Pemesan</span>
              </h2>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="booking-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap *
              </label>
              <input
                id="booking-name"
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                value={draft.name ?? ""}
                onChange={(e) => updateDraft("name", e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Grid No HP & Email */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="booking-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  id="booking-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={18}
                  autoComplete="tel"
                  placeholder="08xxxxxxxxxx"
                  value={draft.phone ?? ""}
                  onChange={(e) => updateDraft("phone", e.target.value)}
                  className="w-full text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
                />
              </div>

              <div>
                <label htmlFor="booking-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Email *
                </label>
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={draft.email ?? ""}
                  onChange={(e) => updateDraft("email", e.target.value)}
                  className="w-full text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Titik Lokasi Jemput */}
            <div>
              <label htmlFor="booking-pickupAddress" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lokasi / Alamat Penjemputan
              </label>
              <input
                id="booking-pickupAddress"
                name="pickupAddress"
                maxLength={500}
                value={draft.pickupAddress ?? quote.pickup_address ?? quote.pickup_zone?.name ?? ""}
                onChange={(e) => updateDraft("pickupAddress", e.target.value)}
                placeholder="Contoh: Hotel Dialoog / Stasiun Banyuwangi / Alamat Rumah"
                className="w-full text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Catatan Perjalanan */}
            <div>
              <label htmlFor="booking-notes" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                id="booking-notes"
                name="notes"
                maxLength={1000}
                rows={2}
                value={draft.notes ?? ""}
                onChange={(e) => updateDraft("notes", e.target.value)}
                placeholder="Contoh: Bawa koper 2 buah, jam tiba stasiun 07.15 WIB"
                className="w-full text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-2 outline-hidden transition shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Checkbox Persetujuan Syarat Ketentuan */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 rounded-sm accent-[#327691] w-4 h-4 cursor-pointer shrink-0"
                />
                <span className="leading-snug">
                  Saya menyetujui{" "}
                  <Link href="/syarat-ketentuan" target="_blank" className="text-[#327691] font-bold underline">
                    Syarat & Ketentuan
                  </Link>{" "}
                  serta kebijakan sewa armada.
                </span>
              </label>
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Utama Kirim Pengajuan */}
            <button
              type="submit"
              disabled={busy || quote.is_sample_pricing}
              className="w-full py-3.5 px-6 rounded-xl bg-[#327691] hover:bg-[#263b46] text-white font-extrabold text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirimkan Pengajuan…</span>
                </>
              ) : (
                <>
                  <span>Kirim Pengajuan Booking</span>
                  <ChevronRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>

            {/* Jaminan Singkat Bersih 1 Baris */}
            <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>Pembayaran dilakukan setelah admin mengonfirmasi armada</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-3 border-[#327691] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">Memuat halaman checkout…</p>
        </div>
      }
    >
      <Checkout />
    </Suspense>
  );
}
