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
  destination?: string;
  duration?: string;
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
    images: row.cover_image_url ? [row.cover_image_url] : row.images ?? [],
    duration_minutes: row.duration_minutes ?? 0,
    badge_label: row.badge_label ?? row.name,
    destinations: row.destinations ?? [row.route_name || row.name],
    gallery_images: row.gallery_images ?? (row.images?.slice(0, 3) || []),
    duration_text: row.duration_text ?? `${Math.round((row.duration_minutes ?? 0) / 60)} Jam`,
    is_best_seller: row.is_best_seller ?? false,
    is_featured: row.is_featured ?? false,
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
      const cats = await getCategories();
      let c = cats.find((c) => c.slug === options.categorySlug);
      if (!c) {
        if (
          options.categorySlug === "jeep-experience" ||
          options.categorySlug === "jeep-wisata"
        ) {
          c = cats.find(
            (c) =>
              c.slug === "paket-rute" ||
              c.slug === "jeep-experience" ||
              c.slug === "jeep-wisata",
          );
        } else if (options.categorySlug === "paket-rute") {
          c = cats.find(
            (c) => c.slug === "jeep-experience" || c.slug === "paket-rute",
          );
        }
      }
      items = c ? items.filter((p) => p.category_id === c.id) : [];
    }
    if (options?.destination) {
      const d = options.destination.toLowerCase().trim().replace(/-/g, " ");
      items = items.filter((p) => {
        const fullText = [
          p.name,
          p.route_name,
          p.description,
          p.short_description,
          ...(p.destinations || []),
        ]
          .join(" ")
          .toLowerCase();

        if (d.includes("ijen")) return fullText.includes("ijen");
        if (d.includes("baluran")) return fullText.includes("baluran");
        if (d.includes("djawatan")) return fullText.includes("djawatan");
        if (d.includes("sukamade")) return fullText.includes("sukamade");
        if (d.includes("wurung")) return fullText.includes("wurung");
        if (d.includes("purwo")) return fullText.includes("purwo");
        if (d.includes("hijau")) return fullText.includes("hijau");
        return fullText.includes(d);
      });
    }
    if (options?.duration) {
      const dur = options.duration.toLowerCase();
      if (dur === "half-day" || dur === "half_day") {
        items = items.filter((p) => (p.duration_minutes ?? 0) <= 360);
      } else if (dur === "1-hari" || dur === "full-day" || dur === "1_hari") {
        items = items.filter(
          (p) => (p.duration_minutes ?? 0) > 360 && (p.duration_minutes ?? 0) <= 840,
        );
      } else if (
        dur === "2-day-1-night" ||
        dur === "2d1n" ||
        dur === "multi-day"
      ) {
        items = items.filter((p) => (p.duration_minutes ?? 0) > 840);
      }
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
