import { requireAdmin } from "@/lib/auth/helpers";
import ArtikelCMSClient from "./ArtikelCMSClient";

export const metadata = {
  title: "Article CMS | Admin Sewa Trooper BWI",
  description: "Tulis, jadwalkan, dan kelola artikel wisata Banyuwangi.",
};

export default async function AdminArtikelPage() {
  await requireAdmin();
  return <ArtikelCMSClient />;
}
