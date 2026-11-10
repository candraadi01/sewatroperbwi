"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PricingQuote } from "@/types/database";
import { formatIDR } from "@/lib/utils/currency";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  Users,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Lock,
  MessageCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Sparkles,
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
  const params = useSearchParams();
  const [quote, setQuote] = useState<PricingQuote | null>(null);
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
    <div className="bg-[#f8fafc] min-h-screen pb-20 md:pb-28">
      {/* Header Navigasi Breadcrumb Ringkas */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="container-app py-3 flex items-center justify-between gap-3">
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#263b46] bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Kembali ke Katalog</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Lock size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Checkout Aman •</span>
            <span className="text-slate-800">SSL 256-bit Encrypted</span>
          </div>
        </div>
      </div>

      <div className="container-app pt-6 sm:pt-8 max-w-6xl mx-auto">
        {/* Judul & Pengantar */}
        <div className="mb-6 sm:mb-8">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#327691] bg-[#e9f3f7] px-3 py-1 rounded-full border border-[#ccd8de]">
            Formulir Pengajuan Resmi
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
            Lengkapi Data Pengajuan Sewa
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl">
            Pengajuan booking diproses tanpa pembayaran di awal. Tim admin kami akan memastikan kesiapan armada Trooper 4x4 dan driver lokal sebelum pembayaran dibuka.
          </p>
        </div>

        {/* Visual Progress Stepper (Modern OTA Style) */}
        <div className="mb-8 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {/* Step 1: Aktif */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2 sm:p-3 rounded-xl bg-[#e9f3f7] border border-[#327691]/40 text-[#263b46]">
              <span className="w-6 h-6 rounded-full bg-[#327691] text-white flex items-center justify-center text-xs font-black shrink-0">
                1
              </span>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black leading-tight text-[#263b46]">Pengajuan Sewa</p>
                <p className="text-[10px] text-slate-500 font-medium">Kirim Data Booking</p>
              </div>
              <span className="text-[11px] font-bold sm:hidden">1. Isi Data</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight text-slate-700">Cek Armada & Driver</p>
                <p className="text-[10px] text-slate-400 font-medium">Verifikasi Admin Cepat</p>
              </div>
              <span className="text-[11px] font-medium sm:hidden">2. Cek Unit</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight text-slate-700">Bayar Setelah Siap</p>
                <p className="text-[10px] text-slate-400 font-medium">Pilihan DP / Lunas</p>
              </div>
              <span className="text-[11px] font-medium sm:hidden">3. Bayar</span>
            </div>
          </div>
        </div>

        {/* Notifikasi Jika Belum Login */}
        {isLoggedIn === false && (
          <div className="mb-8 bg-sky-50 border border-sky-200 text-sky-900 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-[#327691] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Sedang memesan tanpa login</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Data yang Anda isi tetap aman. Anda dapat masuk akun kapan saja agar pesanan langsung tersimpan ke riwayat profil Anda.
                </p>
              </div>
            </div>
            <Link
              href={`/login?redirectTo=${encodeURIComponent(
                typeof window !== "undefined"
                  ? window.location.pathname + window.location.search
                  : "/checkout"
              )}`}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#327691] border border-slate-200 font-bold text-xs rounded-xl transition whitespace-nowrap shadow-2xs"
            >
              Masuk Akun →
            </Link>
          </div>
        )}

        {/* Grid 2 Kolom: Kiri (Formulir Data) - Kanan (Rincian Ringkasan) */}
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-8 items-start">
          {/* Kolom Kiri: Form Data Pemesan */}
          <form
            key={`${draft.email || ""}-${draft.name || ""}`}
            onSubmit={submit}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-7 space-y-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <User size={18} className="text-[#327691]" />
                <span>Identitas Kontak Pemesan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data ini digunakan driver dan admin untuk koordinasi penjemputan.
              </p>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-[#327691]" />
                <span>Nama Lengkap Pemesan *</span>
              </label>
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                defaultValue={draft.name || ""}
                onChange={(e) => updateDraft("name", e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-3 outline-hidden transition shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Grid No HP & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-[#327691]" />
                  <span>Nomor WhatsApp Aktif *</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={18}
                  autoComplete="tel"
                  placeholder="Contoh: 081234567890"
                  defaultValue={draft.phone || ""}
                  onChange={(e) => updateDraft("phone", e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-3 outline-hidden transition shadow-2xs placeholder:text-slate-400"
                />
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  Driver akan menghubungi nomor ini saat penjemputan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#327691]" />
                  <span>Alamat Email Aktif *</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  placeholder="nama@email.com"
                  defaultValue={draft.email || ""}
                  onChange={(e) => updateDraft("email", e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-3 outline-hidden transition shadow-2xs placeholder:text-slate-400"
                />
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  E-voucher & bukti booking resmi dikirim via email.
                </span>
              </div>
            </div>

            {/* Titik Lokasi Jemput */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#327691]" />
                <span>Alamat / Nama Tempat Penjemputan</span>
              </label>
              <input
                name="pickupAddress"
                maxLength={500}
                defaultValue={draft.pickupAddress || quote.pickup_address}
                onChange={(e) => updateDraft("pickupAddress", e.target.value)}
                placeholder="Contoh: Lobby Hotel Dialoog / Stasiun Ketapang / Rumah Jl. Sudirman No 12"
                className="w-full text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-3 outline-hidden transition shadow-2xs placeholder:text-slate-400"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                Area: {quote.pickup_zone?.name || "Titik awal layanan / Kota Banyuwangi"}
              </span>
            </div>

            {/* Catatan Perjalanan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText size={13} className="text-[#327691]" />
                <span>Catatan Tambahan untuk Driver (Opsional)</span>
              </label>
              <textarea
                name="notes"
                maxLength={1000}
                rows={3}
                defaultValue={draft.notes || ""}
                onChange={(e) => updateDraft("notes", e.target.value)}
                placeholder="Contoh: Ada lansia/anak kecil, bawa koper 3 buah, atau jam tiba kereta api pukul 07.15 WIB."
                className="w-full text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3.5 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Informasi Pembayaran & Konfirmasi Unit */}
            <div className="pt-4 border-t border-slate-100">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f0f7fa] border border-[#327691]/25 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#327691] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                      Informasi Konfirmasi Unit & Pembayaran
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Pemesanan Anda diverifikasi terlebih dahulu oleh tim admin untuk memastikan kesiapan armada dan driver:
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#e9f3f7] text-[#327691] text-[11px] font-black inline-flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span>Konfirmasi Unit & Driver</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug pl-6.5">
                      Admin akan mengecek kesiapan Jeep Trooper 4x4 dan jadwal driver untuk tanggal pilihan Anda.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#e9f3f7] text-[#327691] text-[11px] font-black inline-flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span>Pembayaran Setelah Disetujui</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug pl-6.5">
                      Setelah pesanan disetujui, Anda dapat memilih metode pembayaran (DP atau Lunas) di halaman pesanan Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox Persetujuan Syarat Ketentuan */}
            <div className="pt-2">
              <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer">
                <input
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 rounded-sm accent-[#327691] w-4 h-4 cursor-pointer"
                />
                <span className="leading-relaxed">
                  Saya menyetujui{" "}
                  <Link href="/syarat-ketentuan" target="_blank" className="text-[#327691] font-bold underline hover:text-[#263b46]">
                    Syarat & Ketentuan Layanan
                  </Link>
                  ,{" "}
                  <Link href="/kebijakan-pembatalan" target="_blank" className="text-[#327691] font-bold underline hover:text-[#263b46]">
                    Kebijakan Pembatalan
                  </Link>
                  , serta memahami proses verifikasi armada oleh pengelola Sewa Trooper Banyuwangi.
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Utama Kirim Pengajuan */}
            <button
              type="submit"
              disabled={busy || quote.is_sample_pricing}
              className="w-full py-4 px-6 rounded-xl bg-[#327691] hover:bg-[#263b46] active:bg-[#1b2a32] text-white font-black text-sm sm:text-base shadow-lg shadow-[#327691]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
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

            {/* Jaminan Keamanan Data */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-[11px] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Konfirmasi Unit Sebelum Bayar</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#327691]" />
                <span>Verifikasi Armada Cepat</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock size={12} className="text-slate-500" />
                <span>Data Pribadi Terjamin Aman</span>
              </span>
            </div>
          </form>

          {/* Kolom Kanan: Rincian Perjalanan & Ringkasan Biaya */}
          <aside className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-6 lg:sticky lg:top-24 space-y-5 overflow-hidden">
            {/* Header Rincian */}
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Ringkasan Pemesanan
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mt-1">
                {quote.product_name}
              </h3>
            </div>

            {/* Jadwal & Detail Spesifikasi */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
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
                  <strong>{quote.num_units} Unit</strong> Jeep Trooper 4x4 •{" "}
                  <strong>{quote.num_passengers} Orang</strong> Peserta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#327691] shrink-0" />
                <span className="truncate">
                  {quote.pickup_zone?.name || "Titik Awal Layanan (Kota Banyuwangi)"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/70 flex justify-end">
                <Link
                  href={`/sewa/${(quote as any).product_slug || quote.product_id}?date=${encodeURIComponent(quote.service_date)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#327691] hover:text-[#263b46] hover:underline bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs transition"
                >
                  <span>✏️ Ubah Jadwal / Jumlah Unit</span>
                </Link>
              </div>
            </div>

            {/* Rincian Harga */}
            <div className="space-y-2.5 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Rincian Biaya
              </span>
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
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
                <span className="text-xs font-bold text-slate-600">Total Nilai Sewa:</span>
                <span className="text-lg sm:text-xl font-black text-[#263b46]">
                  {formatIDR(quote.total_amount)}
                </span>
              </div>

              {/* Status Alur Pembayaran */}
              <div className="p-3.5 rounded-xl bg-[#e9f3f7] border border-[#ccd8de] text-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Status Tahap Ini:</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#263b46] bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#327691] animate-pulse" />
                    Menunggu Konfirmasi Unit
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Pembayaran akan dibuka setelah Admin & Pemilik Armada menyetujui ketersediaan kendaraan.
                </p>
              </div>

              {/* Ketentuan Opsi Pembayaran Nanti */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Ketentuan Pembayaran Saat Disetujui:
                </span>
                <div className="flex justify-between text-slate-700">
                  <span>Pilihan DP (30%):</span>
                  <span className="font-bold text-slate-900">{formatIDR(quote.dp_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-700 pt-1.5 border-t border-slate-200/70">
                  <span>Pilihan Lunas (100%):</span>
                  <span className="font-bold text-slate-900">{formatIDR(quote.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Kotak Jaminan & Kepastian Layanan */}
            <div className="p-4 rounded-xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#254958] space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-[#2c6881]">
                <ShieldCheck size={16} className="text-[#327691] shrink-0" />
                <span>Pasti Jalan & Terjamin Resmi</span>
              </p>
              <p className="text-[11.5px] leading-relaxed text-slate-600">
                Sistem kami mengutamakan kepastian ketersediaan armada. Pembayaran hanya akan dibuka setelah jadwal dan unit Trooper Anda disetujui.
              </p>
            </div>

            {/* Bantuan WhatsApp CS */}
            <div className="pt-2 text-center">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Sewa%20Trooper,%20saya%20sedang%20mengisi%20checkout%20dan%20ada%20pertanyaan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
              >
                <MessageCircle size={14} className="text-emerald-600" />
                <span>Butuh panduan pengajuan? Chat CS WhatsApp</span>
              </a>
            </div>
          </aside>
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
