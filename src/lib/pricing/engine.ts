import type { PricingQuote, QuoteBreakdownItem } from "@/types/database";
import {
  getProductBySlug,
  getProductById,
  getPickupZoneById,
} from "@/lib/services/catalog";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBusinessSettings } from "@/lib/services/business";
import { quoteRequestSchema } from "@/lib/validations/requests";
import { calculateAmounts } from "./calculation";
export interface QuoteRequestParams {
  productId?: string;
  productSlug?: string;
  serviceDate: string;
  startTime?: string;
  numUnits: number;
  numPassengers: number;
  pickupZoneId?: string;
  pickupAddress?: string;
  promoCode?: string;
}
export async function calculateQuote(
  input: QuoteRequestParams,
): Promise<PricingQuote> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const p = parsed.data;
  const product = p.productId
    ? await getProductById(p.productId)
    : await getProductBySlug(p.productSlug!);
  if (!product || product.status !== "published")
    throw new Error("Produk tidak tersedia.");
  const departure = Date.parse(`${p.serviceDate}T${p.startTime}:00+07:00`);
  if (departure < Date.now() + product.min_booking_hours * 3600000)
    throw new Error(
      `Pilih keberangkatan minimal ${product.min_booking_hours} jam dari sekarang.`,
    );
  if (departure > Date.now() + 366 * 86400000)
    throw new Error("Pilih tanggal dalam satu tahun ke depan.");
  if (p.numPassengers > p.numUnits * product.passenger_capacity)
    throw new Error("Jumlah penumpang melebihi kapasitas kendaraan.");
  const [business, pickup] = await Promise.all([
    getBusinessSettings(),
    p.pickupZoneId ? getPickupZoneById(p.pickupZoneId) : Promise.resolve(null),
  ]);
  if (p.pickupZoneId && !pickup)
    throw new Error("Area penjemputan tidak tersedia.");
  let base = product.base_price ?? 0,
    discount = 0,
    promoId: string | undefined;
  let sample = product.is_sample_data || !product.is_owner_approved;
  if (isSupabaseConfigured()) {
    const db = createPublicClient();
    const [prices, blackouts] = await Promise.all([
      db
        .from("pricing_rules")
        .select("*")
        .eq("product_id", product.id)
        .eq("is_active", true)
        .order("priority", { ascending: false }),
      db
        .from("blackout_dates")
        .select("id,product_id")
        .eq("date", p.serviceDate),
    ]);
    if (prices.error || blackouts.error)
      throw new Error("Jadwal atau harga belum dapat diverifikasi.");
    if (
      blackouts.data?.some((b) => !b.product_id || b.product_id === product.id)
    )
      throw new Error("Pemesanan ditutup pada tanggal ini.");
    const weekday = new Date(p.serviceDate + "T00:00:00Z").getUTCDay();
    const rule = prices.data?.find(
      (r) =>
        (!r.date_start || r.date_start <= p.serviceDate) &&
        (!r.date_end || r.date_end >= p.serviceDate) &&
        (!r.applicable_days || r.applicable_days.includes(weekday)),
    );
    if (!rule || rule.price_unit !== "per_vehicle")
      throw new Error("Tarif kendaraan belum ditetapkan.");
    base = rule.base_price;
    sample = sample || rule.is_sample_data;
    if (p.promoCode) {
      const { data: promo, error } = await db
        .from("promos")
        .select("*")
        .eq("code", p.promoCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      const gross = base * p.numUnits + (pickup?.surcharge ?? 0) * p.numUnits;
      if (
        error ||
        !promo ||
        Date.parse(promo.valid_from) > Date.now() ||
        Date.parse(promo.valid_until) < Date.now() ||
        gross < promo.min_order_amount ||
        (promo.total_quota !== null && promo.used_count >= promo.total_quota) ||
        (promo.applicable_products?.length &&
          !promo.applicable_products.includes(product.id))
      )
        throw new Error("Kode promo tidak berlaku untuk pemesanan ini.");
      discount =
        promo.type === "percent"
          ? Math.floor((gross * promo.value) / 10000)
          : promo.value;
      if (promo.max_discount !== null)
        discount = Math.min(discount, promo.max_discount);
      promoId = promo.id;
    }
  } else if (p.promoCode)
    throw new Error("Promo tersedia setelah database dikonfigurasi.");
  const dpBps =
    product.dp_override_percentage ?? business.default_dp_percentage;
  const amounts = calculateAmounts(
    base,
    p.numUnits,
    pickup?.surcharge ?? 0,
    discount,
    dpBps,
    business.dp_mode === "nominal" && product.dp_override_percentage == null
      ? business.default_dp_nominal *
          (business.dp_basis === "per_unit" ? p.numUnits : 1)
      : undefined,
  );
  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${product.name} (${p.numUnits} unit)`,
      amount: amounts.subtotal,
      type: "base",
    },
  ];
  if (amounts.pickup)
    breakdown.push({
      label: `Penjemputan ${pickup?.name}`,
      amount: amounts.pickup,
      type: "surcharge",
    });
  if (discount)
    breakdown.push({
      label: `Promo ${p.promoCode.toUpperCase()}`,
      amount: -Math.min(discount, amounts.subtotal + amounts.pickup),
      type: "discount",
    });
  return {
    quote_id: crypto.randomUUID(),
    product_id: product.id,
    product_name: product.name,
    service_date: p.serviceDate,
    start_time: p.startTime,
    num_units: p.numUnits,
    num_passengers: p.numPassengers,
    pickup_zone: pickup,
    pickup_address: p.pickupAddress,
    base_price_per_unit: base,
    subtotal_units: amounts.subtotal,
    pickup_surcharge: amounts.pickup,
    discount_amount: Math.min(discount, amounts.subtotal + amounts.pickup),
    total_amount: amounts.total,
    dp_percentage: dpBps / 100,
    dp_amount: amounts.dp,
    remaining_amount: amounts.remaining,
    breakdown,
    is_sample_pricing: sample,
    expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
    promo_id: promoId,
    promo_code: p.promoCode.toUpperCase(),
  };
}
