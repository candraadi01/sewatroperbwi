"use client";

import { useState } from "react";
import { User, Phone, Mail, Building2, CheckCircle2, Shield, Loader2, AlertCircle, Globe, Code } from "lucide-react";

interface InitialData {
  fullName: string;
  email: string;
  phone: string;
  poName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  briAccount?: string;
  bcaAccount?: string;
  businessEmail?: string;
  developerCredit?: string;
}

export function OwnerProfileClient({ initialData }: { initialData: InitialData }) {
  const [formData, setFormData] = useState<InitialData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/owner/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profil.");
      }

      setSuccessMessage("Profil pemilik, kontak hotline, dan data rekening footer berhasil diperbarui secara realtime!");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Notifikasi */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Pemilik */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-[#f0f4f6]">
            <div className="w-16 h-16 rounded-2xl bg-[#263b46] text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {formData.fullName?.[0]?.toUpperCase() || "O"}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#263b46]">
                {formData.fullName || "Pemilik Armada Trooper"}
              </h2>
              <p className="text-xs text-[#53636d] mt-0.5">{formData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Mitra Terverifikasi
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e9f3f7] text-[#327691] text-[11px] font-bold">
                  Owner
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nama Lengkap Pemilik
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
                placeholder="Nama pemilik resmi"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Nama PO / Paguyuban Armada (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.poName}
                  onChange={(e) => setFormData({ ...formData, poName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
                  placeholder="Contoh: PO Ijen Adventure"
                />
              </div>

              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Nomor WhatsApp & Hotline Kantor (cth: 62812345678)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium"
                  placeholder="62812345678"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Rekening Bank Default */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Building2 size={20} className="text-[#327691]" />
            <h3 className="font-extrabold text-base text-[#263b46]">
              Rekening Bank Default (Pencairan Saldo)
            </h3>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#263b46] mb-1">
                Nama Bank Tujuan
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] focus:outline-none focus:border-[#327691] font-medium bg-white"
              >
                <option value="BCA (Bank Central Asia)">BCA (Bank Central Asia)</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="Bank BRI (Bank Rakyat Indonesia)">Bank BRI (Bank Rakyat Indonesia)</option>
                <option value="Bank BNI">Bank BNI</option>
                <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                <option value="Bank Jatim">Bank Jatim</option>
                <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium focus:outline-none focus:border-[#327691]"
                  placeholder="Contoh: 000000"
                />
              </div>

              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Atas Nama Rekening (Sesuai Buku Tabungan)
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium focus:outline-none focus:border-[#327691]"
                  placeholder="Contoh: PT. SEWA JEEP BANYUWANGI"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Publik & Footer Website */}
        <div className="p-6 rounded-2xl bg-white border border-[#e4ebef] shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
            <Globe size={20} className="text-[#327691]" />
            <div>
              <h3 className="font-extrabold text-base text-[#263b46]">
                Informasi Kontak & Rekening Footer Website (Realtime)
              </h3>
              <p className="text-xs text-[#697780] mt-0.5">
                Data yang diubah di sini langsung tampil secara realtime pada footer seluruh halaman website.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Rekening BRI Resmi Footer (cth: 000000)
                </label>
                <input
                  type="text"
                  value={formData.briAccount || ""}
                  onChange={(e) => setFormData({ ...formData, briAccount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium focus:outline-none focus:border-[#327691]"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Rekening BCA Resmi Footer (cth: 000000)
                </label>
                <input
                  type="text"
                  value={formData.bcaAccount || ""}
                  onChange={(e) => setFormData({ ...formData, bcaAccount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium focus:outline-none focus:border-[#327691]"
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Email Kontak Resmi (cth: info@kulinosewatroper.com)
                </label>
                <input
                  type="email"
                  value={formData.businessEmail || ""}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium focus:outline-none focus:border-[#327691]"
                  placeholder="info@kulinosewatroper.com"
                />
              </div>

              <div>
                <label className="block font-bold text-[#263b46] mb-1">
                  Developer Credit Footer (cth: candra)
                </label>
                <input
                  type="text"
                  value={formData.developerCredit || ""}
                  onChange={(e) => setFormData({ ...formData, developerCredit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ccd8de] text-sm text-[#263b46] font-medium focus:outline-none focus:border-[#327691]"
                  placeholder="candra"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f0f4f6] flex items-center justify-between">
            <p className="text-[11px] text-[#697780]">
              Perubahan langsung disinkronkan ke footer website dan laporan pemilik armada.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer flex items-center gap-2 shrink-0 ml-3"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
