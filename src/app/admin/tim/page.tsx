import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import { Users, PlusCircle, CheckCircle2, Phone, Award, Shield, Wrench } from "lucide-react";

export const metadata = {
  title: "Kelola Tim & Driver | Admin Sewa Trooper BWI",
  description: "Manajemen tim driver pemandu wisata dan kru operasional Trooper.",
};

const driverTeam = [
  {
    id: "drv-1",
    name: "Pak Budi Santoso",
    role: "Senior Driver & Guide",
    phone: "081234567891",
    experience: "12 Tahun Pengalaman Offroad",
    specialist: "Kawah Ijen Sunrise & Meru Betiri Sukamade",
    status: "Siap Bertugas",
    rating: "4.9 / 5.0",
    avatar: "BS",
  },
  {
    id: "drv-2",
    name: "Mas Ilham Prasetyo",
    role: "Driver & Fotografer Tour",
    phone: "081398765432",
    experience: "6 Tahun Pengalaman",
    specialist: "Safari Baluran Africa Van Java & De Djawatan",
    status: "Sedang Bertugas",
    rating: "5.0 / 5.0",
    avatar: "IP",
  },
  {
    id: "drv-3",
    name: "Pak Slamet Hidayat",
    role: "Driver Spesialis Sungai Sukamade",
    phone: "085234567899",
    experience: "15 Tahun Jalur Hutan",
    specialist: "Ekspedisi Rimba & Konservasi Penyu Sukamade",
    status: "Siap Bertugas",
    rating: "4.9 / 5.0",
    avatar: "SH",
  },
  {
    id: "drv-4",
    name: "Mas Danang Wijaya",
    role: "Driver Trooper City Tour",
    phone: "082145678901",
    experience: "5 Tahun Wisata Kota",
    specialist: "Kuliner Osing & Destinasi Pantai Boom Banyuwangi",
    status: "Libur",
    rating: "4.8 / 5.0",
    avatar: "DW",
  },
];

export default async function AdminTimPage() {
  await requireAdmin();

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Operasional Lapangan
          </span>
          <h1 className="heading-1 mt-1">Kelola Tim Driver & Kru</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Daftar pengemudi berpengalaman, pemandu lokal, dan kru armada Jeep Trooper.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition shrink-0 cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>+ Tambah Anggota Tim</span>
        </button>
      </div>

      {/* Grid Tim Driver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {driverTeam.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-white border border-[#e4ebef] shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#f0f4f6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#263b46] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#263b46] text-base">
                      {member.name}
                    </h3>
                    <p className="text-xs text-[#327691] font-semibold">{member.role}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    member.status === "Siap Bertugas"
                      ? "bg-emerald-100 text-emerald-800"
                      : member.status === "Sedang Bertugas"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="mt-3.5 space-y-2 text-xs text-[#53636d]">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#327691] shrink-0" />
                  <span className="font-medium">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-[#327691] shrink-0" />
                  <span>{member.experience} · Rating {member.rating}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-neutral-100 text-[11px]">
                  <strong className="text-[#263b46] block mb-0.5">Spesialisasi Rute:</strong>
                  <span>{member.specialist}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f4f6] flex items-center justify-between text-xs">
              <span className="text-neutral-400">ID: {member.id}</span>
              <button
                type="button"
                className="text-[#327691] font-bold hover:underline"
              >
                Edit Data Driver →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
