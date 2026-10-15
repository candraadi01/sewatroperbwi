import { ResourcePage } from "@/components/admin/ResourcePage";
export default async function AdminModule({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ module }, query] = await Promise.all([params, searchParams]);
  return (
    <ResourcePage
      name={module}
      page={Math.min(10000, Math.max(1, Math.floor(Number(query.page)) || 1))}
    />
  );
}
