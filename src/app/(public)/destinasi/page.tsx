import { getDestinations } from "@/lib/services/destinations";
import { DestinasiClient } from "./DestinasiClient";

export const metadata = {
  title: "Destinasi Wisata Banyuwangi | Sewa Jeep Trooper BWI",
  description:
    "Jelajahi destinasi terbaik Banyuwangi: Kawah Ijen, Baluran, Sukamade, De Djawatan, dan Teluk Hijau dengan armada 4x4 terawat.",
};

export const revalidate = 0; // Pastikan data real-time langsung terambil

export default async function DestinasiPage() {
  const destinations = await getDestinations();
  return <DestinasiClient destinations={destinations} />;
}
