import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import {
  CalendarCheck2,
  PlusCircle,
  Calendar,
  Car,
  User,
  Phone,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Penjadwalan Luar Web | Sewa Trooper Banyuwangi",
  description: "Penjadwalan pesanan offline dan pihak ketiga agar tidak bentrok dengan jadwal web.",
};

export default async function OwnerJadwalPage() {
  const user = await requireOwner("/owner/jadwal");
  const db = await createAdminClient();

  // Ambil jadwal offline dari database
  const { data: offlineList } = await db
    .from("offline_schedules")
    .select("*")
    .order("start_date", { ascending: true })
    .limit(50);

  const schedules = offlineList ?? [
    {
      id: "demo-1",
      vehicle_name: "Jeep Trooper 4x4 (P 1845 BWI)",
      renter_name: "Rombongan Bpk. Hendra (Jakarta)",
      renter_phone: "081234567890",
      start_date: "2026-10-25",
      end_date: "2026-10-26",
      source: "WhatsApp Direct",
      notes: "Trip Kawah Ijen & Baluran. Pembayaran DP tunai di kantor.",
    },
    {
      id: "demo-2",
      vehicle_name: "Jeep Trooper Long (P 1920 BWI)",
      renter_name: "Tour Travel Surabaya",
      renter_phone: "081398765432",
      start_date: "2026-10-28",
      end_date: "2026-10-29",
      source: "Pihak Ketiga / Agent",
      notes: "Sewa Sukamade 2D1N. Supir Mas Budi.",
    },
  ];

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Pencegahan Double Booking
          </span>
          <h1 className="heading-1 mt-1">Penjadwalan Luar Web (Offline)</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Kunci tanggal armada untuk pesanan via WhatsApp, telepon, atau pihak ketiga agar tidak bisa dipesan tamu web.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-7 items-start">
        {/* Kolom Kiri: Daftar Tanggal Terkunci Luar Web */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#263b46]">
              Jadwal Luar Web yang Sedang Berjalan & Mendatang
            </h2>
            <span className="text-xs text-neutral-400 font-semibold">
              {schedules.length} Jadwal Terkunci
            </span>
          </div>

          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-amber-400 transition shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f4f6]">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                      {s.source}
                    </span>
                    <h3 className="font-extrabold text-[#263b46] text-base mt-2">
                      {s.vehicle_name}
                    </h3>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Clock size={12} />
                    <span>Terkunci</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 text-xs text-[#53636d]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#327691] shrink-0" />
                    <span>
                      {s.start_date} s/d {s.end_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#327691] shrink-0" />
                    <span className="truncate">{s.renter_name}</span>
                  </div>
                </div>

                {s.notes && (
                  <p className="text-xs text-neutral-500 bg-[#f8fafc] p-2.5 rounded-xl border border-neutral-100 mt-1">
                    <strong>Catatan:</strong> {s.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Formulir Tambah Jadwal Luar Web */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
            <PlusCircle size={18} className="text-[#327691]" />
            <h3 className="font-extrabold text-base text-[#263b46]">
              Input Jadwal Pesanan Offline Baru
            </h3>
          </div>

          <form className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Pilih Unit Armada
              </label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]">
                <option value="trooper-1">Jeep Trooper 4x4 (P 1845 BWI)</option>
                <option value="trooper-2">Jeep Trooper Long (P 1920 BWI)</option>
                <option value="trooper-3">Jeep Trooper Hardtop (P 1982 BWI)</option>
                <option value="all">Semua Unit (Blokir Tanggal Penuh)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nama Tamu / Rombongan
              </label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Ahmad (Surabaya)"
                className="w-full px-3 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="081234567890"
                className="w-full px-3 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Mulai Sewa
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Selesai Sewa
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Sumber Pemesanan
              </label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]">
                <option value="wa">Chat WhatsApp Pribadi</option>
                <option value="telepon">Telepon Langsung</option>
                <option value="agent">Agen Travel / Pihak Ketiga</option>
                <option value="walk_in">Tamu Langsung / Walk-In</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Catatan Rute / Kebutuhan
              </label>
              <textarea
                rows={2}
                placeholder="Rute Kawah Ijen sunrise, jemput di stasiun..."
                className="w-full px-3 py-2 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691]"
              />
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-[#263b46] hover:bg-[#1b2b33] text-white font-extrabold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              Kunci Tanggal Armada Ini
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
