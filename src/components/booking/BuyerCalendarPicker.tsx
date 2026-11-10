"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Check } from "lucide-react";

interface ScheduleItem {
  isAvailable: boolean;
  reason?: string;
  bookedUnits: number;
  maxUnits: number;
}

interface BuyerCalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  scheduleMap: Record<string, ScheduleItem>;
  minDate: string; // YYYY-MM-DD
  loading?: boolean;
}

export function BuyerCalendarPicker({
  value,
  onChange,
  scheduleMap,
  minDate,
  loading = false,
}: BuyerCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date for month view
  const initialDateObj = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(() => initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDateObj.getMonth()); // 0-indexed

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

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

  // Generate Calendar Days
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startDayIdx = firstDay.getDay(); // 0 is Sunday
  const daysInMonth = lastDay.getDate();

  const cells = [];
  // Buffer hari bulan lalu
  for (let i = 0; i < startDayIdx; i++) {
    cells.push({ day: null, dateStr: "" });
  }
  // Hari-hari bulan ini
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${viewYear}-${mm}-${dd}`;
    cells.push({ day: d, dateStr });
  }

  // Format label tampilan di button input
  const displayFormatted = (() => {
    if (!value) return "Pilih Tanggal Trip";
    const d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  const currentSelectedSchedule = scheduleMap[value];
  const isCurrentClosed = currentSelectedSchedule ? !currentSelectedSchedule.isAvailable : false;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Tombol Input Trigger Kalender */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-left text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-slate-100/80 focus:bg-white border rounded-xl px-3 py-2.5 transition shadow-2xs flex items-center justify-between cursor-pointer ${
          isCurrentClosed
            ? "border-rose-300 bg-rose-50/50 text-rose-900"
            : isOpen
            ? "border-[#327691] ring-2 ring-[#327691]/20 bg-white text-slate-900"
            : "border-slate-200 text-slate-900"
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon size={14} className="text-[#327691] shrink-0" />
          <span className="font-extrabold truncate">{displayFormatted}</span>
        </span>
        <span className="text-[11px] font-bold text-[#327691] shrink-0 ml-1">
          {isOpen ? "Tutup ✕" : "Ubah ▾"}
        </span>
      </button>

      {/* Popover Kalender Kustom Interaktif */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[320px] mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 space-y-3 animate-fadeIn">
          {/* Header Navigasi Bulan */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black text-slate-900">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Grid Label Hari */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayLabels.map((lbl, idx) => (
              <span
                key={lbl}
                className={`text-[10.5px] font-extrabold ${
                  idx === 0 ? "text-rose-500" : "text-slate-400"
                }`}
              >
                {lbl}
              </span>
            ))}
          </div>

          {/* Grid Kotak Tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (!cell.day) {
                return <div key={`empty-${idx}`} className="h-9" />;
              }

              const isPast = cell.dateStr < minDate;
              const isSelected = cell.dateStr === value;
              const sched = scheduleMap[cell.dateStr];
              const isClosed = sched ? !sched.isAvailable : false;
              const isDisabled = isPast || isClosed;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(cell.dateStr);
                    setIsOpen(false);
                  }}
                  title={
                    isPast
                      ? "Tanggal sudah lewat"
                      : isClosed
                      ? `Jadwal Ditutup (${sched?.reason || "Tidak tersedia"})`
                      : `Tersedia untuk dipesan`
                  }
                  className={`h-9 w-full rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition cursor-pointer ${
                    isSelected
                      ? "bg-[#327691] text-white shadow-xs font-black scale-105 z-10"
                      : isPast
                      ? "text-slate-300 opacity-40 cursor-not-allowed"
                      : isClosed
                      ? "bg-rose-50 border border-rose-200 text-rose-400 line-through cursor-not-allowed"
                      : "text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 hover:border hover:border-emerald-300"
                  }`}
                >
                  <span className="leading-tight">{cell.day}</span>
                  {/* Indikator Titik Ketersediaan di Kalender */}
                  {!isPast && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected
                          ? "bg-white"
                          : isClosed
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda Keterangan Status di Bawah Kalender */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold px-1">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Tersedia (Bisa Dipesan)
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Ditutup / Off
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

