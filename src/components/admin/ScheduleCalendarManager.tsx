"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  Car,
  Save,
  MapPin,
  Check,
  Zap,
  CheckSquare,
  Square,
  X,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import type { DateScheduleItem } from "@/lib/services/schedule";

interface ScheduleCalendarManagerProps {
  portalType: "admin" | "owner";
}

interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  defaultStartTime: string;
  passengerCapacity: number;
  routeName: string;
  basePrice: number;
  status: string;
}

interface PickupZoneItem {
  id: string;
  name: string;
  surcharge: number;
}

export function ScheduleCalendarManager({ portalType }: ScheduleCalendarManagerProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [scheduleData, setScheduleData] = useState<Record<string, DateScheduleItem>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedStatus, setSelectedStatus] = useState<boolean>(true);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [selectedMaxUnits, setSelectedMaxUnits] = useState<number>(10);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Per-Catalog state
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [pickupZones, setPickupZones] = useState<PickupZoneItem[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");
  const [departureTime, setDepartureTime] = useState<string>("");
  const [savingDepartureTime, setSavingDepartureTime] = useState(false);

  // Batch & Multi-Select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showBatchTools, setShowBatchTools] = useState<boolean>(false);
  const [showRangeBar, setShowRangeBar] = useState<boolean>(false);
  const [rangeStart, setRangeStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [rangeEnd, setRangeEnd] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [batchReason, setBatchReason] = useState<string>("Penyesuaian operasional armada");
  const [batchMaxUnits, setBatchMaxUnits] = useState<number>(10);
  const [batchSubmitting, setBatchSubmitting] = useState<boolean>(false);

  // Tahun & bulan saat ini
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startRange = new Date(year, month, -6).toISOString().slice(0, 10);
  const endRange = new Date(year, month + 1, 7).toISOString().slice(0, 10);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const yearsList = [2025, 2026, 2027, 2028];
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Fetch daftar katalog & titik jemput
  useEffect(() => {
    async function loadCatalogs() {
      try {
        const res = await fetch("/api/schedule/catalogs");
        const json = await res.json();
        if (json.success && json.data) {
          setCatalogs(json.data.catalogs || []);
          setPickupZones(json.data.pickupZones || []);
        }
      } catch (err) {
        console.error("Gagal memuat katalog:", err);
      }
    }
    loadCatalogs();
  }, []);

  // Update jam keberangkatan saat katalog berubah
  useEffect(() => {
    if (selectedCatalogId) {
      const found = catalogs.find((c) => c.id === selectedCatalogId);
      if (found) {
        setDepartureTime(found.defaultStartTime || "08:00");
      }
    } else {
      setDepartureTime("");
    }
  }, [selectedCatalogId, catalogs]);

  // Fetch ketersediaan jadwal
  async function fetchSchedule() {
    setLoading(true);
    try {
      const url = `/api/schedule/availability?start=${startRange}&end=${endRange}${
        selectedCatalogId ? `&productId=${encodeURIComponent(selectedCatalogId)}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const map: Record<string, DateScheduleItem> = {};
        json.data.forEach((item: DateScheduleItem) => {
          map[item.date] = item;
        });
        setScheduleData(map);
      }
    } catch (e) {
      console.error("Gagal mengambil data jadwal:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchedule();
  }, [year, month, selectedCatalogId]);

  // Sync saat tanggal dipilih di mode normal
  useEffect(() => {
    const item = scheduleData[selectedDate];
    if (item) {
      setSelectedStatus(item.isAvailable);
      setSelectedReason(item.reason || "");
      setSelectedMaxUnits(item.maxUnits || 10);
    } else {
      setSelectedStatus(true);
      setSelectedReason("");
      setSelectedMaxUnits(10);
    }
  }, [selectedDate, scheduleData]);

  // Simpan 1 Tanggal
  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/schedule/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          isAvailable: selectedStatus,
          reason: !selectedStatus ? (selectedReason.trim() || "Jadwal ditutup oleh pengelola") : "",
          maxUnits: selectedMaxUnits,
          productId: selectedCatalogId || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          message: json.message || "Status tanggal berhasil disimpan!",
        });
        setScheduleData((prev) => ({
          ...prev,
          [selectedDate]: {
            date: selectedDate,
            isAvailable: selectedStatus,
            reason: !selectedStatus ? (selectedReason.trim() || "Jadwal ditutup oleh pengelola") : undefined,
            bookedUnits: prev[selectedDate]?.bookedUnits || 0,
            maxUnits: selectedMaxUnits,
          },
        }));
      } else {
        setFeedback({ type: "error", message: json.error || "Gagal menyimpan perubahan." });
      }
    } catch {
      setFeedback({ type: "error", message: "Kesalahan jaringan saat menyimpan." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  // Eksekusi Massal
  async function executeBatchAction(datesToUpdate: string[], isAvailable: boolean, reasonText?: string, maxUnits?: number) {
    if (!datesToUpdate || datesToUpdate.length === 0) return;
    setBatchSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/schedule/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: datesToUpdate,
          isAvailable,
          reason: !isAvailable ? (reasonText?.trim() || "Jadwal ditutup oleh pengelola") : "",
          maxUnits,
          productId: selectedCatalogId || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          message: `Berhasil! ${datesToUpdate.length} tanggal langsung ${isAvailable ? "DIBUKA (Ready)" : "DITUTUP (Off)"} secara real-time!`,
        });

        setScheduleData((prev) => {
          const next = { ...prev };
          datesToUpdate.forEach((d) => {
            next[d] = {
              date: d,
              isAvailable,
              reason: !isAvailable ? (reasonText?.trim() || "Jadwal ditutup oleh pengelola") : undefined,
              bookedUnits: prev[d]?.bookedUnits || 0,
              maxUnits: maxUnits || prev[d]?.maxUnits || 10,
            };
          });
          return next;
        });

        setSelectedDates([]);
      } else {
        setFeedback({ type: "error", message: json.error || "Gagal memproses perubahan massal." });
      }
    } catch {
      setFeedback({ type: "error", message: "Terjadi gangguan koneksi saat pembaruan massal." });
    } finally {
      setBatchSubmitting(false);
      setTimeout(() => setFeedback(null), 4500);
    }
  }

  function handleApplyRange(isAvailable: boolean) {
    if (!rangeStart || !rangeEnd) return;
    if (rangeStart > rangeEnd) {
      setFeedback({ type: "error", message: "Tanggal awal tidak boleh melebihi tanggal akhir!" });
      return;
    }
    const dates: string[] = [];
    const cur = new Date(rangeStart + "T00:00:00");
    const end = new Date(rangeEnd + "T00:00:00");
    while (cur <= end) {
      dates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    executeBatchAction(dates, isAvailable, batchReason, batchMaxUnits);
  }

  function handleBatchWeekend(isAvailable: boolean) {
    const weekendDates: string[] = [];
    const cur = new Date(firstDayOfMonth);
    while (cur <= lastDayOfMonth) {
      const day = cur.getDay();
      if (day === 0 || day === 6) {
        weekendDates.push(cur.toISOString().slice(0, 10));
      }
      cur.setDate(cur.getDate() + 1);
    }
    executeBatchAction(weekendDates, isAvailable, isAvailable ? "" : "Libur Operasional Weekend", batchMaxUnits);
  }

  function handleOpenEntireMonth() {
    const allDates: string[] = [];
    const cur = new Date(firstDayOfMonth);
    while (cur <= lastDayOfMonth) {
      allDates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    executeBatchAction(allDates, true, "", 10);
  }

  function toggleDateSelect(dateStr: string) {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  }

  // Navigasi Bulan / Tahun
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function setMonthDirect(mIdx: number) {
    setCurrentDate(new Date(year, mIdx, 1));
  }

  function setYearDirect(yVal: number) {
    setCurrentDate(new Date(yVal, month, 1));
  }

  function goToday() {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.toISOString().slice(0, 10));
  }

  // Simpan jam keberangkatan
  async function handleSaveDepartureTime() {
    if (!selectedCatalogId || !departureTime.trim()) return;
    setSavingDepartureTime(true);
    try {
      const res = await fetch("/api/admin/schedule/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_departure_time",
          productId: selectedCatalogId,
          defaultStartTime: departureTime.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: json.message || "Jam keberangkatan katalog berhasil disimpan!" });
        setCatalogs((prev) =>
          prev.map((c) =>
            c.id === selectedCatalogId ? { ...c, defaultStartTime: departureTime.trim() } : c
          )
        );
      } else {
        setFeedback({ type: "error", message: json.error || "Gagal memperbarui jam keberangkatan." });
      }
    } catch {
      setFeedback({ type: "error", message: "Kesalahan jaringan saat menyimpan jam." });
    } finally {
      setSavingDepartureTime(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  // Kalender Grid Hari
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarCells = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const dateStr = new Date(year, month - 1, d + 1).toISOString().slice(0, 10);
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(year, month, d + 1).toISOString().slice(0, 10);
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateStr = new Date(year, month + 1, d + 1).toISOString().slice(0, 10);
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedItem = scheduleData[selectedDate];
  const activeCatalog = catalogs.find((c) => c.id === selectedCatalogId);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Header Compact & Terpadu: Judul + Pemilih Katalog Langsung Satu Baris */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] flex items-center justify-center shrink-0">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#1e293b] dark:text-neutral-100 leading-tight">
              Jadwal & Kuota Armada
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400">
              Kelola buka/tutup ketersediaan tanggal dan kuota per-paket wisata.
            </p>
          </div>
        </div>

        {/* Pemilih Katalog Dropdown Modern */}
        <div className="w-full md:w-80">
          <div className="relative">
            <select
              value={selectedCatalogId}
              onChange={(e) => setSelectedCatalogId(e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 border-2 border-[#327691] rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm font-black text-slate-900 dark:text-neutral-100 outline-none transition cursor-pointer shadow-2xs"
            >
              <option value="">🌐 Semua Paket (Pengaturan Global)</option>
              {catalogs.map((c) => (
                <option key={c.id} value={c.id}>
                  🚙 {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#327691]">
              <ChevronDown size={15} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bilah Aksi Cepat Massal (Ringkas & Bisa Dibuka/Tutup) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Zap size={14} className="text-[#327691]" />
              Aksi Cepat Penjadwalan:
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Mode Pilih Banyak */}
            <button
              type="button"
              onClick={() => {
                setIsMultiSelectMode((v) => !v);
                if (isMultiSelectMode) setSelectedDates([]);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
                isMultiSelectMode
                  ? "bg-[#327691] text-white border-[#327691] shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 border-slate-200 text-slate-700 dark:text-neutral-200"
              }`}
            >
              {isMultiSelectMode ? <CheckSquare size={13} /> : <Square size={13} />}
              <span>{isMultiSelectMode ? "Pilih Banyak: ON" : "Pilih Banyak"}</span>
            </button>

            {/* Toggle Rentang Tanggal */}
            <button
              type="button"
              onClick={() => setShowRangeBar((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 border border-slate-200 text-slate-700 dark:text-neutral-200 text-xs font-bold transition cursor-pointer"
            >
              <SlidersHorizontal size={13} className="text-[#327691]" />
              <span>Rentang Tanggal</span>
            </button>
          </div>
        </div>

        {/* Tombol Preset 1-Klik Instan */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-neutral-800">
          <button
            type="button"
            disabled={batchSubmitting}
            onClick={() => handleBatchWeekend(false)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Lock size={11} />
            <span>Tutup Semua Weekend</span>
          </button>

          <button
            type="button"
            disabled={batchSubmitting}
            onClick={() => handleBatchWeekend(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Unlock size={11} />
            <span>Buka Semua Weekend</span>
          </button>

          <button
            type="button"
            disabled={batchSubmitting}
            onClick={handleOpenEntireMonth}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#245265] text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={11} />
            <span>Buka 1 Bulan Penuh Ready</span>
          </button>
        </div>

        {/* Panel Form Rentang Tanggal Cepat (Dari - Sampai) */}
        {showRangeBar && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 items-end">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full text-xs font-bold px-2.5 py-2 bg-white dark:bg-neutral-700 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full text-xs font-bold px-2.5 py-2 bg-white dark:bg-neutral-700 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-500 mb-1">
                  Alasan Penutupan (Jika Ditutup):
                </label>
                <input
                  type="text"
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  placeholder="Contoh: Perbaikan armada, Cuaca ekstrem"
                  className="w-full text-xs font-semibold px-2.5 py-2 bg-white dark:bg-neutral-700 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
              <button
                type="button"
                disabled={batchSubmitting}
                onClick={() => handleApplyRange(false)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Lock size={12} />
                <span>Tutup Rentang Ini</span>
              </button>
              <button
                type="button"
                disabled={batchSubmitting}
                onClick={() => handleApplyRange(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Unlock size={12} />
                <span>Buka Rentang Ini</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bar Ketika Ada Tanggal Dipilih di Multi-Select Mode */}
      {isMultiSelectMode && selectedDates.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#1e293b] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#327691] text-white flex items-center justify-center text-xs font-black">
              {selectedDates.length}
            </span>
            <span className="text-xs font-bold">
              {selectedDates.length} Tanggal Dipilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={batchSubmitting}
              onClick={() => executeBatchAction(selectedDates, false, batchReason, batchMaxUnits)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Lock size={12} />
              <span>Tutup Semua Terpilih</span>
            </button>

            <button
              type="button"
              disabled={batchSubmitting}
              onClick={() => executeBatchAction(selectedDates, true, "", batchMaxUnits)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Unlock size={12} />
              <span>Buka Semua Terpilih</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDates([])}
              className="px-2.5 py-1.5 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 3. Grid Kalender & Panel Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom Kiri: Kalender dengan Navigasi Terpadu (Menjawab Masalah User: Bulan, Hari & Tahun Jelas) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* NAVIGASI BULAN & TAHUN LANGSUNG DI ATAS KALENDER (MOBILE-FRIENDLY & BESAR) */}
          <div className="bg-[#f8fafc] dark:bg-neutral-800 p-3 rounded-2xl border border-slate-200/80 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2.5">
            {/* Panah Kiri, Dropdown Bulan, Dropdown Tahun, Panah Kanan */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-700 hover:bg-slate-100 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Dropdown Pemilih Bulan Cepat */}
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonthDirect(Number(e.target.value))}
                  className="appearance-none bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-3 py-1.5 pr-7 text-xs sm:text-sm font-black text-slate-900 dark:text-neutral-100 outline-none cursor-pointer shadow-2xs"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                  <ChevronDown size={13} />
                </div>
              </div>

              {/* Dropdown Pemilih Tahun Cepat */}
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYearDirect(Number(e.target.value))}
                  className="appearance-none bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl px-2.5 py-1.5 pr-6 text-xs sm:text-sm font-black text-slate-900 dark:text-neutral-100 outline-none cursor-pointer shadow-2xs"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-slate-400">
                  <ChevronDown size={13} />
                </div>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-700 hover:bg-slate-100 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-600 flex items-center justify-center transition cursor-pointer shadow-2xs"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Tombol Hari Ini & Legenda Warna */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#e9f3f7] hover:bg-[#d5e9f1] text-[#327691] border border-[#cbe1ec] transition cursor-pointer"
              >
                Hari Ini
              </button>

              <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ready
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Tutup
                </span>
              </div>
            </div>
          </div>

          {/* Header Nama Hari */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-neutral-400 pb-0.5">
            {dayNames.map((d, idx) => (
              <div key={d} className={`py-1 ${idx >= 5 ? "text-amber-600 font-extrabold" : ""}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid Tanggal Kalender (Responsif & Jelas di Mobile) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarCells.map((cell) => {
              const item = scheduleData[cell.dateStr];
              const isChecked = selectedDates.includes(cell.dateStr);
              const isSingleSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              const isAvailable = item ? item.isAvailable : true;
              const booked = item?.bookedUnits || 0;
              const max = item?.maxUnits || 10;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    if (isMultiSelectMode) {
                      toggleDateSelect(cell.dateStr);
                    } else {
                      setSelectedDate(cell.dateStr);
                    }
                  }}
                  className={`min-h-[64px] sm:min-h-[78px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                    !cell.isCurrentMonth
                      ? "opacity-30 bg-neutral-50 dark:bg-neutral-800/40 border-dashed border-neutral-200"
                      : isMultiSelectMode && isChecked
                      ? "ring-2 ring-[#327691] border-[#327691] bg-[#e1f0f5] shadow-xs"
                      : !isMultiSelectMode && isSingleSelected
                      ? "ring-2 ring-[#327691] border-[#327691] bg-[#eef7fa] shadow-xs"
                      : isAvailable
                      ? "bg-[#fafcfd] dark:bg-neutral-800/60 border-emerald-200/70 hover:border-emerald-400"
                      : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 hover:border-rose-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        isToday
                          ? "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#327691] text-white flex items-center justify-center text-[10.5px] sm:text-xs"
                          : isChecked || (!isMultiSelectMode && isSingleSelected)
                          ? "text-[#327691]"
                          : "text-slate-800 dark:text-neutral-200"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Status Dot / Checkbox Icon */}
                    {isMultiSelectMode ? (
                      <span
                        className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] font-bold ${
                          isChecked ? "bg-[#327691] text-white" : "border border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                    ) : isAvailable ? (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shadow-2xs" />
                    ) : (
                      <span title="Ditutup">
                        <Lock size={11} className="text-rose-600 shrink-0" />
                      </span>
                    )}
                  </div>

                  {/* Keterangan Status Tanggal (Lebih Ringkas & Tidak Sesak) */}
                  <div className="mt-0.5 w-full">
                    {isAvailable ? (
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 block leading-tight">
                          Ready
                        </span>
                        <span className="text-[8.5px] sm:text-[9px] font-semibold text-slate-400 hidden sm:block">
                          {booked}/{max}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-black text-rose-700 block leading-tight truncate">
                          Tutup
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Detail & Form Edit Tanggal Terpilih */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-neutral-800">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#327691] block">
              {selectedCatalogId ? `Paket: ${activeCatalog?.name?.slice(0, 24)}…` : "Pengaturan Semua Paket"}
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#1e293b] dark:text-neutral-100 mt-0.5">
              {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <span className="font-mono text-[11px] text-slate-400 block">
              Tanggal: {selectedDate}
            </span>
          </div>

          {/* Toggle Buka / Tutup */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 block">
              Status Ketersediaan Tanggal Ini
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus(true)}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedStatus
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Unlock size={13} />
                <span>Buka (Ready)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus(false)}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  !selectedStatus
                    ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Lock size={13} />
                <span>Tutup (Off)</span>
              </button>
            </div>
          </div>

          {/* Alasan jika ditutup */}
          {!selectedStatus && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-[11px] font-bold text-slate-700 block">
                Alasan Penutupan:
              </label>
              <input
                type="text"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                placeholder="Contoh: Perbaikan armada, Cuaca ekstrem"
                className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#327691]"
              />
            </div>
          )}

          {/* Kapasitas Armada */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700">
                Kapasitas Armada (Unit):
              </label>
              <span className="text-[10px] font-mono text-slate-400">Default 10 Unit</span>
            </div>
            <div className="flex items-center gap-2">
              <Car size={15} className="text-[#327691]" />
              <input
                type="number"
                min={1}
                max={50}
                value={selectedMaxUnits}
                onChange={(e) => setSelectedMaxUnits(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          {/* Tombol Simpan Tanggal Ini */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#327691] hover:bg-[#263b46] text-white text-xs sm:text-sm font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <Save size={14} />
                <span>Simpan Status Tanggal Ini</span>
              </>
            )}
          </button>

          {/* Bagian Pengaturan Jam Katalog (Jika Katalog Dipilih) */}
          {selectedCatalogId && activeCatalog && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
                <Clock size={13} className="text-[#327691]" />
                Jam Keberangkatan Katalog:
              </span>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="00:00, 08:00, 13:00"
                className="w-full text-xs font-mono font-bold p-2 rounded-xl border border-slate-200 bg-slate-50"
              />
              <button
                type="button"
                onClick={handleSaveDepartureTime}
                disabled={savingDepartureTime}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Check size={13} />
                <span>Simpan Jam Katalog</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
