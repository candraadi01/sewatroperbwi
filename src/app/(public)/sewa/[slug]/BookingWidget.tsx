"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/lib/utils/currency";
import type { Product, PickupZone, PricingQuote } from "@/types/database";
import { BuyerCalendarPicker } from "@/components/booking/BuyerCalendarPicker";
import styles from "@/components/landing/cinematic.module.css";
import {
  Calendar,
  Clock,
  Car,
  Users,
  MapPin,
  Tag,
  ArrowRight,
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

export function BookingWidget(props: {
  product: Product;
  pickupZones: PickupZone[];
  initialDate: string;
  today: string;
  contact?: string | null;
}) {
  const { product, pickupZones, initialDate, today } = props;
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
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const draft = JSON.parse(
          sessionStorage.getItem("checkout_draft_fields") ||
          localStorage.getItem("checkout_draft_fields") ||
          "{}"
        );
        if (draft.pickupAddress && typeof draft.pickupAddress === "string") {
          setAddress(draft.pickupAddress);
        }
      } catch {}
    });
    return () => {
      active = false;
    };
  }, []);

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
          const map: typeof scheduleMap = {};
          json.data.forEach((item: (typeof scheduleMap)[string] & { date: string }) => {
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
    ((selectedZone?.surcharge ?? (selectedZone as (PickupZone & { additional_cost?: number }) | undefined)?.additional_cost) || 0) * units;

  function formatZoneName(name: string): string {
    const clean = name
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
      const selectedZone = pickupZones.find((z) => z.id === zone);
      const zoneCleanName = selectedZone ? formatZoneName(selectedZone.name) : "";
      const trimmedAddress = address.trim();
      const resolvedPickup = trimmedAddress || zoneCleanName || quote.pickup_address || quote.pickup_zone?.name || "";

      const quoteWithMetadata = {
        ...quote,
        pickup_address: resolvedPickup,
        product_slug: product.slug,
        product_name: product.name,
      };
      sessionStorage.setItem("pending_booking_quote", JSON.stringify(quoteWithMetadata));
      localStorage.setItem("pending_booking_quote", JSON.stringify(quoteWithMetadata));

      const existingDraft = JSON.parse(
        sessionStorage.getItem("checkout_draft_fields") ||
        localStorage.getItem("checkout_draft_fields") ||
        "{}"
      );
      const updated = {
        ...existingDraft,
        pickupAddress: resolvedPickup,
      };
      sessionStorage.setItem("checkout_draft_fields", JSON.stringify(updated));
      localStorage.setItem("checkout_draft_fields", JSON.stringify(updated));
    } catch { }
    router.push("/checkout?quote_id=" + encodeURIComponent(quote.quote_id));
  }

  const baseDisplayPrice =
    quote?.total_amount || product.base_price || 1350000;

  return (
    <aside
      id="booking-card"
      tabIndex={-1}
      className={`${styles.bookingMotion} w-full min-w-0 scroll-mt-34 lg:sticky lg:top-34 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xl`}
    >
        <div className="rounded-t-2xl bg-[#182229] text-white p-4 sm:p-6">
          <p className="text-xs font-semibold text-slate-300">Estimasi sewa</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatIDR(baseDisplayPrice)}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              / {units} Jeep
            </span>
          </div>
        </div>

        {/* Card Body: Form Pemesanan Rapi */}
        <div className="p-4 sm:p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-[color:var(--ink)] uppercase tracking-wider flex items-center gap-1.5">
            <span>Rencanakan Jadwal Trip</span>
          </h3>

          {/* Grid Tanggal & Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-[color:var(--gold)]" />
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
              <label className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={13} className="text-[color:var(--gold)]" />
                Jam Keberangkatan
              </label>
              <div className="relative">
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full min-w-0 min-h-11 appearance-none text-base sm:text-sm font-semibold text-[color:var(--ink)] bg-[var(--raised)] hover:bg-[var(--raised)] focus:bg-[var(--raised)] border border-[var(--line)] focus:border-[var(--gold)] rounded-xl px-3 py-2.5 pr-8 outline-hidden transition shadow-2xs cursor-pointer"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[color:var(--mist)]">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Notifikasi Khusus Jika Tanggal Terpilih Ternyata Ditutup / Penuh */}
          {isDateClosed ? (
            <div className="p-3 rounded-xl bg-[#3b2227] border border-rose-700/80 text-rose-300 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span>Jadwal Ditutup Pada Tanggal Ini</span>
              </div>
              <p className="text-[11.5px] text-rose-300 leading-snug">
                {closedReason ? (
                  <>Alasan pengelola: <strong>{closedReason}</strong></>
                ) : (
                  "Armada untuk paket ini sedang tidak beroperasi pada tanggal terpilih."
                )}
              </p>
              <p className="text-[11px] text-rose-300 font-semibold pt-0.5">
                👉 Silakan klik kalender di atas untuk memilih tanggal lain yang bertitik hijau (tersedia).
              </p>
            </div>
          ) : isUnitsExceeded ? (
            <div className="p-3 rounded-xl bg-[#3a2e19] border border-amber-700/80 text-amber-200 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Kuota Armada Tidak Cukup</span>
              </div>
              <p className="text-[11.5px] text-amber-200 leading-snug">
                Sisa armada siap jalan: <strong>{remainingUnits} Jeep</strong> (Anda memilih {units} Jeep).
              </p>
            </div>
          ) : null}

          {/* Stepper: Jumlah Unit & Peserta */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3 pt-1">
            {/* Unit Jeep Stepper */}
            <div className="bg-[var(--raised)] p-3 rounded-xl border border-[var(--line)]">
              <span className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Car size={13} className="text-[color:var(--gold)]" />
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
                  aria-label="Kurangi jumlah Jeep"
                  disabled={units <= 1}
                  className="size-11 shrink-0 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[color:var(--mist)] hover:bg-[var(--raised)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm font-black text-[color:var(--ink)]">
                  {units} <span className="text-xs font-normal text-[color:var(--mist)]">Jeep</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextU = Math.min(10, units + 1);
                    setUnits(nextU);
                  }}
                  aria-label="Tambah jumlah Jeep"
                  disabled={units >= 10}
                  className="size-11 shrink-0 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[color:var(--mist)] hover:bg-[var(--raised)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Peserta Stepper */}
            <div className="bg-[var(--raised)] p-3 rounded-xl border border-[var(--line)]">
              <span className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users size={13} className="text-[color:var(--gold)]" />
                Jumlah Tamu
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                  aria-label="Kurangi jumlah peserta"
                  disabled={passengers <= 1}
                  className="size-11 shrink-0 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[color:var(--mist)] hover:bg-[var(--raised)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm font-black text-[color:var(--ink)]">
                  {passengers} <span className="text-xs font-normal text-[color:var(--mist)]">Orang</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPassengers((p) => Math.min(maxPassengers, p + 1))
                  }
                  aria-label="Tambah jumlah peserta"
                  disabled={passengers >= maxPassengers}
                  className="size-11 shrink-0 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[color:var(--mist)] hover:bg-[var(--raised)] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[color:var(--mist)] italic">
            *Kapasitas maksimal armada adalah {product.passenger_capacity} peserta per unit Jeep.
          </p>

          {/* Area Penjemputan Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin size={13} className="text-[color:var(--gold)]" />
              Area Penjemputan
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full min-w-0 min-h-11 text-base sm:text-sm font-semibold text-[color:var(--ink)] bg-[var(--raised)] hover:bg-[var(--raised)] focus:bg-[var(--raised)] border border-[var(--line)] focus:border-[var(--gold)] rounded-xl px-3 py-2.5 outline-hidden transition shadow-2xs cursor-pointer"
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
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-[#1b303c] border border-sky-700/60 text-sky-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin size={12} className="text-[color:var(--gold)] shrink-0" />
                      <span>Biaya jemput luar area ({formatIDR(selectedSurcharge)})</span>
                    </span>
                    <span className="font-extrabold text-[color:var(--gold)] text-[11px] uppercase tracking-wide bg-[var(--raised)] px-2 py-0.5 rounded-md border border-sky-700/70 shadow-2xs">
                      Otomatis Masuk Total
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg bg-[#15342b] border border-emerald-700 text-emerald-300 font-medium">
                    <Check size={13} className="text-emerald-300 shrink-0" />
                    <span>Area ini bebas biaya jemput (termasuk gratis dalam paket).</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail Alamat Jemput */}
          <div>
            <label className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1">
              Lokasi / Titik Temu Jemput
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={500}
              placeholder="Contoh: Hotel Dialoog / Stasiun Banyuwangi Kota"
              className="w-full min-w-0 min-h-11 text-base sm:text-sm text-[color:var(--ink)] bg-[var(--raised)] focus:bg-[var(--raised)] border border-[var(--line)] focus:border-[var(--gold)] rounded-xl px-3 py-2.5 outline-hidden transition shadow-2xs placeholder:text-[color:var(--mist)]"
            />
          </div>

          {/* Toggle Kode Promo */}
          <div>
            {!showPromo && !promo ? (
              <button
                type="button"
                onClick={() => setShowPromo(true)}
                className="text-xs font-bold text-[color:var(--gold)] hover:text-[color:var(--ink)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Tag size={12} />
                Punya Kode Promo / Voucher?
              </button>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-[color:var(--mist)] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag size={13} className="text-[color:var(--gold)]" />
                  Kode Promo
                </label>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value.toUpperCase())}
                    maxLength={50}
                    placeholder="Masukkan kode promo"
                    className="min-w-0 min-h-11 flex-1 uppercase font-bold text-base sm:text-sm text-[color:var(--ink)] bg-[var(--raised)] focus:bg-[var(--raised)] border border-[var(--line)] focus:border-[var(--gold)] rounded-xl px-3 py-2 outline-hidden shadow-2xs tracking-wider"
                  />
                  {promo && (
                    <button
                      type="button"
                      onClick={() => {
                        setPromo("");
                        setShowPromo(false);
                      }}
                      className="text-xs text-rose-300 font-bold px-2 py-1 hover:underline"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rincian Harga & Total */}
          <div className="mt-4 pt-4 border-t border-[var(--line)]" aria-live="polite">
            {loading ? (
              <div className="py-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--mist)]">
                  <span className="w-3.5 h-3.5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                    <span>Menghitung estimasi biaya…</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 rounded-xl bg-[#3b2227] border border-rose-700/80 text-xs font-medium text-rose-300 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-300" />
                <span>{error}</span>
              </div>
            ) : (
              quote && (
                <div className="space-y-3">
                  <div className="space-y-1.5 text-xs text-[color:var(--mist)]">
                    {quote.breakdown.map((b, i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <span>{b.label}</span>
                        <span className="font-semibold text-[color:var(--ink)] shrink-0">
                          {formatIDR(b.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[var(--line)] flex justify-between items-baseline gap-2">
                    <span className="text-sm font-bold text-[color:var(--mist)]">Total biaya</span>
                    <span className="text-xl sm:text-2xl font-black text-[color:var(--ink)]">
                      {formatIDR(quote.total_amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs text-[color:var(--gold)]">
                    <span className="font-semibold">Estimasi DP</span>
                    <span className="font-bold">
                      {formatIDR(quote.dp_amount)}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Tombol Utama: Lanjutkan Booking */}
          <button
            type="button"
            className={`w-full mt-4 min-h-11 py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isDateClosed || isUnitsExceeded
                ? "bg-slate-400 text-white shadow-none"
                : styles.primary
              }`}
            onClick={next}
            disabled={pending || !quote || quote.is_sample_pricing || isDateClosed || isUnitsExceeded}
          >
            <span>
              {isDateClosed
                ? "Jadwal Ditutup Pada Tanggal Ini"
                : isUnitsExceeded
                  ? `Kuota Kurang (Sisa ${remainingUnits} Unit)`
                  : "Ajukan Booking Sekarang"}
            </span>
            {!isDateClosed && !isUnitsExceeded && (
              <ArrowRight size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </aside>
  );
}
