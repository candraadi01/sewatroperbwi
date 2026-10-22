import { ScheduleCalendarManager } from "@/components/admin/ScheduleCalendarManager";

export const metadata = {
  title: "Jadwal & Ketersediaan Booking | Admin Panel Sewa Trooper BWI",
  description: "Kelola tanggal buka/tutup dan ketersediaan armada Trooper Banyuwangi.",
};

export default function AdminJadwalPage() {
  return <ScheduleCalendarManager portalType="admin" />;
}
