import { requireBuyer } from "@/lib/auth/helpers";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { BuyerProfileClient } from "./BuyerProfileClient";

export const metadata = {
  title: "Profil Akun | Portal Pelanggan Sewa Trooper BWI",
  description: "Kelola profil dan informasi kontak akun Sewa Trooper Banyuwangi.",
};

export default async function BuyerProfilPage() {
  const user = await requireBuyer("/buyer/profil");

  return (
    <BuyerPortalLayout user={user} activeMenu="profil">
      <BuyerProfileClient user={user} />
    </BuyerPortalLayout>
  );
}
