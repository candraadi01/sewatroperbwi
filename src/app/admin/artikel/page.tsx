import { ResourcePage } from "@/components/admin/ResourcePage";

export const metadata = {
  title: "Kelola Artikel Wisata | Admin Sewa Trooper BWI",
  description: "Kelola konten artikel wisata dan tips traveling Banyuwangi.",
};

export default async function AdminArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  return (
    <ResourcePage
      name="artikel"
      page={Math.min(10000, Math.max(1, Math.floor(Number(query.page)) || 1))}
    />
  );
}
