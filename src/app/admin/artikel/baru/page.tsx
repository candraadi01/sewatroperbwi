import { requireAdmin } from "@/lib/auth/helpers";
import ArtikelEditClient from "../ArtikelEditClient";

export const metadata = {
  title: "Buat Artikel Baru | Admin Sewa Trooper BWI",
};

export default async function BuatArtikelPage() {
  await requireAdmin();
  return <ArtikelEditClient />;
}

