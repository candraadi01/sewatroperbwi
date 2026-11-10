"use client";

import { useState } from "react";
import { Clock, Plus, X, Sparkles, Check } from "lucide-react";

interface TimeListEditorProps {
  name: string;
  initialValue?: string;
}

export function TimeListEditor({ name, initialValue = "08:00" }: TimeListEditorProps) {
  // Parse initial string into clean array of HH:MM
  const parseTimes = (raw: string): string[] => {
    if (!raw) return ["08:00"];
    const items = raw
      .split(",")
      .map((s) => s.trim().slice(0, 5))
      .filter((s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s));
    return items.length > 0 ? Array.from(new Set(items)).sort() : ["08:00"];
  };

  const [times, setTimes] = useState<string[]>(() => parseTimes(initialValue));
  const [inputVal, setInputVal] = useState("08:00");
  const [errorMsg, setErrorMsg] = useState("");

  const presets = [
    { label: "00:00 (Ijen Blue Fire)", value: "00:00" },
    { label: "00:30 (Ijen Utama)", value: "00:30" },
    { label: "03:00 (Ijen Sunrise)", value: "03:00" },
    { label: "06:00 (Baluran Pagi)", value: "06:00" },
    { label: "07:00 (Sukamade Pagi)", value: "07:00" },
    { label: "08:00 (Standar Wisata)", value: "08:00" },
    { label: "13:00 (Safari Siang)", value: "13:00" },
  ];

  const addTime = (t: string) => {
    setErrorMsg("");
    const clean = t.trim().slice(0, 5);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(clean)) {
      setErrorMsg("Format jam harus HH:MM (contoh: 08:30)");
      return;
    }
    if (times.includes(clean)) {
      setErrorMsg(`Jam ${clean} WIB sudah ada di dalam daftar.`);
      return;
    }
    const updated = [...times, clean].sort((a, b) => a.localeCompare(b));
    setTimes(updated);
  };

  const removeTime = (target: string) => {
    if (times.length <= 1) {
      setErrorMsg("Minimal harus ada 1 jam keberangkatan.");
      return;
    }
    setErrorMsg("");
    setTimes(times.filter((t) => t !== target));
  };

  const serialized = times.join(", ");

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-[#f8fafc] dark:bg-neutral-800/80 border border-[#e2e8f0] dark:border-neutral-700">
      {/* Hidden input to ensure FormData gets the comma-separated times */}
      <input type="hidden" name={name} value={serialized} />

      {/* Header & Description */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
          <Clock size={14} className="text-[#327691]" />
          <span>Daftar Jam Keberangkatan Aktif:</span>
        </span>
        <span className="text-[11px] font-semibold text-slate-500 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-neutral-700">
          {times.length} Pilihan Tersedia
        </span>
      </div>

      {/* Active Time Badges (Chips) */}
      <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-700">
        {times.length === 0 ? (
          <span className="text-xs text-slate-400 italic">Belum ada jam ditambahkan.</span>
        ) : (
          times.map((t) => (
            <div
              key={t}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e9f3f7] dark:bg-neutral-800 border border-[#b8d7e5] dark:border-neutral-700 text-[#245265] dark:text-[#8abbd0] font-bold text-xs shadow-2xs group transition"
            >
              <span>{t} WIB</span>
              <button
                type="button"
                onClick={() => removeTime(t)}
                title={`Hapus ${t} WIB`}
                className="w-4 h-4 rounded-full hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 flex items-center justify-center transition cursor-pointer ml-0.5 text-slate-400 group-hover:text-slate-600"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input Tambah Jam Manual */}
      <div className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            type="time"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
          />
        </div>
        <button
          type="button"
          onClick={() => addTime(inputVal)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#327691] hover:bg-[#263b46] active:bg-[#1b2a32] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Tambah Jam</span>
        </button>
      </div>

      {errorMsg && (
        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
          ⚠️ {errorMsg}
        </p>
      )}

      {/* Preset Cepat Populer */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-neutral-700/80">
        <span className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles size={11} className="text-[#327691]" />
          Tambah Cepat Dari Preset Wisata:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => {
            const isAdded = times.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                disabled={isAdded}
                onClick={() => addTime(p.value)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                  isAdded
                    ? "bg-slate-100 dark:bg-neutral-800/50 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:border-[#327691] hover:text-[#327691]"
                }`}
              >
                {isAdded ? `✓ ${p.label}` : `+ ${p.label}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Dropdown untuk Buyer */}
      <div className="pt-2.5 border-t border-slate-200/80 dark:border-neutral-700/80">
        <span className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Tampilan Dropdown di Halaman Buyer:
        </span>
        <div className="relative">
          <select
            disabled
            className="w-full appearance-none bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-neutral-200 cursor-not-allowed opacity-90"
          >
            {times.map((t) => (
              <option key={t} value={t}>
                {t} WIB (Tersedia untuk dipesan)
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 italic">
          *Calon penyewa (buyer) akan memilih jam dari daftar dropdown di atas saat memesan.
        </p>
      </div>
    </div>
  );
}

