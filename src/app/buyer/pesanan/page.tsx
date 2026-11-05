import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { BuyerPesananClient } from "./BuyerPesananClient";

export const metadata = {
  title: "Pesanan Saya | Portal Pelanggan Sewa Trooper BWI",
  description: "Daftar histori dan status pemesanan sewa Jeep Trooper Banyuwangi Anda.",
};

export default async function BuyerPesananPage() {
  const user = await requireBuyer("/buyer/pesanan");
  const orders = await getOwnBookings();

  return (
    <BuyerPortalLayout user={user} activeMenu="pesanan">
      <BuyerPesananClient orders={orders} />
    </BuyerPortalLayout>
  );
}
