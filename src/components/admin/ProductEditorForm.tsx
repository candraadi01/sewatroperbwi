"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  X, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Image as ImageIcon, 
  DollarSign, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Car, 
  Users, 
  Calendar,
  Layers,
  ChevronRight,
  Eye
} from "lucide-react";
import { TimeListEditor } from "./TimeListEditor";
import { formatIDR } from "@/lib/utils/currency";

type Row = Record<string, unknown>;

interface ProductEditorFormProps {
  selected: Row;
  onClose: () => void;
  options: Record<string, { id: string; name: string }[]>;
  busy: boolean;
  error: string;
  onSave: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onUpload: (key: string, file?: File) => Promise<void>;
}

export function ProductEditorForm({
  selected,
  onClose,
  options,
  busy,
  error,
  onSave,
  onUpload,
}: ProductEditorFormProps) {
  const [activeTab, setActiveTab] = useState<"info" | "pricing" | "schedule" | "route" | "facilities">("info");

  // State lokal untuk live preview buyer
  const [name, setName] = useState<string>(String(selected.name || ""));
  const [slug, setSlug] = useState<string>(String(selected.slug || ""));
  const [shortDesc, setShortDesc] = useState<string>(String(selected.short_description || ""));
  const [price, setPrice] = useState<number>(Number(selected.base_price || 0));
  const [capacity, setCapacity] = useState<number>(Number(selected.passenger_capacity || 4));
  const [durationMin, setDurationMin] = useState<number>(Number(selected.duration_minutes || 480));
  const [driverIncluded, setDriverIncluded] = useState<boolean>(
    selected.driver_included !== undefined ? Boolean(selected.driver_included) : true
  );
  const [coverUrl, setCoverUrl] = useState<string>(String(selected.cover_image_url || ""));

  const tabs = [
    { id: "info", label: "1. Info Utama & Banner", icon: Layers, desc: "Judul, foto & status" },
    { id: "pricing", label: "2. Tarif & Kapasitas", icon: DollarSign, desc: "Harga & jumlah tamu" },
    { id: "schedule", label: "3. Jadwal & Kuota", icon: Clock, desc: "Jam berangkat & kuota" },
    { id: "route", label: "4. Rute & Penjemputan", icon: MapPin, desc: "Destinasi & titik kumpul" },
    { id: "facilities", label: "5. Fasilitas & Ketentuan", icon: Sparkles, desc: "Yang didapat & syarat" },
  ] as const;

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-3xl border border-[#e4ebef] dark:border-neutral-800 shadow-md overflow-hidden">
      {/* 1. Header Modal: Navigasi Bersih & Tombol Aksi */}
      <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-neutral-800/60 border-b border-[#e4ebef] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#327691] dark:text-[#8abbd0] bg-[#e9f3f7] dark:bg-neutral-800 px-2.5 py-0.5 rounded-md border border-[#ccd8de] dark:border-neutral-700">
              PENGELOLA TOUR & ARMADA
            </span>
            {Boolean(selected.id) && Boolean(slug) && (
              <a
                href={`/sewa/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md transition"
              >
                <Eye size={12} />
                <span>Lihat Tampilan Buyer</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1e293b] dark:text-neutral-100 mt-1">
            {selected.id ? `Edit Paket: ${name || "Tour Trooper"}` : "Tambah Paket Tour Baru"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Formulir ini disesuaikan persis dengan bagian yang dilihat calon penyewa (buyer).
          </p>
        </div>

        <button
          onClick={onClose}
          disabled={busy}
          className="self-end sm:self-center w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 hover:bg-slate-100 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer"
          title="Tutup Formulir"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Tab Bar: Pengelompokan Jelas & Terstruktur */}
      <div className="border-b border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6 pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "border-[#327691] text-[#327691] dark:text-[#8abbd0] bg-[#f8fafc] dark:bg-neutral-800/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon size={16} className={isActive ? "text-[#327691]" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Formulir Konten */}
      <form onSubmit={onSave} className="p-5 sm:p-7 space-y-6">
        {/* Hidden inputs untuk field yang tidak sedang aktif di tab saat ini agar form submit lengkap */}
        <input type="hidden" name="service_type" value={String(selected.service_type || "paket_rute")} />
        <input type="hidden" name="terms_version" value={String(selected.terms_version || "v1")} />
        <input type="hidden" name="is_owner_approved" value={String(selected.is_owner_approved ?? true)} />

        {/* ================= TAB 1: INFORMASI UTAMA & BANNER ================= */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Guide Box */}
            <div className="p-4 rounded-2xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#245265] space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-[#2c6881] text-xs uppercase tracking-wider">
                <Info size={14} className="text-[#327691]" />
                Bagian Ini Tampil Di Mana Pada Sisi Buyer?
              </span>
              <p className="text-[12px] leading-relaxed text-slate-700">
                Informasi di tab ini akan menjadi <strong>Judul Halaman Utama</strong>, <strong>Foto Sampul/Galeri</strong>, dan <strong>Ringkasan Singkat</strong> di bagian paling atas yang pertama kali dibaca oleh calon penyewa di halaman paket tour.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Nama Paket Wisata / Sewa Jeep <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SEWA JEEP BALURAN + FOTOGRAFER"
                  required
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-neutral-100 outline-none focus:border-[#327691] focus:ring-1 focus:ring-[#327691] transition"
                />
                <span className="text-[11px] text-slate-500">
                  Judul besar utama di halaman katalog dan pemesanan.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Alamat Halaman / Slug URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="text-xs font-mono bg-slate-100 dark:bg-neutral-800 border border-r-0 border-slate-300 dark:border-neutral-700 px-3 py-2.5 rounded-l-xl text-slate-500">
                    /sewa/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="sewa-jeep-baluran"
                    required
                    className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-r-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                  />
                </div>
                <span className="text-[11px] text-slate-400">Hanya huruf kecil, angka, dan tanda minus (-).</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Status Publikasi Produk
                </label>
                <select
                  name="status"
                  defaultValue={String(selected.status || "active")}
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                >
                  <option value="active">✓ Aktif (Tampil di Katalog Buyer)</option>
                  <option value="draft">Draft / Perlu Ditinjau (Disembunyikan)</option>
                  <option value="inactive">Nonaktif Sementara</option>
                  <option value="archived">Diarsipkan</option>
                </select>
                <span className="text-[11px] text-slate-400">Pilih 'Aktif' agar pembeli dapat melihat dan memesan paket ini.</span>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Foto Produk Utama (Cover Image)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    name="cover_image_url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="/images/landing/tour-baluran.jpg"
                    className="flex-1 bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                  />
                  <input
                    aria-label="Unggah Foto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => onUpload("cover_image_url", e.target.files?.[0])}
                    className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#e9f3f7] file:text-[#327691] hover:file:bg-[#d0e5ef] cursor-pointer"
                  />
                </div>
                <span className="text-[11px] text-slate-400">Foto resolusi tinggi mobil Jeep Trooper 4x4 di lokasi wisata.</span>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Ringkasan / Tagline Singkat
                </label>
                <textarea
                  name="short_description"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Eksplor Savana Bekol, Pantai Bama & Spot Satwa Liar bersama Trooper 4x4"
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                />
                <span className="text-[11px] text-slate-400">Teks ini muncul tepat di bawah judul paket pada layar buyer.</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TARIF & KAPASITAS ================= */}
        {activeTab === "pricing" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Guide Box */}
            <div className="p-4 rounded-2xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#245265] space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-[#2c6881] text-xs uppercase tracking-wider">
                <Info size={14} className="text-[#327691]" />
                Bagian Ini Tampil Di Mana Pada Sisi Buyer?
              </span>
              <p className="text-[12px] leading-relaxed text-slate-700">
                Tarif ini menentukan <strong>Harga Sewa</strong> di kotak pemesanan kanan (Booking Widget) dan rincian checkout. Kapasitas penumpang membatasi jumlah maksimal peserta per 1 armada Jeep Trooper.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Tarif Sewa Utama Per Kendaraan (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-xs text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="base_price"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={100000}
                    step={10000}
                    required
                    className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-black text-slate-900 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                  />
                </div>
                <span className="text-[11px] font-bold text-[#327691]">
                  Format Rupiah: {formatIDR(price)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Kapasitas Penumpang (Per 1 Mobil Jeep) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="passenger_capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={1}
                    max={10}
                    required
                    className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500">
                  Standar kenyamanan Jeep Trooper: 4 hingga 6 orang penumpang.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Durasi Layanan (Menit)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  min={60}
                  step={30}
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                />
                <span className="text-[11px] text-slate-500">
                  {durationMin} Menit = <strong>{Math.round(durationMin / 60)} Jam Layanan</strong> (Ditampilkan di badge durasi).
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Layanan Sopir / Driver Lapangan
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="driver_included"
                    id="driver_included_check"
                    checked={driverIncluded}
                    onChange={(e) => setDriverIncluded(e.target.checked)}
                    className="w-5 h-5 rounded-md text-[#327691] focus:ring-[#327691] cursor-pointer"
                  />
                  <label htmlFor="driver_included_check" className="text-xs font-bold text-slate-700 dark:text-neutral-300 cursor-pointer">
                    Termasuk Driver / Sopir Berpengalaman
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">
                  Centang untuk menampilkan badge 'Termasuk Driver & BBM'.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: JADWAL & KUOTA (PERMINTAAN USER) ================= */}
        {activeTab === "schedule" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Guide Box */}
            <div className="p-4 rounded-2xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#245265] space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-[#2c6881] text-xs uppercase tracking-wider">
                <Info size={14} className="text-[#327691]" />
                Bagian Ini Tampil Di Mana Pada Sisi Buyer?
              </span>
              <p className="text-[12px] leading-relaxed text-slate-700">
                Pilihan jam yang Anda tambahkan di bawah ini <strong>akan langsung muncul sebagai menu pilihan dropdown Jam Keberangkatan</strong> di halaman pemesanan buyer. Kuota harian memastikan sistem tidak menerima booking jika unit sudah penuh.
              </p>
            </div>

            {/* Modul Tambah-Tambah Jam Keberangkatan */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#327691]" />
                Pilihan Jam Keberangkatan (Dapat Ditambah-Tambah)
              </label>
              <TimeListEditor
                name="default_start_time"
                initialValue={String(selected.default_start_time || "08:00")}
              />
            </div>

            {/* Pengaturan Kuota & Ketersediaan Kalender Cepat */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#327691]" />
                    Kelola Kuota Harian & Kalender Ketersediaan
                  </span>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Atur tanggal buka/tutup dan kuota armada khusus untuk paket ini.
                  </p>
                </div>

                <Link
                  href={`/admin/jadwal?catalogId=${selected.id || ""}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#327691] hover:bg-[#263b46] text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                >
                  <Calendar size={13} />
                  <span>Buka Kalender Jadwal Detail</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 dark:text-neutral-200">
                  💡 Tips Kuota & Jadwal Real-time:
                </p>
                <p className="text-[11.5px] leading-relaxed">
                  Jika armada sedang maintenance atau off pada tanggal tertentu, Anda dapat membuka <strong>Kalender Jadwal</strong> di atas dan mengklik tanggal tersebut menjadi <strong>Tutup (Off)</strong>. Calon penyewa tidak akan bisa memesan pada tanggal tersebut secara otomatis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: RUTE & PENJEMPUTAN ================= */}
        {activeTab === "route" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Guide Box */}
            <div className="p-4 rounded-2xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#245265] space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-[#2c6881] text-xs uppercase tracking-wider">
                <Info size={14} className="text-[#327691]" />
                Bagian Ini Tampil Di Mana Pada Sisi Buyer?
              </span>
              <p className="text-[12px] leading-relaxed text-slate-700">
                Data rute dan titik jemput ini ditampilkan di <strong>Badge Destinasi</strong> dan <strong>Formulir Pemilihan Lokasi Penjemputan</strong> pada saat buyer melakukan reservasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Nama Rute Destinasi Wisata
                </label>
                <input
                  type="text"
                  name="route_name"
                  defaultValue={String(selected.route_name || "")}
                  placeholder="Contoh: TN Baluran, Savana Bekol & Pantai Bama"
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                />
                <span className="text-[11px] text-slate-400">Rute destinasi yang akan dikunjungi bersama Jeep Trooper.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Titik Awal Penjemputan
                </label>
                <input
                  type="text"
                  name="start_point"
                  defaultValue={String(selected.start_point || "Area Kota Banyuwangi / Hotel")}
                  placeholder="Area Banyuwangi Kota (Hotel / Stasiun)"
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                />
                <span className="text-[11px] text-slate-400">Titik default driver menjemput tamu.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Titik Selesai / Pengantaran Pulang
                </label>
                <input
                  type="text"
                  name="end_point"
                  defaultValue={String(selected.end_point || "Kembali ke titik penjemputan semula")}
                  placeholder="Kembali ke hotel / Stasiun Banyuwangi"
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                />
                <span className="text-[11px] text-slate-400">Lokasi drop-off tamu setelah trip selesai.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Batas Minimal Pemesanan Sebelum Trip (Jam)
                </label>
                <input
                  type="number"
                  name="min_booking_hours"
                  defaultValue={Number(selected.min_booking_hours || 24)}
                  min={0}
                  max={72}
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition"
                />
                <span className="text-[11px] text-slate-400">Misal 24 jam: pemesanan minimal dilakukan H-1 sebelum keberangkatan.</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: FASILITAS & KETENTUAN ================= */}
        {activeTab === "facilities" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Guide Box */}
            <div className="p-4 rounded-2xl bg-[#e9f3f7] border border-[#ccd8de] text-xs text-[#245265] space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-[#2c6881] text-xs uppercase tracking-wider">
                <Info size={14} className="text-[#327691]" />
                Bagian Ini Tampil Di Mana Pada Sisi Buyer?
              </span>
              <p className="text-[12px] leading-relaxed text-slate-700">
                Fasilitas Termasuk akan tampil di <strong>Kotak Hijau Checklist</strong> pada detail paket. Di Luar Harga tampil di <strong>Kotak Abu-abu Silang</strong>. Deskripsi lengkap tampil di bagian <strong>Tentang Layanan Ini</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-600" />
                  Fasilitas Termasuk (Pisahkan dengan baris baru Enter)
                </label>
                <textarea
                  name="included_facilities"
                  rows={5}
                  defaultValue={
                    Array.isArray(selected.included_facilities)
                      ? selected.included_facilities.join("\n")
                      : "Kendaraan Jeep Trooper 4x4 Terawat\nDriver Profesional Berpengalaman\nBahan Bakar Minyak (BBM) Selama Trip\nAir Mineral Botol untuk Tamu"
                  }
                  placeholder="Contoh per baris:&#10;Kendaraan Jeep Trooper 4x4&#10;Driver berpengalaman&#10;BBM selama trip"
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-neutral-100 outline-none focus:border-emerald-600 transition leading-relaxed font-medium"
                />
                <span className="text-[11px] text-slate-500">Tiap baris otomatis diberi tanda centang hijau (✓).</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <X size={13} className="text-slate-500" />
                  Di Luar Harga / Belum Termasuk (Pisahkan dengan baris baru Enter)
                </label>
                <textarea
                  name="excluded_facilities"
                  rows={5}
                  defaultValue={
                    Array.isArray(selected.excluded_facilities)
                      ? selected.excluded_facilities.join("\n")
                      : "Tiket Masuk Destinasi Wisata\nMakan & Pengeluaran Pribadi\nPenginapan / Hotel"
                  }
                  placeholder="Contoh per baris:&#10;Tiket masuk wisata&#10;Makan dan pengeluaran pribadi"
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-neutral-100 outline-none focus:border-slate-500 transition leading-relaxed font-medium"
                />
                <span className="text-[11px] text-slate-500">Tiap baris otomatis diberi tanda silang (✕).</span>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Deskripsi Lengkap (Tentang Layanan Ini)
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={String(selected.description || "")}
                  placeholder="Jelaskan daya tarik rute ini, spot foto menarik, keistimewaan Jeep Trooper, dsb."
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-black text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                  Ketentuan Layanan & Informasi Penting
                </label>
                <textarea
                  name="terms_content"
                  rows={3}
                  defaultValue={String(selected.terms_content || "Disarankan membawa jaket hangat, sepatu yang nyaman, dan obat-obatan pribadi.")}
                  placeholder="Informasi persiapan fisik, perlengkapan yang disarankan, atau kebijakan khusus."
                  className="w-full bg-[#f8fafc] dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-neutral-100 outline-none focus:border-[#327691] transition leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4. Footer Form: Tombol Simpan & Batal */}
        <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Navigasi Cepat Tab:</span>
            {tabs.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-6 h-6 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  activeTab === t.id
                    ? "bg-[#327691] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-[#327691] hover:bg-[#263b46] active:bg-[#1b2a32] text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>{busy ? "Menyimpan Data..." : "Simpan Perubahan Paket"}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
