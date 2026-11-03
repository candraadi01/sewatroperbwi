import { requireBuyer } from "@/lib/auth/helpers";
import { getProducts } from "@/lib/services/catalog";
import { BuyerPortalLayout } from "@/components/layout/BuyerPortalLayout";
import { BuyerCatalogClient } from "./BuyerCatalogClient";

export const metadata = {
  title: "Katalog Jeep Trooper | Sewa Trooper Banyuwangi",
  description:
    "Katalog lengkap armada sewa Jeep Trooper 4x4 dan pilihan paket tour petualangan Banyuwangi.",
};

export default async function BuyerCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireBuyer("/buyer/katalog");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const destinasi = typeof params.destinasi === "string" ? params.destinasi : "";

  const products = await getProducts({
    search: q,
    destination: destinasi,
  });

  return (
    <BuyerPortalLayout user={user} activeMenu="katalog">
      <BuyerCatalogClient
        initialProducts={products}
        initialQuery={q}
        initialDestination={destinasi}
      />
    </BuyerPortalLayout>
  );
}

