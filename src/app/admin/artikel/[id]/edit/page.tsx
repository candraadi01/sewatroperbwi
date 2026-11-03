import { requireAdmin } from "@/lib/auth/helpers";
import ArtikelEditClient from "../../ArtikelEditClient";

export const metadata = {
  title: "Edit Artikel | Admin Sewa Trooper BWI",
};

export default async function EditArtikelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  return <ArtikelEditClient articleId={id} />;
}
