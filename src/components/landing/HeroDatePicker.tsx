"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Lock,
  CheckCircle2,
} from "lucide-react";
import type { DateScheduleItem } from "@/lib/services/schedule";

interface HeroDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  schedules: DateScheduleItem[];
  loading?: boolean;
}

export function HeroDatePicker({
  value,
  onChange,
  schedules,
  loading = false,
}: HeroDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse tanggal saat ini atau tanggal terpilih untuk bulan kalender
  const initialDate = value ? new Date(value + "T00:00:00Z") : new Date();
  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map ketersediaan berdasarkan tanggal
  const scheduleMap = new Map<string, DateScheduleItem>();
  schedules.forEach((item) => {
    scheduleMap.set(item.date, item);
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthNamesId = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Hari dimulai dari Sunday (Su) sesuai foto 1
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Navigasi Bulan
  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // Hitung grid hari
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

  // Sunday = 0
  const startDayIndex = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Hari bulan sebelumnya
  const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
  const cells: {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
  }[] = [];

  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevDate = new Date(Date.UTC(viewYear, viewMonth - 1, d));
    cells.push({
      dateStr: prevDate.toISOString().slice(0, 10),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Hari bulan aktif
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(Date.UTC(viewYear, viewMonth, d));
    cells.push({
      dateStr: currDate.toISOString().slice(0, 10),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Hari bulan berikutnya
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(Date.UTC(viewYear, viewMonth + 1, d));
    cells.push({
      dateStr: nextDate.toISOString().slice(0, 10),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  const todayObj = new Date();
  const todayStr = todayObj.toISOString().slice(0, 10);

  function handleSelectDate(dateStr: string) {
    onChange(dateStr);
    setIsOpen(false);
  }

  function handleClear() {
    onChange("");
    setIsOpen(false);
  }

  function handleToday() {
    const schedule = scheduleMap.get(todayStr);
    // Jika hari ini tersedia atau belum diset ditutup
    if (!schedule || schedule.isAvailable) {
      onChange(todayStr);
      setViewYear(todayObj.getFullYear());
      setViewMonth(todayObj.getMonth());
      setIsOpen(false);
    }
  }

  // Format label terpilih
  let displayLabel = "Pilih Jadwal";
  let isSelectedAvailable = true;
  if (value) {
    const d = new Date(value + "T00:00:00Z");
    displayLabel = d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const sched = scheduleMap.get(value);
    isSelectedAvailable = sched ? sched.isAvailable : true;
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button di Form Pencarian */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span
          className={`text-xs sm:text-sm font-semibold truncate ${
            value
              ? isSelectedAvailable
                ? "text-[#1e293b] font-bold"
                : "text-rose-600 font-bold"
              : "text-[#53636d]"
          }`}
        >
          {value ? displayLabel : "Semua Jadwal Ready"}
        </span>

        <ChevronDown
          size={16}
          className={`text-[#8e9da5] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Kalender Visual (Persis Foto 1) */}
      {isOpen && (
        <div className="absolute top-[calc(100%+10px)] left-0 sm:left-auto sm:right-0 z-50 bg-white rounded-2xl shadow-2xl border border-[#d2e4ec] p-4.5 w-[300px] sm:w-[325px] font-sans animate-in fade-in zoom-in-95 duration-150">
          {/* Header Kalender: Bulan, Tahun & Panah Navigasi */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f6]">
            <div className="flex items-center gap-1.5 font-bold text-sm text-[#1e293b]">
              <span>{monthNames[viewMonth]} {viewYear}</span>
              <span className="text-xs text-[#8e9da5]">▾</span>
            </div>

            <div className="flex items-center gap-1 text-[#53636d]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-neutral-100 text-[#53636d] hover:text-[#1e293b] transition cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-neutral-100 text-[#53636d] hover:text-[#1e293b] transition cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* Header Hari: Su Mo Tu We Th Fr Sa */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#64748b] pt-3 pb-1.5">
            {dayLabels.map((day) => (
              <div key={day} className="py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Tanggal Kalender */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {cells.map((cell) => {
              const isPast = cell.dateStr < todayStr;
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === value;
              const schedule = scheduleMap.get(cell.dateStr);

              // Logika Tanggal Tersedia vs Tidak Tersedia (Di-set oleh Admin/Pemilik)
              // Jika di blackout_dates atau quota penuh => TIDAK BISA DIBOOKING (Gelap)
              const isAvailable =
                cell.isCurrentMonth &&
                !isPast &&
                (schedule ? schedule.isAvailable : true);

              const isBlockedByAdmin =
                cell.isCurrentMonth &&
                !isPast &&
                schedule &&
                !schedule.isAvailable;

              // Tanggal Gelap (Mati / Tidak Bisa Diklik):
              // 1. Hari di luar bulan aktif
              // 2. Hari lampau (past date)
              // 3. Ditutup oleh Admin / Pemilik (blackout)
              if (!cell.isCurrentMonth || isPast || isBlockedByAdmin) {
                return (
                  <div
                    key={cell.dateStr}
                    className={`h-8 sm:h-9 flex items-center justify-center rounded-md text-xs select-none ${
                      isBlockedByAdmin
                        ? "text-neutral-400 bg-neutral-100/70 cursor-not-allowed line-through font-medium"
                        : "text-neutral-300 cursor-not-allowed"
                    }`}
                    title={
                      isBlockedByAdmin
                        ? `Jadwal Ditutup: ${schedule?.reason || "Tidak tersedia"}`
                        : undefined
                    }
                  >
                    {cell.dayNum}
                  </div>
                );
              }

              // Tanggal Cerah (Bisa Diklik & Bisa Di-booking):
              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={`h-8 sm:h-9 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-black bg-neutral-100 text-black font-black shadow-xs scale-105"
                      : isToday
                      ? "bg-neutral-700 text-white font-extrabold shadow-2xs hover:bg-neutral-800"
                      : "text-neutral-900 hover:bg-[#e9f3f7] hover:text-[#327691] hover:font-black"
                  }`}
                  title="Jadwal Ready Siap Booking"
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          {/* Keterangan Status Tanggal */}
          <div className="mt-3 pt-2.5 border-t border-[#f0f4f6] flex items-center justify-between text-[11px] text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-neutral-800">Cerah:</strong> Bisa Booking
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-300" />
              <strong className="text-neutral-400">Gelap:</strong> Ditutup
            </span>
          </div>

          {/* Footer Aksi Bawah: Clear di kiri & Today di kanan persis Foto 1 */}
          <div className="mt-2 pt-2 border-t border-[#f0f4f6] flex items-center justify-between text-xs font-bold text-[#327691]">
            <button
              type="button"
              onClick={handleClear}
              className="text-[#327691] hover:underline cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[#327691] hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
