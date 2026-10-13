import { z } from 'zod';

/**
 * Shared Zod schemas — digunakan client DAN server.
 * Validasi server TETAP wajib — schema ini juga dipakai di client
 * untuk feedback form yang responsif.
 */

// ============================================================
// AUTH
// ============================================================

export const emailSchema = z
  .string()
  .email('Alamat email tidak valid')
  .max(255, 'Email terlalu panjang');

// ============================================================
// PROFILE
// ============================================================

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .trim(),
  phone: z
    .string()
    .max(20, 'Nomor telepon terlalu panjang')
    .regex(/^(\+?[0-9\s-]*)?$/, 'Format nomor telepon tidak valid')
    .optional()
    .default(''),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ============================================================
// BOOKING
// ============================================================

export const bookingInputSchema = z.object({
  product_id: z.string().uuid('ID produk tidak valid'),
  service_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format waktu harus HH:MM')
    .optional(),
  num_units: z
    .number()
    .int('Jumlah unit harus bilangan bulat')
    .min(1, 'Minimal 1 unit')
    .max(10, 'Maksimal 10 unit'),
  num_passengers: z
    .number()
    .int('Jumlah penumpang harus bilangan bulat')
    .min(1, 'Minimal 1 penumpang')
    .max(60, 'Jumlah penumpang tidak valid'),
  pickup_zone_id: z.string().uuid('ID zona penjemputan tidak valid').optional(),
  pickup_address: z.string().max(500, 'Alamat terlalu panjang').optional().default(''),
  selected_extras: z.array(z.string().uuid()).optional().default([]),
  promo_code: z.string().max(50).optional().default(''),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional().default(''),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

// ============================================================
// CHECKOUT
// ============================================================

export const checkoutSchema = z.object({
  quote_id: z.string().uuid('Quote tidak valid'),
  contact_name: z
    .string()
    .min(2, 'Nama kontak minimal 2 karakter')
    .max(100, 'Nama terlalu panjang')
    .trim(),
  contact_phone: z
    .string()
    .min(8, 'Nomor telepon minimal 8 digit')
    .max(20, 'Nomor telepon terlalu panjang')
    .regex(/^(\+?62|0)[0-9\s-]{7,15}$/, 'Format nomor telepon Indonesia tidak valid'),
  contact_email: emailSchema,
  payment_choice: z.enum(['dp', 'full'] as const, {
    message: 'Pilih DP atau Lunas',
  }),
  terms_accepted: z.literal(true, {
    message: 'Anda harus menyetujui syarat dan ketentuan',
  }),
  notes: z.string().max(1000).optional().default(''),
  idempotency_key: z.string().uuid('Idempotency key tidak valid'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ============================================================
// PROMO
// ============================================================

export const promoCheckSchema = z.object({
  code: z
    .string()
    .min(1, 'Masukkan kode promo')
    .max(50, 'Kode promo terlalu panjang')
    .trim()
    .toUpperCase(),
  product_id: z.string().uuid().optional(),
  order_amount: z.number().int().min(0).optional(),
});

export type PromoCheckInput = z.infer<typeof promoCheckSchema>;

// ============================================================
// CHANGE REQUEST
// ============================================================

export const changeRequestSchema = z.object({
  booking_id: z.string().uuid('ID pesanan tidak valid'),
  request_type: z.enum(['reschedule', 'cancel', 'modify'] as const, {
    message: 'Jenis permintaan tidak valid',
  }),
  reason: z
    .string()
    .min(10, 'Alasan minimal 10 karakter')
    .max(1000, 'Alasan terlalu panjang'),
  requested_changes: z.record(z.string(), z.unknown()).optional().default({}),
});

export type ChangeRequestInput = z.infer<typeof changeRequestSchema>;

// ============================================================
// ADMIN — Product
// ============================================================

export const productFormSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(200),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  category_id: z.string().uuid('Pilih kategori'),
  service_type: z.enum(['paket_rute', 'harian_sopir', 'harian_lepas_kunci']),
  description: z.string().max(5000).optional().default(''),
  short_description: z.string().max(300).optional().default(''),
  passenger_capacity: z.number().int().min(1).max(20),
  driver_included: z.boolean(),
  duration_minutes: z.number().int().min(1).optional(),
  route_name: z.string().max(200).optional().default(''),
  start_point: z.string().max(500).optional().default(''),
  end_point: z.string().max(500).optional().default(''),
  included_facilities: z.array(z.string()).optional().default([]),
  excluded_facilities: z.array(z.string()).optional().default([]),
  terms_content: z.string().max(10000).optional().default(''),
  min_booking_hours: z.number().int().min(0).optional().default(24),
  overtime_rate_per_hour: z.number().int().min(0).optional().default(0),
  meta_title: z.string().max(200).optional().default(''),
  meta_description: z.string().max(500).optional().default(''),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

// ============================================================
// ADMIN — Pricing
// ============================================================

export const pricingRuleSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  base_price: z.number().int().min(0, 'Harga tidak boleh negatif'),
  price_unit: z.enum(['per_vehicle', 'per_person']),
  date_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  date_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  applicable_days: z.array(z.number().int().min(0).max(6)).optional().nullable(),
  priority: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type PricingRuleInput = z.infer<typeof pricingRuleSchema>;

// ============================================================
// MONEY HELPERS
// ============================================================

/**
 * Validasi integer rupiah — tidak boleh floating-point.
 */
export const rupiahSchema = z
  .number()
  .int('Nilai harus bilangan bulat (tanpa desimal)')
  .min(0, 'Nilai tidak boleh negatif');

/**
 * Basis points (100 = 1%, 3000 = 30%).
 */
export const basisPointsSchema = z
  .number()
  .int('Nilai harus bilangan bulat')
  .min(0, 'Tidak boleh negatif')
  .max(10000, 'Maksimal 100%');
