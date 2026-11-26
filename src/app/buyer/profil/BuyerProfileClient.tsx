/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  Camera,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface BuyerProfileClientProps {
  user: {
    id?: string;
    fullName: string;
    email: string;
    roles?: string[];
    avatarUrl?: string;
    phone?: string;
  };
}

const PRESET_AVATARS = [
  { id: "avatar-trooper", label: "Jeep Rider", emoji: "🚙", bg: "#f4bd42" },
  { id: "avatar-explorer", label: "Explorer", emoji: "🧭", bg: "#327691" },
  { id: "avatar-mount", label: "Ijen Hiker", emoji: "🧗", bg: "#16a34a" },
  { id: "avatar-camera", label: "Traveler", emoji: "📸", bg: "#6366f1" },
];

export function BuyerProfileClient({ user }: BuyerProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.fullName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle local image upload (converted to data URL)
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap pilih file gambar (JPG, PNG, atau WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimal 2 MB.");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSelectPreset(preset: typeof PRESET_AVATARS[0]) {
    // Generate crisp perfect circular SVG data URL with viewBox and preserveAspectRatio
    const encodedBg = encodeURIComponent(preset.bg);
    const svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" preserveAspectRatio="xMidYMid meet"><circle cx="64" cy="64" r="64" fill="${encodedBg}"/><text x="64" y="74" font-size="56" text-anchor="middle" dominant-baseline="central">${preset.emoji}</text></svg>`;
    setAvatarUrl(svg);
    setErrorMsg("");
  }

  function handleRemovePhoto() {
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Nama lengkap minimal 2 karakter.");
      return;
    }

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/buyer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui profil.");
      }

      setSuccessMsg("Profil akun Anda berhasil diperbarui!");
      router.refresh();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#e4ebef] dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263b46] dark:text-neutral-100 tracking-tight">
          Profil Akun Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-[#73848e] dark:text-neutral-400 mt-1">
          Kelola data diri, nomor kontak penjemputan, dan foto profil Anda.
        </p>
      </div>

      {/* Success & Error Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Kartu Edit Profil Utama */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-xs space-y-6">
        {/* Section 1: Foto Profil & Avatar */}
        <div>
          <label className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider mb-3">
            Foto Profil
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Avatar Preview Bulat Sempurna (1:1) */}
            <div
              className="relative group shrink-0 self-center sm:self-auto aspect-square rounded-full"
              style={{ width: "88px", height: "88px", minWidth: "88px", minHeight: "88px" }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || "Avatar"}
                  className="w-full h-full aspect-square rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-md ring-2 ring-[#327691]/25 block"
                  style={{ width: "88px", height: "88px", minWidth: "88px", minHeight: "88px", aspectRatio: "1 / 1" }}
                />
              ) : (
                <div
                  className="w-full h-full aspect-square rounded-full bg-gradient-to-br from-[#327691] to-[#263b46] text-white flex items-center justify-center font-black text-3xl shadow-md border-4 border-white dark:border-neutral-800"
                  style={{ width: "88px", height: "88px", minWidth: "88px", minHeight: "88px", aspectRatio: "1 / 1" }}
                >
                  {fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "P"}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#327691] hover:bg-[#265b70] text-white shadow-md transition cursor-pointer border-2 border-white dark:border-neutral-900 flex items-center justify-center shrink-0"
                title="Ganti Foto"
                aria-label="Pilih foto profil"
              >
                <Camera size={15} className="shrink-0 block" />
              </button>
            </div>

            {/* Tombol Kontrol Foto */}
            <div className="space-y-2.5 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-bold border border-slate-200 dark:border-neutral-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Camera size={14} className="text-[#327691]" />
                  <span>Pilih Foto Baru</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              {/* Preset Avatar Cepat */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 block mb-1.5">
                  Atau pilih avatar petualang:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#e9f3f7] dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{p.emoji}</span>
                      <span className="text-[11px] text-slate-700 dark:text-neutral-300">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Form Input Data Diri */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
          {/* Nama Lengkap */}
          <div>
            <label htmlFor="profile-fullName" className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Nama Lengkap *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
              <input
                id="profile-fullName"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-[#263b46] dark:text-neutral-100 focus:outline-hidden focus:border-[#327691] focus:ring-2 focus:ring-[#327691]/20 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
              Nama ini akan dicantumkan pada E-Tiket dan bukti reservasi resmi.
            </p>
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label htmlFor="profile-phone" className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
              <input
                id="profile-phone"
                type="tel"
                maxLength={20}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs sm:text-sm font-semibold text-[#263b46] dark:text-neutral-100 focus:outline-hidden focus:border-[#327691] focus:ring-2 focus:ring-[#327691]/20 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
              Nomor aktif digunakan driver untuk konfirmasi penjemputan dan koordinasi trip.
            </p>
          </div>

          {/* Alamat Email (Protected / Read Only) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="profile-email" className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider">
                Alamat Email Akun
              </label>
              <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Email Utama
              </span>
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9ba5]" />
              <input
                id="profile-email"
                type="email"
                readOnly
                value={user.email}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/60 text-xs sm:text-sm font-semibold text-slate-500 dark:text-neutral-400 cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1">
              Email akun terdaftar secara aman dan digunakan untuk pengiriman invoice serta tiket trip.
            </p>
          </div>
        </div>

        {/* Section 3: Tombol Simpan Perubahan */}
        <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-neutral-500 order-2 sm:order-1">
            Perubahan data diri akan otomatis tersinkronisasi ke seluruh layanan.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
