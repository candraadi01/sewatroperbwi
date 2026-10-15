import { cache } from "react";
import type { Product, ProductCategory, PickupZone } from "@/types/database";
import {
  SAMPLE_PRODUCTS,
  SAMPLE_CATEGORIES,
  SAMPLE_PICKUP_ZONES,
} from "./products-data";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export interface CatalogFilterOptions {
  categorySlug?: string;
  serviceType?: string;
  search?: string;
  sort?:
    "popular" | "price_asc" | "price_desc" | "duration_asc" | "duration_desc";
}
export interface ProductRow extends Omit<Product, "status"> {
  status: string;
  cover_image_url?: string;
  dp_override_percentage?: number | null;
  pricing_rules?: {
    base_price: number;
    is_active: boolean;
    priority: number;
    date_start: string | null;
    date_end: string | null;
    applicable_days: number[] | null;
    price_unit: string;
  }[];
}
export function mapProduct(row: ProductRow): Product {
  const price = row.pricing_rules
    ?.filter(
      (p) => p.is_active && !p.date_start && !p.date_end && !p.applicable_days,
    )
    .sort((a, b) => b.priority - a.priority)[0];
  return {
    ...row,
    status:
      row.status === "active" ? "published" : (row.status as Product["status"]),
    base_price: price?.base_price ?? row.base_price ?? 0,
    images: row.cover_image_url ? [row.cover_image_url] : [],
    duration_minutes: row.duration_minutes ?? 0,
  };
}
export const getProducts = cache(
  async (options?: CatalogFilterOptions): Promise<Product[]> => {
    let items: Product[];
    if (!isSupabaseConfigured())
      items = SAMPLE_PRODUCTS.filter((p) => p.status === "published");
    else {
      let query = createPublicClient()
        .from("products")
        .select(
          "*,pricing_rules(base_price,is_active,priority,date_start,date_end,applicable_days,price_unit)",
        )
        .eq("status", "active");
      if (options?.serviceType)
        query = query.eq("service_type", options.serviceType);
      const { data, error } = await query.order("sort_order").limit(200);
      if (error) throw new Error("Katalog belum dapat dimuat dari database.");
      items = (data as ProductRow[]).map(mapProduct);
    }
    if (options?.serviceType)
      items = items.filter((p) => p.service_type === options.serviceType);
    if (options?.categorySlug) {
      const c = (await getCategories()).find(
        (c) => c.slug === options.categorySlug,
      );
      items = c ? items.filter((p) => p.category_id === c.id) : [];
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      items = items.filter((p) =>
        `${p.name} ${p.short_description} ${p.route_name ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }
    return [...items].sort((a, b) =>
      options?.sort === "price_asc"
        ? (a.base_price ?? Infinity) - (b.base_price ?? Infinity)
        : options?.sort === "price_desc"
          ? (b.base_price ?? 0) - (a.base_price ?? 0)
          : options?.sort === "duration_asc"
            ? a.duration_minutes - b.duration_minutes
            : options?.sort === "duration_desc"
              ? b.duration_minutes - a.duration_minutes
              : a.sort_order - b.sort_order,
    );
  },
);
export const getProductBySlug = cache(
  async (slug: string) =>
    (await getProducts()).find((p) => p.slug === slug) ?? null,
);
export const getProductById = cache(
  async (id: string) => (await getProducts()).find((p) => p.id === id) ?? null,
);
export const getCategories = cache(async (): Promise<ProductCategory[]> => {
  if (!isSupabaseConfigured()) return SAMPLE_CATEGORIES;
  const { data, error } = await createPublicClient()
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error("Kategori belum dapat dimuat.");
  return data ?? [];
});
export const getPickupZones = cache(async (): Promise<PickupZone[]> => {
  if (!isSupabaseConfigured()) return SAMPLE_PICKUP_ZONES;
  const { data, error } = await createPublicClient()
    .from("pickup_zones")
    .select("id,name,description,additional_cost,is_active")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error("Penjemputan belum dapat dimuat.");
  return (data ?? []).map((r) => ({ ...r, surcharge: r.additional_cost }));
});
export async function getPickupZoneById(id: string) {
  return (await getPickupZones()).find((z) => z.id === id) ?? null;
}
