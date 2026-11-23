import { requireAdmin } from "@/lib/auth/helpers";
import { AdminTimClient, type DriverMember } from "./AdminTimClient";

export const metadata = {
  title: "Kelola Tim Driver | Admin Sewa Trooper BWI",
  description: "Manajemen tim driver pemandu wisata dan kru operasional Trooper.",
};

const defaultDriverTeam: DriverMember[] = [
  {
    id: "drv-1",
    name: "Pak Budi Santoso",
    role: "Senior Driver & Guide",
    phone: "081234567891",
    specialist: "Kawah Ijen Sunrise & Meru Betiri Sukamade",
    status: "Siap Bertugas",
    avatar: "BS",
  },
  {
    id: "drv-2",
    name: "Mas Ilham Prasetyo",
    role: "Driver & Fotografer Tour",
    phone: "081398765432",
    specialist: "Safari Baluran Africa Van Java & De Djawatan",
    status: "Sedang Bertugas",
    avatar: "IP",
  },
  {
    id: "drv-3",
    name: "Pak Slamet Hidayat",
    role: "Driver Spesialis Sungai Sukamade",
    phone: "085234567899",
    specialist: "Ekspedisi Rimba & Konservasi Penyu Sukamade",
    status: "Siap Bertugas",
    avatar: "SH",
  },
  {
    id: "drv-4",
    name: "Mas Danang Wijaya",
    role: "Driver Trooper City Tour",
    phone: "082145678901",
    specialist: "Kuliner Osing & Destinasi Pantai Boom Banyuwangi",
    status: "Libur",
    avatar: "DW",
  },
];

export default async function AdminTimPage() {
  await requireAdmin();

  return <AdminTimClient initialDrivers={defaultDriverTeam} />;
}
