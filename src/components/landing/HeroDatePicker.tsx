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
                ? "text-white font-bold"
                : "text-rose-300 font-bold"
              : "text-white"
          } drop-shadow-sm`}
        >
          {value ? displayLabel : "Semua Jadwal Ready"}
        </span>

        <ChevronDown
          size={16}
          className={`text-white/80 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Kalender Visual Kompak & Rapi (Membuka ke Atas agar Tidak Menabrak Section Bawah) */}
      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 z-50 bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.45)] border border-[#d2e4ec] p-3 sm:p-3.5 w-[275px] sm:w-[285px] max-w-[calc(100vw-36px)] max-h-[85vh] overflow-y-auto font-sans animate-in fade-in zoom-in-95 duration-150">
          {/* Header Kalender: Bulan, Tahun & Panah Navigasi */}
          <div className="flex items-center justify-between pb-2 border-b border-[#f0f4f6]">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#1e293b]">
              <span>{monthNames[viewMonth]} {viewYear}</span>
              <span className="text-[10px] text-[#8e9da5]">▾</span>
            </div>

            <div className="flex items-center gap-0.5 text-[#53636d]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-md hover:bg-neutral-100 text-[#53636d] hover:text-[#1e293b] transition cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-md hover:bg-neutral-100 text-[#53636d] hover:text-[#1e293b] transition cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Header Hari: Su Mo Tu We Th Fr Sa */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold text-[#64748b] pt-2 pb-1">
            {dayLabels.map((day) => (
              <div key={day} className="py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Tanggal Kalender Kompak */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px]">
            {cells.map((cell) => {
              const isPast = cell.dateStr < todayStr;
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === value;
              const schedule = scheduleMap.get(cell.dateStr);

              // Logika Tanggal Tersedia vs Tidak Tersedia (Di-set oleh Admin/Pemilik)
              const isAvailable =
                cell.isCurrentMonth &&
                !isPast &&
                (schedule ? schedule.isAvailable : true);

              const isBlockedByAdmin =
                cell.isCurrentMonth &&
                !isPast &&
                schedule &&
                !schedule.isAvailable;

              // Tanggal Gelap (Mati / Tidak Bisa Diklik)
              if (!cell.isCurrentMonth || isPast || isBlockedByAdmin) {
                return (
                  <div
                    key={cell.dateStr}
                    className={`h-7 w-full flex items-center justify-center rounded-md text-[10px] select-none ${
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

              // Tanggal Cerah (Bisa Diklik & Siap Booking)
              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={`h-7 w-full flex items-center justify-center rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "border border-[#327691] bg-[#327691] text-white shadow-xs"
                      : isToday
                      ? "bg-neutral-800 text-white font-extrabold hover:bg-neutral-900"
                      : "text-neutral-800 hover:bg-[#e9f3f7] hover:text-[#327691]"
                  }`}
                  title="Jadwal Ready Siap Booking"
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Status & Aksi Bersatu Rapi */}
          <div className="mt-2.5 pt-2 border-t border-[#f0f4f6] flex items-center justify-between text-[10px] text-[#64748b]">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ready</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                <span>Tutup</span>
              </span>
            </div>

            <div className="flex items-center gap-2 font-bold text-[#327691]">
              <button
                type="button"
                onClick={handleClear}
                className="hover:underline cursor-pointer"
              >
                Clear
              </button>
              <span className="text-neutral-300">·</span>
              <button
                type="button"
                onClick={handleToday}
                className="hover:underline cursor-pointer"
              >
                Hari Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
