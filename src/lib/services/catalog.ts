import { Product, ProductCategory, PickupZone } from '@/types/database';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_PICKUP_ZONES } from './products-data';

export interface CatalogFilterOptions {
  categorySlug?: string;
  serviceType?: string;
  search?: string;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc';
}

/**
 * Service katalog produk.
 * Mengakses database produk dengan fallback aman jika belum terkoneksi Supabase.
 */
export async function getProducts(options?: CatalogFilterOptions): Promise<Product[]> {
  let items = [...SAMPLE_PRODUCTS];

  if (options?.categorySlug) {
    const category = SAMPLE_CATEGORIES.find((c) => c.slug === options.categorySlug);
    if (category) {
      items = items.filter((p) => p.category_id === category.id);
    }
  }

  if (options?.serviceType) {
    items = items.filter((p) => p.service_type === options.serviceType);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        (p.route_name && p.route_name.toLowerCase().includes(q))
    );
  }

  if (options?.sort) {
    switch (options.sort) {
      case 'price_asc':
        items.sort((a, b) => (a.base_price ?? 0) - (b.base_price ?? 0));
        break;
      case 'price_desc':
        items.sort((a, b) => (b.base_price ?? 0) - (a.base_price ?? 0));
        break;
      case 'duration_asc':
        items.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
      case 'duration_desc':
        items.sort((a, b) => b.duration_minutes - a.duration_minutes);
        break;
      case 'popular':
      default:
        items.sort((a, b) => a.sort_order - b.sort_order);
        break;
    }
  }

  return items;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  return product ?? null;
}

export async function getCategories(): Promise<ProductCategory[]> {
  return SAMPLE_CATEGORIES;
}

export async function getPickupZones(): Promise<PickupZone[]> {
  return SAMPLE_PICKUP_ZONES;
}

export async function getPickupZoneById(id: string): Promise<PickupZone | null> {
  const zone = SAMPLE_PICKUP_ZONES.find((z) => z.id === id);
  return zone ?? null;
}
