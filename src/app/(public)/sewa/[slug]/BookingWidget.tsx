"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/lib/utils/currency";
import type { Product, PickupZone, PricingQuote } from "@/types/database";
import { BuyerCalendarPicker } from "@/components/booking/BuyerCalendarPicker";
import {
  Calendar,
  Clock,
  Car,
  Users,
  MapPin,
  Tag,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Check,
  AlertCircle,
  Plus,
  Minus,
  ChevronDown,
} from "lucide-react";

interface TimeSlot {
  value: string;
  label: string;
}

function getAvailableDepartureSlots(product: Product): {
  slots: TimeSlot[];
  defaultTime: string;
} {
  const slug = (product.slug || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const route = (product.route_name || "").toLowerCase();

  const isIjen =
    slug.includes("ijen") ||
    slug.includes("sunrise") ||
    name.includes("ijen") ||
    name.includes("sunrise") ||
    route.includes("ijen");

  const isSukamade =
    slug.includes("sukamade") ||
    name.includes("sukamade") ||
    route.includes("sukamade");

  const isBaluran =
    slug.includes("baluran") ||
    name.includes("baluran") ||
    route.includes("baluran");

  let baseSlots: TimeSlot[] = [];
  let defaultVal = "08:00";

  if (isIjen) {
    defaultVal = "00:30";
    baseSlots = [
      { value: "00:00", label: "00:00 WIB (Blue Fire Express)" },
      { value: "00:30", label: "00:30 WIB (Rekomendasi Utama)" },
      { value: "01:00", label: "01:00 WIB (Standar Blue Fire)" },
      { value: "01:30", label: "01:30 WIB (Sunrise Cepat)" },
      { value: "02:00", label: "02:00 WIB (Sunrise Hunting)" },
    ];
  } else if (isSukamade) {
    defaultVal = "08:00";
    baseSlots = [
      { value: "07:00", label: "07:00 WIB (Pagi)" },
      { value: "08:00", label: "08:00 WIB (Rekomendasi Utama)" },
      { value: "09:00", label: "09:00 WIB (Pagi Menjelang Siang)" },
      { value: "10:00", label: "10:00 WIB (Batas Maksimal Berangkat)" },
    ];
  } else if (isBaluran) {
    defaultVal = "08:00";
    baseSlots = [
      { value: "06:00", label: "06:00 WIB (Pagi Sejuk & Satwa Liar)" },
      { value: "07:00", label: "07:00 WIB (Pagi Hari)" },
      { value: "08:00", label: "08:00 WIB (Standar Wisata)" },
      { value: "09:00", label: "09:00 WIB (Santai)" },
      { value: "13:00", label: "13:00 WIB (Sunset Safari)" },
    ];
  } else {
    defaultVal = "08:00";
    baseSlots = [
      { value: "06:00", label: "06:00 WIB (Pagi Hari)" },
      { value: "07:00", label: "07:00 WIB (Pagi)" },
      { value: "08:00", label: "08:00 WIB (Standar Wisata)" },
      { value: "09:00", label: "09:00 WIB (Santai)" },
      { value: "10:00", label: "10:00 WIB (Menjelang Siang)" },
      { value: "13:00", label: "13:00 WIB (Siang Safari)" },
      { value: "14:00", label: "14:00 WIB (Sore)" },
    ];
  }

  function getSlotLabel(timeStr: string): string {
    if (timeStr === "00:00") return "00:00 WIB (Blue Fire Express)";
    if (timeStr === "00:30") return "00:30 WIB (Rekomendasi Utama)";
    if (timeStr === "01:00") return "01:00 WIB (Standar Blue Fire)";
    if (timeStr === "03:00") return "03:00 WIB (Sunrise Hunting)";
    if (timeStr === "06:00") return "06:00 WIB (Pagi Sejuk)";
    if (timeStr === "07:00") return "07:00 WIB (Pagi Hari)";
    if (timeStr === "08:00") return "08:00 WIB (Standar Wisata)";
    if (timeStr === "09:00") return "09:00 WIB (Santai)";
    if (timeStr === "10:00") return "10:00 WIB (Menjelang Siang)";
    if (timeStr === "13:00") return "13:00 WIB (Sunset Safari)";
    if (timeStr === "14:00") return "14:00 WIB (Sore Hari)";
    return `${timeStr} WIB`;
  }

  const rawAdmin = product.default_start_time?.trim();
  if (rawAdmin) {
    const parts = rawAdmin
      .split(",")
      .map((s) => s.trim().slice(0, 5))
      .filter((s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s));

    if (parts.length > 0) {
      const uniqueParts = Array.from(new Set(parts)).sort();
      const adminSlots: TimeSlot[] = uniqueParts.map((p) => ({
        value: p,
        label: getSlotLabel(p),
      }));

      return {
        slots: adminSlots,
        defaultTime: uniqueParts[0],
      };
    }
  }

  return { slots: baseSlots, defaultTime: defaultVal };
}

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
  const { slots: timeSlots, defaultTime } = getAvailableDepartureSlots(product);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(defaultTime);
  const [units, setUnits] = useState(1);
  const [passengers, setPassengers] = useState(
    Math.min(4, product.passenger_capacity)
  );
  const [zone, setZone] = useState("");
  const [address, setAddress] = useState("");
  const [promo, setPromo] = useState("");
  const [showPromo, setShowPromo] = useState(false);

  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Real-time schedule availability map per catalog
  const [scheduleMap, setScheduleMap] = useState<
    Record<string, { isAvailable: boolean; reason?: string; bookedUnits: number; maxUnits: number }>
  >({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      setLoadingSchedule(true);
      try {
        const start = today;
        const endD = new Date(today + "T00:00:00");
        endD.setDate(endD.getDate() + 60);
        const end = endD.toISOString().slice(0, 10);
        const res = await fetch(
          `/api/schedule/availability?start=${start}&end=${end}&productId=${encodeURIComponent(product.id)}`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const map: Record<string, any> = {};
          json.data.forEach((item: any) => {
            map[item.date] = item;
          });
          setScheduleMap(map);
        }
      } catch (err) {
        console.error("Gagal memuat jadwal ketersediaan produk:", err);
      } finally {
        setLoadingSchedule(false);
      }
    }
    loadSchedule();
  }, [product.id, today]);

  const currentSchedule = scheduleMap[date];
  const isDateClosed = currentSchedule ? !currentSchedule.isAvailable : false;
  const closedReason = currentSchedule?.reason || "Pemesanan ditutup pada tanggal ini.";
  const maxAvailableUnits = currentSchedule ? currentSchedule.maxUnits : 10;
  const bookedUnitsCount = currentSchedule ? currentSchedule.bookedUnits : 0;
  const remainingUnits = Math.max(0, maxAvailableUnits - bookedUnitsCount);
  const isUnitsExceeded = currentSchedule ? units > remainingUnits : false;

  const maxPassengers = units * product.passenger_capacity;

  const selectedZone = pickupZones.find((z) => z.id === zone);
  const selectedSurcharge =
    ((selectedZone?.surcharge ?? (selectedZone as any)?.additional_cost) || 0) * units;

  function formatZoneName(name: string): string {
    let clean = name
      .replace(/\s*\(\+?Rp[^\)]*\)/gi, "")
      .replace(/\s*\(termasuk[^\)]*\)/gi, "")
      .replace(/\s*\(gratis[^\)]*\)/gi, "")
      .trim();

    if (clean.toLowerCase().includes("banyuwangi baru")) {
      return "Stasiun Ketapang (Eks Banyuwangi Baru)";
    }
    if (clean.toLowerCase() === "kota banyuwangi") {
      return "Kota Banyuwangi (Hotel / Penginapan)";
    }
    return clean;
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
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
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : "Jaringan bermasalah.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

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
    if (!quote || pending || isDateClosed || isUnitsExceeded) return;
    try {
      const quoteWithMetadata = {
        ...quote,
        product_slug: product.slug,
        product_name: product.name,
      };
      sessionStorage.setItem("pending_booking_quote", JSON.stringify(quoteWithMetadata));
      localStorage.setItem("pending_booking_quote", JSON.stringify(quoteWithMetadata));

      if (address) {
        const existingDraft = JSON.parse(
          sessionStorage.getItem("checkout_draft_fields") ||
          localStorage.getItem("checkout_draft_fields") ||
          "{}"
        );
        const updated = { ...existingDraft, pickupAddress: address };
        sessionStorage.setItem("checkout_draft_fields", JSON.stringify(updated));
        localStorage.setItem("checkout_draft_fields", JSON.stringify(updated));
      }
    } catch { }
    router.push("/checkout?quote_id=" + encodeURIComponent(quote.quote_id));
  }

  function scrollToWidget() {
    const el = document.getElementById("booking-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const baseDisplayPrice =
    quote?.total_amount || product.base_price || 1350000;

  return (
    <>
      <aside
        id="booking-card"
        className="w-full lg:sticky lg:top-24 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Card Header: Harga & Garansi */}
        <div className="bg-[#263b46] text-white p-5 sm:p-6 border-b border-slate-700/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
              Biaya Sewa Resmi
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Armada Ready</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatIDR(baseDisplayPrice)}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              / {units} Unit Jeep
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-snug">
            Maks. {product.passenger_capacity} orang per mobil • Termasuk Driver & BBM
          </p>
        </div>

        {/* Card Body: Form Pemesanan Rapi */}
        <div className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Rencanakan Jadwal Trip</span>
          </h3>

          {/* Grid Tanggal & Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-[#327691]" />
                Tanggal Trip
              </label>
              <BuyerCalendarPicker
                value={date}
                onChange={(newD) => setDate(newD)}
                scheduleMap={scheduleMap}
                minDate={today}
                loading={loadingSchedule}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={13} className="text-[#327691]" />
                Jam Keberangkatan
              </label>
              <div className="relative">
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full appearance-none text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3 py-2.5 pr-8 outline-hidden transition shadow-2xs cursor-pointer"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Notifikasi Khusus Jika Tanggal Terpilih Ternyata Ditutup / Penuh */}
          {isDateClosed ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>Jadwal Ditutup Pada Tanggal Ini</span>
              </div>
              <p className="text-[11.5px] text-rose-700 leading-snug">
                {closedReason ? (
                  <>Alasan pengelola: <strong>{closedReason}</strong></>
                ) : (
                  "Armada untuk paket ini sedang tidak beroperasi pada tanggal terpilih."
                )}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold pt-0.5">
                👉 Silakan klik kalender di atas untuk memilih tanggal lain yang bertitik hijau (tersedia).
              </p>
            </div>
          ) : isUnitsExceeded ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Kuota Armada Tidak Cukup</span>
              </div>
              <p className="text-[11.5px] text-amber-800 leading-snug">
                Sisa armada siap jalan: <strong>{remainingUnits} Jeep</strong> (Anda memilih {units} Jeep).
              </p>
            </div>
          ) : null}

          {/* Stepper: Jumlah Unit & Peserta */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Unit Jeep Stepper */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90">
              <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Car size={13} className="text-[#327691]" />
                Jumlah Unit
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const nextU = Math.max(1, units - 1);
                    setUnits(nextU);
                    setPassengers((p) =>
                      Math.min(p, nextU * product.passenger_capacity)
                    );
                  }}
                  disabled={units <= 1}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm font-black text-slate-900">
                  {units} <span className="text-xs font-normal text-slate-500">Jeep</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextU = Math.min(10, units + 1);
                    setUnits(nextU);
                  }}
                  disabled={units >= 10}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Peserta Stepper */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90">
              <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users size={13} className="text-[#327691]" />
                Jumlah Tamu
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  disabled={passengers <= 1}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm font-black text-slate-900">
                  {passengers} <span className="text-xs font-normal text-slate-500">Orang</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPassengers((p) => Math.min(maxPassengers, p + 1))
                  }
                  disabled={passengers >= maxPassengers}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            *Kapasitas maksimal armada adalah {product.passenger_capacity} peserta per unit Jeep.
          </p>

          {/* Area Penjemputan Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin size={13} className="text-[#327691]" />
              Area Penjemputan
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3 py-2.5 outline-hidden transition shadow-2xs cursor-pointer"
            >
              <option value="">Pilih Lokasi Titik Jemput</option>
              {pickupZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {formatZoneName(z.name)}
                </option>
              ))}
            </select>

            {/* Keterangan Otomatis Biaya Jemput (Bersih & Elegan) */}
            {zone && selectedZone && (
              <div className="mt-2">
                {selectedSurcharge > 0 ? (
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-sky-50 border border-sky-200/90 text-sky-900">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin size={12} className="text-[#327691] shrink-0" />
                      <span>Biaya jemput luar area ({formatIDR(selectedSurcharge)})</span>
                    </span>
                    <span className="font-extrabold text-[#2c6881] text-[11px] uppercase tracking-wide bg-white/80 px-2 py-0.5 rounded-md border border-sky-300/60 shadow-2xs">
                      Otomatis Masuk Total
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span>Area ini bebas biaya jemput (termasuk gratis dalam paket).</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail Alamat Jemput */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Lokasi / Titik Temu Jemput
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={500}
              placeholder="Contoh: Hotel Dialoog / Stasiun Banyuwangi Kota"
              className="w-full text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3 py-2.5 outline-hidden transition shadow-2xs placeholder:text-slate-400"
            />
          </div>

          {/* Toggle Kode Promo */}
          <div>
            {!showPromo && !promo ? (
              <button
                type="button"
                onClick={() => setShowPromo(true)}
                className="text-xs font-bold text-[#327691] hover:text-[#263b46] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Tag size={12} />
                Punya Kode Promo / Voucher?
              </button>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag size={13} className="text-[#327691]" />
                  Kode Promo
                </label>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value.toUpperCase())}
                    maxLength={50}
                    placeholder="Masukkan kode promo"
                    className="flex-1 uppercase font-bold text-xs sm:text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#327691] rounded-xl px-3 py-2 outline-hidden shadow-2xs tracking-wider"
                  />
                  {promo && (
                    <button
                      type="button"
                      onClick={() => {
                        setPromo("");
                        setShowPromo(false);
                      }}
                      className="text-xs text-rose-600 font-bold px-2 py-1 hover:underline"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rincian Harga & Total */}
          <div className="mt-4 pt-4 border-t border-slate-200" aria-live="polite">
            {loading ? (
              <div className="py-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="w-3.5 h-3.5 border-2 border-[#327691] border-t-transparent rounded-full animate-spin" />
                  <span>Menghitung rincian harga terbaik…</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            ) : (
              quote && (
                <div className="space-y-3">
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {quote.breakdown.map((b, i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <span>{b.label}</span>
                        <span className="font-semibold text-slate-800 shrink-0">
                          {formatIDR(b.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-700">Total Biaya:</span>
                    <span className="text-xl sm:text-2xl font-black text-[#263b46]">
                      {formatIDR(quote.total_amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-semibold">Minimal DP (30%):</span>
                    <span className="font-black text-emerald-700">
                      {formatIDR(quote.dp_amount)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    *Pilihan pembayaran DP atau Lunas dapat Anda tentukan saat checkout.
                  </p>
                </div>
              )
            )}
          </div>

          {/* Tombol Utama: Lanjutkan Booking */}
          <button
            type="button"
            className={`w-full mt-4 py-3.5 px-6 rounded-xl font-extrabold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${isDateClosed || isUnitsExceeded
                ? "bg-slate-400 text-white shadow-none"
                : "bg-[#327691] hover:bg-[#263b46] active:bg-[#1b2a32] text-white shadow-[#327691]/25 hover:shadow-xl"
              }`}
            onClick={next}
            disabled={pending || !quote || quote.is_sample_pricing || isDateClosed || isUnitsExceeded}
          >
            <span>
              {isDateClosed
                ? "Jadwal Ditutup Pada Tanggal Ini"
                : isUnitsExceeded
                  ? `Kuota Kurang (Sisa ${remainingUnits} Unit)`
                  : "Lanjutkan Booking"}
            </span>
            {!isDateClosed && !isUnitsExceeded && (
              <ArrowRight size={16} strokeWidth={2.5} />
            )}
          </button>

          {/* Catatan Garansi Bebas Biaya di Awal */}
          <div className="p-3.5 rounded-xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#254958] space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-[#2c6881]">
              <ShieldCheck size={15} className="text-[#327691] shrink-0" />
              <span>Pengajuan Bebas Biaya di Awal</span>
            </p>
            <p className="text-[11.5px] leading-relaxed text-slate-600">
              Admin akan memeriksa kesiapan armada & driver kami terlebih dahulu. Setelah terkonfirmasi siap, Anda baru dapat melakukan pembayaran.
            </p>
          </div>

          {/* Quick CS WhatsApp */}
          <div className="pt-2 text-center">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20tanya%20paket%20Sewa%20Jeep"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
            >
              <MessageCircle size={14} className="text-emerald-600" />
              <span>Butuh bantuan / kustom rute? Chat via WhatsApp</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Floating Bottom Bar Khusus Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Sewa ({units} Jeep)
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900">
            {formatIDR(baseDisplayPrice)}
          </span>
          {isDateClosed && (
            <span className="block text-[10px] font-bold text-rose-600">
              ● Jadwal Ditutup
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={scrollToWidget}
          disabled={isDateClosed || isUnitsExceeded}
          className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition ${isDateClosed || isUnitsExceeded
              ? "bg-slate-400 opacity-60 cursor-not-allowed"
              : "bg-[#327691] hover:bg-[#263b46] active:bg-[#1b2a32] shadow-md shadow-[#327691]/25"
            }`}
        >
          <span>{isDateClosed ? "Jadwal Tutup" : isUnitsExceeded ? "Kuota Penuh" : "Pesan Sekarang"}</span>
          {!isDateClosed && !isUnitsExceeded && (
            <ArrowRight size={14} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </>
  );
}
