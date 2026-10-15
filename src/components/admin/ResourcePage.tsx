import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { resources } from "@/lib/admin/resources";
import { ResourceEditor } from "./ResourceEditor";
import { getSiteSettings } from "@/lib/services/settings";
export async function ResourcePage({
  name,
  page = 1,
}: {
  name: string;
  page?: number;
}) {
  await requireAdmin();
  const config = resources[name];
  if (!config) notFound();
  const db = await createClient();
  const offset = (Math.max(1, page) - 1) * 30;
  let rows: Record<string, unknown>[] = [],
    errorMessage = "",
    hasMore = false;
  if (name === "site")
    rows = [{ id: "site-settings", ...(await getSiteSettings()) }];
  else {
    let query = db
      .from(config.table)
      .select(
        config.columns ?? (name === "produk" ? "*,pricing_rules(*)" : "*"),
      )
      .order(config.order ?? "created_at", { ascending: false })
      .range(offset, offset + 30);
    if (name === "bisnis") query = query.eq("is_current", true);
    const { data, error } = await query;
    if (error)
      errorMessage =
        "Data belum dapat dimuat. Pastikan migrasi 001–005 sudah diterapkan dan akun memiliki role admin.";
    else {
      hasMore = (data?.length ?? 0) > 30;
      rows = (data ?? []).slice(0, 30) as unknown as Record<string, unknown>[];
      if (name === "produk")
        rows = rows.map((r) => {
          const prices = r.pricing_rules as {
            base_price: number;
            priority: number;
            date_start: string | null;
            date_end: string | null;
            is_active: boolean;
          }[];
          const price = prices
            .filter((p) => p.is_active && !p.date_start && !p.date_end)
            .sort((a, b) => b.priority - a.priority)[0];
          return { ...r, base_price: price?.base_price ?? 0 };
        });
    }
  }
  const sources = [
    ...new Set(config.fields.flatMap((f) => (f.source ? [f.source] : []))),
  ];
  const options: Record<string, { id: string; name: string }[]> = {};
  for (const table of sources) {
    const { data } = await db
      .from(table)
      .select("id,name")
      .order("name")
      .limit(200);
    options[table] = data ?? [];
  }
  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">PENGELOLAAN USAHA</p>
        <h1 className="heading-1 mt-3">{config.title}</h1>
        <p className="text-neutral-500 mt-3 max-w-2xl">{config.description}</p>
      </header>
      {errorMessage ? (
        <div className="notice-error" role="alert">
          {errorMessage}
        </div>
      ) : (
        <ResourceEditor
          key={name + page + JSON.stringify(rows)}
          resourceKey={name}
          config={config}
          rows={rows}
          options={options}
        />
      )}
      <nav className="flex justify-between text-sm">
        {page > 1 ? (
          <Link href={`?page=${page - 1}`}>Halaman sebelumnya</Link>
        ) : (
          <span />
        )}
        {hasMore && <Link href={`?page=${page + 1}`}>Halaman berikutnya</Link>}
      </nav>
    </div>
  );
}
