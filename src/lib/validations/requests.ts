import { z } from "zod";
export const idSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "ID tidak valid.",
  );
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      Number.isFinite(Date.parse(v + "T00:00:00Z")) &&
      new Date(v + "T00:00:00Z").toISOString().slice(0, 10) === v,
    "Tanggal tidak valid.",
  );
export const quoteRequestSchema = z
  .object({
    productId: idSchema.optional(),
    productSlug: z.string().max(200).optional(),
    serviceDate: dateSchema,
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .default("08:00"),
    numUnits: z.number().int().min(1).max(10),
    numPassengers: z.number().int().min(1).max(200),
    pickupZoneId: idSchema.optional(),
    pickupAddress: z.string().trim().max(500).default(""),
    promoCode: z.string().trim().max(50).default(""),
  })
  .refine((v) => v.productId || v.productSlug, "Pilih produk.");
export const createBookingSchema = z
  .object({
    productId: idSchema,
    serviceDate: dateSchema,
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .default("08:00"),
    numUnits: z.number().int().min(1).max(10),
    numPassengers: z.number().int().min(1).max(200),
    pickupZoneId: idSchema.optional(),
    pickupAddress: z.string().trim().max(500).default(""),
    promoCode: z.string().trim().max(50).default(""),
    contactName: z.string().trim().min(2).max(100),
    contactPhone: z
      .string()
      .trim()
      .regex(/^(?:\+62|62|0)8[0-9]{7,12}$/, "Nomor WhatsApp tidak valid."),
    contactEmail: z.email().max(255),
    paymentChoice: z.enum(["dp", "full"]),
    termsAccepted: z.literal(true),
    notes: z.string().trim().max(1000).default(""),
    idempotencyKey: z.uuid(),
    expectedTotal: z.number().int().positive(),
  })
  .strict();
export const notificationSchema = z.object({
  order_id: z.string().min(1).max(100),
  status_code: z.string().regex(/^\d{3}$/),
  gross_amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  signature_key: z.string().regex(/^[a-f0-9]{128}$/i),
  transaction_status: z.enum([
    "capture",
    "settlement",
    "pending",
    "deny",
    "cancel",
    "expire",
    "failure",
    "refund",
    "partial_refund",
    "authorize",
  ]),
  fraud_status: z.string().max(30).optional(),
  transaction_id: z.string().max(100).optional(),
  currency: z.literal("IDR").optional(),
  merchant_id: z.string().max(100).optional(),
});
