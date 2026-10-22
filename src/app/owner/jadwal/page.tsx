import { ScheduleCalendarManager } from "@/components/admin/ScheduleCalendarManager";

export const metadata = {
  title: "Jadwal & Ketersediaan Booking | Portal Pemilik Sewa Trooper BWI",
  description: "Kelola tanggal buka/tutup dan kuota armada Jeep Trooper Banyuwangi.",
};

export default function OwnerJadwalPage() {
  return <ScheduleCalendarManager portalType="owner" />;
}
