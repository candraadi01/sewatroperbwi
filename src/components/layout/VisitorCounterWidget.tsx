"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import type { VisitorStats } from "@/lib/services/visitor-counter";

interface VisitorCounterWidgetProps {
  initialStats?: VisitorStats;
}

export function VisitorCounterWidget({ initialStats }: VisitorCounterWidgetProps) {
  const [stats, setStats] = useState<VisitorStats>(
    initialStats || {
      today: 28,
      yesterday: 76,
      all: 7022,
      online: 1,
    }
  );

  useEffect(() => {
    // 1. Catat kunjungan pengguna secara riil saat halaman dimuat
    async function pingVisit() {
      try {
        const res = await fetch("/api/analytics/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStats(json.data);
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    pingVisit();

    // 2. Heartbeat tiap 45 detik untuk memperbarui status Online secara live
    const interval = setInterval(pingVisit, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {/* Header Sesuai Contoh Foto: VISITOR WEB dengan Ikon Centang */}
      <div className="flex items-center gap-2 text-white">
        <CheckCircle size={18} className="text-[#38bdf8] shrink-0" strokeWidth={2.5} />
        <h4 className="font-black text-sm uppercase tracking-wider text-white">
          VISITOR WEB
        </h4>
      </div>

      {/* Widget Tabel VisitorCounter (Persis Referensi Foto) */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden w-full max-w-[210px] select-none text-slate-700">
        {/* Header Tab Abu-abu Mengkilap */}
        <div className="bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] px-3 py-1.5 border-b border-[#cbd5e1]">
          <span className="font-extrabold text-[12px] text-[#475569] tracking-tight block">
            VisitorCounter
          </span>
        </div>

        {/* Baris Statistik Kunjungan */}
        <div className="divide-y divide-slate-100 text-[11.5px] font-medium">
          {/* Today */}
          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600">Today</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {stats.today.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Yesterday */}
          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600">Yesterday</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {stats.yesterday.toLocaleString("id-ID")}
            </span>
          </div>

          {/* All (Total Akumulasi) */}
          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors">
            <span className="text-slate-600">All</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {stats.all.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Online (Pengguna Aktif Saat Ini) */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-900 font-semibold">Online</span>
            </div>
            <span className="font-extrabold text-emerald-700 tabular-nums">
              {stats.online}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
