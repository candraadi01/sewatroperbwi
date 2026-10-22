"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  Info,
  Clock,
  Car,
  Save,
  RotateCcw
} from "lucide-react";
import type { DateScheduleItem } from "@/lib/services/schedule";

interface ScheduleCalendarManagerProps {
  portalType: "admin" | "owner";
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

  // Ambil tahun & bulan saat ini
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Hitung tanggal awal dan akhir untuk bulan yang ditampilkan (termasuk buffer)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startRange = new Date(year, month, -6).toISOString().slice(0, 10);
  const endRange = new Date(year, month + 1, 7).toISOString().slice(0, 10);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Fetch data ketersediaan
  async function fetchSchedule() {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule/availability?start=${startRange}&end=${endRange}`);
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
  }, [year, month]);

  // Perbarui form panel saat tanggal dipilih
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

  // Handle Simpan Perubahan Jadwal
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
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          message: json.message || "Status jadwal tanggal berhasil diperbarui!",
        });
        // Optimistic update
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
        setFeedback({
          type: "error",
          message: json.error || "Gagal menyimpan perubahan.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "Terjadi kesalahan jaringan saat menyimpan.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  // Navigasi Bulan
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.toISOString().slice(0, 10));
  }

  // Generate Matrix Hari untuk Kalender
  // getDay: 0 = Sunday, 1 = Monday. We want 0 = Monday, 6 = Sunday.
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Padding hari bulan sebelumnya
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const dateObj = new Date(year, month - 1, d);
    calendarCells.push({
      dateStr: dateObj.toISOString().slice(0, 10),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Hari di bulan aktif
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      dateStr: dateObj.toISOString().slice(0, 10),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Padding hari bulan berikutnya (melengkapi kelipatan 7)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarCells.push({
      dateStr: dateObj.toISOString().slice(0, 10),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedItem = scheduleData[selectedDate];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] flex items-center justify-center">
              <CalendarIcon size={18} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0]">
              Kontrol Operasional Armada {portalType === "owner" ? "Pemilik" : "Admin"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e293b] dark:text-neutral-100 mt-1">
            Pengaturan Jadwal & Ketersediaan Booking
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 mt-1">
            Atur hari dan tanggal apa saja yang <strong className="text-emerald-700 dark:text-emerald-400">Tersedia (Ready)</strong> atau <strong className="text-rose-700 dark:text-rose-400">Ditutup (Tidak Tersedia)</strong> secara real-time untuk calon pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={goToday}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f4f9fb] dark:bg-neutral-800 hover:bg-[#e9f3f7] text-[#327691] dark:text-[#8abbd0] border border-[#d2e4ec] dark:border-neutral-700 transition cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-[#f8fafc] dark:bg-neutral-800 border border-[#e4ebef] dark:border-neutral-700 rounded-xl p-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-[#53636d] dark:text-neutral-300 transition cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-[#1e293b] dark:text-neutral-100 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-[#53636d] dark:text-neutral-300 transition cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid: Kalender Interaktif (Kiri) & Panel Edit Tanggal (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1 & 2: Kalender Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f6] dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-[#1e293b] dark:text-neutral-100">
                Kalender Jadwal {monthNames[month]} {year}
              </span>
              {loading && (
                <span className="text-[11px] font-semibold text-[#8e9da5] animate-pulse">
                  Memuat data...
                </span>
              )}
            </div>

            {/* Legenda Keterangan Warna */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Tersedia (Ready)
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Ditutup
              </span>
            </div>
          </div>

          {/* Header Nama Hari */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-[#8e9da5] dark:text-neutral-400 pb-1">
            {dayNames.map((d, idx) => (
              <div key={d} className={`py-1 ${idx >= 5 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map((cell) => {
              const item = scheduleData[cell.dateStr];
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              const isPast = cell.dateStr < todayStr;
              const isAvailable = item ? item.isAvailable : true;
              const booked = item?.bookedUnits || 0;
              const max = item?.maxUnits || 10;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[75px] sm:min-h-[85px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                    !cell.isCurrentMonth
                      ? "opacity-35 bg-neutral-50 dark:bg-neutral-800/40 border-dashed border-neutral-200 dark:border-neutral-800"
                      : isSelected
                      ? "ring-2 ring-[#327691] border-[#327691] bg-[#eef7fa] dark:bg-neutral-800 shadow-xs"
                      : isAvailable
                      ? "bg-[#fafcfd] dark:bg-neutral-800/60 border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-400"
                      : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:border-rose-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-[#327691] text-white flex items-center justify-center shadow-2xs"
                          : isSelected
                          ? "text-[#327691] dark:text-[#8abbd0]"
                          : "text-[#1e293b] dark:text-neutral-200"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Status Dot / Lock Icon */}
                    {isAvailable ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs" title="Tersedia" />
                    ) : (
                      <span title="Ditutup">
                        <Lock size={12} className="text-rose-600 dark:text-rose-400 shrink-0" />
                      </span>
                    )}
                  </div>

                  {/* Keterangan Status Tanggal */}
                  <div className="mt-1">
                    {isAvailable ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 block leading-tight">
                          Ready
                        </span>
                        <span className="text-[9px] font-semibold text-[#8e9da5] dark:text-neutral-400 block">
                          {booked}/{max} Unit
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400 block leading-tight truncate">
                          Tutup
                        </span>
                        <span className="text-[9px] font-medium text-rose-600/80 dark:text-rose-300/80 block truncate">
                          {item?.reason || "Off"}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kolom 3: Panel Pengaturan Tanggal Terpilih */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="pb-4 border-b border-[#f0f4f6] dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0] block">
                Detail Tanggal Terpilih
              </span>
              <h3 className="text-lg font-black text-[#1e293b] dark:text-neutral-100 mt-1">
                {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <span className="font-mono text-xs text-[#8e9da5] dark:text-neutral-400 mt-0.5 block">
                ID: {selectedDate}
              </span>
            </div>

            {/* Toggle Status Ketersediaan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1e293b] dark:text-neutral-200 block">
                Status Ketersediaan Booking
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus(true)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedStatus
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                      : "bg-[#f8fafc] dark:bg-neutral-800 border-[#e4ebef] dark:border-neutral-700 text-[#53636d] dark:text-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <Unlock size={14} />
                  <span>Buka (Tersedia)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus(false)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    !selectedStatus
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-[#f8fafc] dark:bg-neutral-800 border-[#e4ebef] dark:border-neutral-700 text-[#53636d] dark:text-neutral-300 hover:bg-neutral-100"
                  }`}
                >
                  <Lock size={14} />
                  <span>Tutup (Off)</span>
                </button>
              </div>
            </div>

            {/* Jika Ditutup: Masukkan Alasan Penutupan */}
            {!selectedStatus && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                  Alasan Penutupan Tanggal
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-[#1e293b] dark:text-neutral-100 focus:outline-none mb-2"
                >
                  <option value="Libur Operasional / Pemeliharaan Armada">Libur Operasional / Maintenance Jeep</option>
                  <option value="Jalur Wisata Ditutup / Cuaca Buruk">Jalur Wisata Ditutup / Cuaca Buruk</option>
                  <option value="Armada Penuh / Booking Khusus Event">Armada Penuh / Event Khusus</option>
                  <option value="Penutupan Rutin Wisata Kawah Ijen">Penutupan Rutin Wisata Kawah Ijen</option>
                  <option value="Lainnya">Alasan Kustom / Lainnya</option>
                </select>

                <input
                  type="text"
                  placeholder="Ketik catatan alasan khusus (misal: Jalur Ijen Tutup Gas Beracun)..."
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-neutral-800 text-[#1e293b] dark:text-neutral-100 focus:outline-none"
                />
              </div>
            )}

            {/* Kuota Armada Harian */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1e293b] dark:text-neutral-200">
                  Kapasitas Armada Harian (Unit Jeep)
                </label>
                <span className="text-[11px] font-mono text-[#8e9da5]">Default: 10 Unit</span>
              </div>
              <div className="flex items-center gap-3">
                <Car size={16} className="text-[#327691]" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={selectedMaxUnits}
                  onChange={(e) => setSelectedMaxUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-[#e4ebef] dark:border-neutral-700 bg-[#f8fafc] dark:bg-neutral-800 text-[#1e293b] dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-[#327691]"
                />
              </div>
            </div>

            {/* Ringkasan Status Booking Hari Ini */}
            <div className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/70 border border-[#e4ebef] dark:border-neutral-800 space-y-1 text-xs">
              <span className="text-[11px] font-bold text-[#8e9da5] uppercase tracking-wider block">
                Statistik Pesanan Pada Tanggal Ini
              </span>
              <p className="text-[#1e293b] dark:text-neutral-200 font-bold">
                {selectedItem?.bookedUnits || 0} Unit Terpesona dari {selectedMaxUnits} Kuota
              </p>
              <p className="text-[11px] text-[#64748b] dark:text-neutral-400">
                {selectedStatus
                  ? "Calon buyer dapat memesan paket tour untuk tanggal ini di katalog publik."
                  : "Tanggal ini akan otomatis terkunci di form booking & pencarian beranda."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#f0f4f6] dark:border-neutral-800">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Perubahan Tanggal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
