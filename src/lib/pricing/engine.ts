import { PricingQuote, QuoteBreakdownItem } from '@/types/database';
import { getProductBySlug, getPickupZoneById } from '@/lib/services/catalog';
import { SAMPLE_PRODUCTS } from '@/lib/services/products-data';

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

const PROMO_CODES: Record<string, { discountPercent?: number; discountFixed?: number; minAmount: number }> = {
  BANYUWANGI10: { discountPercent: 10, minAmount: 500000 },
  TROOPERASIK: { discountFixed: 50000, minAmount: 500000 },
};

/**
 * Server-side Pricing Engine.
 * Menghitung rincian harga secara deterministik dan aman (seluruh nilai integer Rupiah).
 */
export async function calculateQuote(params: QuoteRequestParams): Promise<PricingQuote> {
  const product = params.productId
    ? SAMPLE_PRODUCTS.find((p) => p.id === params.productId)
    : params.productSlug
    ? await getProductBySlug(params.productSlug)
    : null;

  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }

  const numUnits = Math.max(1, Math.min(10, params.numUnits || 1));
  const basePricePerUnit = Math.round(product.base_price || 0);

  if (basePricePerUnit <= 0) {
    throw new Error('Produk ini belum memiliki tarif resmi atau belum dibuka untuk pemesanan');
  }

  const subtotalUnits = basePricePerUnit * numUnits;
  const breakdown: QuoteBreakdownItem[] = [
    {
      label: `${product.name} (${numUnits} unit)`,
      amount: subtotalUnits,
      type: 'base',
    },
  ];

  // Pickup zone surcharge
  let pickupSurcharge = 0;
  let pickupZone = null;
  if (params.pickupZoneId) {
    pickupZone = await getPickupZoneById(params.pickupZoneId);
    if (pickupZone && pickupZone.surcharge > 0) {
      pickupSurcharge = pickupZone.surcharge * numUnits;
      breakdown.push({
        label: `Biaya Penjemputan (${pickupZone.name})`,
        amount: pickupSurcharge,
        type: 'surcharge',
      });
    }
  }

  // Promo discount
  let discountAmount = 0;
  if (params.promoCode) {
    const promo = PROMO_CODES[params.promoCode.toUpperCase().trim()];
    const grossAmount = subtotalUnits + pickupSurcharge;
    if (promo && grossAmount >= promo.minAmount) {
      if (promo.discountPercent) {
        discountAmount = Math.round((grossAmount * promo.discountPercent) / 100);
      } else if (promo.discountFixed) {
        discountAmount = Math.min(grossAmount, promo.discountFixed);
      }
      breakdown.push({
        label: `Diskon Promo (${params.promoCode.toUpperCase()})`,
        amount: -discountAmount,
        type: 'discount',
      });
    }
  }

  const totalAmount = Math.max(0, subtotalUnits + pickupSurcharge - discountAmount);

  // DP (Down Payment) default 30%, dibulatkan ke kelipatan ribuan terdekat
  const dpPercentage = 30;
  const rawDp = Math.round((totalAmount * dpPercentage) / 100);
  const dpAmount = Math.ceil(rawDp / 1000) * 1000;
  const remainingAmount = totalAmount - dpAmount;

  // Masa berlaku quote: 30 menit dari sekarang
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    quote_id: quoteId,
    product_id: product.id,
    product_name: product.name,
    service_date: params.serviceDate,
    start_time: params.startTime || '00:00',
    num_units: numUnits,
    num_passengers: params.numPassengers,
    pickup_zone: pickupZone,
    pickup_address: params.pickupAddress || '',
    base_price_per_unit: basePricePerUnit,
    subtotal_units: subtotalUnits,
    pickup_surcharge: pickupSurcharge,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    dp_percentage: dpPercentage,
    dp_amount: dpAmount,
    remaining_amount: remainingAmount,
    breakdown,
    is_sample_pricing: product.is_sample_data || !product.is_owner_approved,
    expires_at: expiresAt,
  };
}
