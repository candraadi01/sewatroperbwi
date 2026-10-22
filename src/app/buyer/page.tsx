import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { BuyerDashboardClient } from "./BuyerDashboardClient";

export const metadata = {
  title: "Beranda Saya | Sewa Trooper Banyuwangi",
  description: "Dashboard akun pelanggan pemesan sewa Jeep Trooper 4x4 Banyuwangi.",
};

export default async function BuyerDashboardPage() {
  const user = await requireBuyer("/buyer");
  const orders = await getOwnBookings();

  return <BuyerDashboardClient user={user} orders={orders} />;
}
