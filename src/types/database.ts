/**
 * Database and Domain Types untuk Sewa Trooper Banyuwangi
 */

export type ServiceType = "paket_rute" | "harian_sopir" | "harian_lepas_kunci";
export type ProductStatus = "draft" | "published" | "inactive" | "archived";
export type PriceUnit = "per_vehicle" | "per_person";
export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "vehicle_assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded";
export type PaymentStatus =
  "unpaid" | "dp_paid" | "settlement" | "expire" | "cancel" | "refund";
export type UserRole = "buyer" | "admin";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  service_type: ServiceType;
  status: ProductStatus;
  passenger_capacity: number;
  driver_included: boolean;
  duration_minutes: number;
  route_name?: string;
  start_point?: string;
  end_point?: string;
  included_facilities: string[];
  excluded_facilities: string[];
  terms_version: string;
  terms_content?: string;
  min_booking_hours: number;
  overtime_rate_per_hour: number;
  is_sample_data: boolean;
  is_owner_approved: boolean;
  sort_order: number;
  // Computed / joined fields
  base_price?: number;
  images?: string[];
  dp_override_percentage?: number | null;
  default_start_time?: string;
}

export interface PricingRule {
  id: string;
  product_id: string;
  name: string;
  base_price: number;
  price_unit: PriceUnit;
  date_start?: string | null;
  date_end?: string | null;
  applicable_days?: number[] | null;
  priority: number;
  is_active: boolean;
  is_sample_data: boolean;
}

export interface PickupZone {
  id: string;
  name: string;
  description?: string;
  surcharge: number;
  is_active: boolean;
}

export interface QuoteBreakdownItem {
  label: string;
  amount: number;
  type: "base" | "surcharge" | "discount" | "extra";
}

export interface PricingQuote {
  promo_id?: string;
  promo_code?: string;
  quote_id: string;
  product_id: string;
  product_name: string;
  service_date: string;
  start_time?: string;
  num_units: number;
  num_passengers: number;
  pickup_zone?: PickupZone | null;
  pickup_address?: string;
  base_price_per_unit: number;
  subtotal_units: number;
  pickup_surcharge: number;
  discount_amount: number;
  total_amount: number;
  dp_percentage: number; // e.g. 30
  dp_amount: number; // integer IDR
  remaining_amount: number; // total_amount - dp_amount
  breakdown: QuoteBreakdownItem[];
  is_sample_pricing: boolean;
  expires_at: string; // ISO 8601
}
