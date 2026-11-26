import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { getProducts } from "@/lib/services/catalog";
import { BuyerDashboardClient } from "./BuyerDashboardClient";

export const metadata = {
  title: "Beranda Saya | Sewa Trooper Banyuwangi",
  description: "Dashboard akun pelanggan pemesan sewa Jeep Trooper 4x4 Banyuwangi.",
};

export default async function BuyerDashboardPage() {
  const user = await requireBuyer("/buyer");
  const [orders, products] = await Promise.all([
    getOwnBookings(),
    getProducts(),
  ]);

  return (
    <BuyerDashboardClient
      user={user}
      orders={orders}
      recommendedProducts={products.slice(0, 4)}
    />
  );
}
