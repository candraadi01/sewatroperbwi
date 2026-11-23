"use client";

import { useState } from "react";
import { PlusCircle, Phone, MapPin, X, Check, Trash2, Edit3, UserPlus } from "lucide-react";

export interface DriverMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  specialist: string;
  status: "Siap Bertugas" | "Sedang Bertugas" | "Libur";
  avatar: string;
}

const STORAGE_KEY = "sewa_trooper_admin_driver_team";

export function AdminTimClient({ initialDrivers }: { initialDrivers: DriverMember[] }) {
  const [drivers, setDrivers] = useState<DriverMember[]>(() => {
    if (typeof window === "undefined") return initialDrivers;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return initialDrivers;
  });
  const [editingDriver, setEditingDriver] = useState<DriverMember | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phone: "",
    specialist: "",
    status: "Siap Bertugas" as DriverMember["status"],
  });

  function saveToStorage(updated: DriverMember[]) {
    setDrivers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function openEditModal(driver: DriverMember) {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      role: driver.role,
      phone: driver.phone,
      specialist: driver.specialist,
      status: driver.status,
    });
    setIsAddingNew(false);
  }

  function openAddModal() {
    setIsAddingNew(true);
    setEditingDriver(null);
    setFormData({
      name: "",
      role: "Driver & Tour Guide",
      phone: "",
      specialist: "Kawah Ijen & Baluran",
      status: "Siap Bertugas",
    });
  }

  function closeModal() {
    setEditingDriver(null);
    setIsAddingNew(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (isAddingNew) {
      const newDriver: DriverMember = {
        id: `drv-${Date.now()}`,
        name: formData.name.trim(),
        role: formData.role.trim() || "Driver & Guide",
        phone: formData.phone.trim(),
        specialist: formData.specialist.trim() || "Rute Wisata Banyuwangi",
        status: formData.status,
        avatar: getInitials(formData.name),
      };
      const updated = [...drivers, newDriver];
      saveToStorage(updated);
      showToast(`Driver ${newDriver.name} berhasil ditambahkan!`);
    } else if (editingDriver) {
      const updated = drivers.map((d) =>
        d.id === editingDriver.id
          ? {
              ...d,
              name: formData.name.trim(),
              role: formData.role.trim() || d.role,
              phone: formData.phone.trim(),
              specialist: formData.specialist.trim() || d.specialist,
              status: formData.status,
              avatar: getInitials(formData.name),
            }
          : d
      );
      saveToStorage(updated);
      showToast(`Data driver ${formData.name} berhasil diperbarui!`);
    }

    closeModal();
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Yakin ingin menghapus ${name} dari daftar driver?`)) {
      const updated = drivers.filter((d) => d.id !== id);
      saveToStorage(updated);
      showToast(`Driver ${name} telah dihapus.`);
      closeModal();
    }
  }

  return (
    <div className="space-y-7 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-xl animate-bounce">
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Operasional Lapangan
          </span>
          <h1 className="heading-1 mt-1">Kelola Tim Driver & Kru</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Daftar pengemudi berpengalaman, pemandu lokal, dan koordinasi armada Jeep Trooper.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>+ Tambah Anggota Tim</span>
        </button>
      </div>

      {/* Grid Tim Driver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {drivers.map((member) => {
          const cleanPhone = member.phone.replace(/^0/, "").replace(/\D/g, "");
          const waMessage = `Halo ${member.name}, saya Admin Sewa Trooper Banyuwangi ingin berkoordinasi terkait jadwal trip armada.`;
          const waUrl = `https://wa.me/62${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white border border-[#e4ebef] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header Card: Avatar, Nama, Peran & Status */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#f0f4f6]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#263b46] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[#263b46] text-base truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-[#327691] font-semibold truncate">{member.role}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      member.status === "Siap Bertugas"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : member.status === "Sedang Bertugas"
                        ? "bg-sky-50 text-sky-800 border border-sky-200"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        member.status === "Siap Bertugas"
                          ? "bg-emerald-500 animate-pulse"
                          : member.status === "Sedang Bertugas"
                          ? "bg-sky-500"
                          : "bg-neutral-400"
                      }`}
                    />
                    {member.status}
                  </span>
                </div>

                {/* Konten Utama: No. Telepon & Spesialisasi Rute */}
                <div className="mt-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#327691] shrink-0" />
                    <span className="font-semibold text-[#263b46]">{member.phone}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#327691] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-neutral-400 font-medium block text-[11px]">Rute Spesialisasi:</span>
                      <span className="text-[#263b46] font-medium leading-relaxed">{member.specialist}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Tombol WhatsApp Langsung & Edit Data */}
              <div className="mt-4 pt-3.5 border-t border-[#f0f4f6] flex flex-wrap items-center justify-between gap-2.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-2xs transition"
                >
                  <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Chat WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  className="text-xs font-bold text-[#327691] hover:text-[#263b46] hover:underline transition cursor-pointer flex items-center gap-1"
                >
                  <Edit3 size={13} />
                  <span>Edit Data →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog (Edit / Tambah Driver) */}
      {(editingDriver || isAddingNew) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#327691]/10 text-[#327691] flex items-center justify-center">
                  {isAddingNew ? <UserPlus size={18} /> : <Edit3 size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-[#263b46] text-lg">
                    {isAddingNew ? "Tambah Anggota Tim Driver" : "Edit Data Driver"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {isAddingNew ? "Masukkan data driver baru untuk operasional armada." : `Perbarui informasi ${editingDriver?.name}.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-[#263b46] mb-1.5">
                  Nama Lengkap Driver <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691] text-[#263b46]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#263b46] mb-1.5">
                    Peran / Jabatan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Senior Driver & Guide"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691] text-[#263b46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263b46] mb-1.5">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691] text-[#263b46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263b46] mb-1.5">
                  Rute Spesialisasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kawah Ijen Sunrise & Sukamade"
                  value={formData.specialist}
                  onChange={(e) => setFormData({ ...formData, specialist: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691] text-[#263b46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263b46] mb-1.5">
                  Status Bertugas
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as DriverMember["status"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691] text-[#263b46] bg-white cursor-pointer"
                >
                  <option value="Siap Bertugas">Siap Bertugas (Ready)</option>
                  <option value="Sedang Bertugas">Sedang Bertugas (On Duty)</option>
                  <option value="Libur">Libur / Istirahat</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                {!isAddingNew && editingDriver ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingDriver.id, editingDriver.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    {isAddingNew ? "Tambah Driver" : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

