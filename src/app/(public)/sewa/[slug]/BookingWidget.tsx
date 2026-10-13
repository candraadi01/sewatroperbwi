'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  Truck,
  MapPin,
  Tag,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { Product, PickupZone, PricingQuote } from '@/types/database';

interface BookingWidgetProps {
  product: Product;
  pickupZones: PickupZone[];
}

export function BookingWidget({ product, pickupZones }: BookingWidgetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const today = new Date().toISOString().split('T')[0];
  const [serviceDate, setServiceDate] = useState(today);
  const [numUnits, setNumUnits] = useState(1);
  const [numPassengers, setNumPassengers] = useState(Math.min(4, product.passenger_capacity));
  const [pickupZoneId, setPickupZoneId] = useState(pickupZones[0]?.id || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Quote calculation state
  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Fetch quote whenever booking parameters change
  useEffect(() => {
    let active = true;

    async function fetchQuote() {
      if (!serviceDate) return;
      setLoadingQuote(true);
      setQuoteError(null);

      try {
        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            productSlug: product.slug,
            serviceDate,
            numUnits,
            numPassengers,
            pickupZoneId,
            pickupAddress,
            promoCode: promoCode.trim(),
          }),
        });

        const data = await res.json();
        if (active) {
          if (res.ok && data.success) {
            setQuote(data.data);
          } else {
            setQuoteError(data.error || 'Gagal memuat rincian tarif');
          }
        }
      } catch (err) {
        if (active) {
          setQuoteError('Terjadi gangguan jaringan');
        }
      } finally {
        if (active) {
          setLoadingQuote(false);
        }
      }
    }

    const timer = setTimeout(fetchQuote, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [product.id, product.slug, serviceDate, numUnits, numPassengers, pickupZoneId, pickupAddress, promoCode]);

  function handleContinueBooking() {
    if (!quote) return;

    // Simpan data booking ke sessionStorage untuk pemulihan setelah login / checkout
    sessionStorage.setItem('pending_booking_quote', JSON.stringify(quote));

    startTransition(() => {
      router.push(`/checkout?quote_id=${encodeURIComponent(quote.quote_id)}`);
    });
  }

  const isDraft = product.status === 'draft' && (!product.base_price || product.base_price <= 0);

  if (isDraft) {
    return (
      <Card className="p-6 bg-white border-amber-200">
        <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Status Layanan: Belum Dibuka</span>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Paket ini sedang dalam tahap review ketentuan dan persetujuan tarif oleh pemilik usaha.
          Belum dapat dipesan secara online.
        </p>
        <Button variant="outline" className="w-full" disabled>
          Pemesanan Ditutup Sementara
        </Button>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-6 sticky top-24">
      {/* Header Price */}
      <div className="pb-4 mb-5 border-b border-neutral-100 flex items-baseline justify-between">
        <div>
          <span className="text-xs text-neutral-500 block">Tarif per Jeep Trooper</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
              {formatIDR(product.base_price || 0)}
            </span>
            <span className="text-xs text-neutral-500">/ unit</span>
          </div>
        </div>
        {product.is_sample_data && (
          <Badge variant="warning" className="text-[11px] bg-amber-50 text-amber-800 border-amber-200">
            Harga Contoh
          </Badge>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 text-sm">
        {/* Tanggal Trip */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-600" />
            Tanggal Perjalanan
          </label>
          <input
            type="date"
            min={today}
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans"
          />
        </div>

        {/* Jumlah Unit & Jumlah Penumpang */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary-600" />
              Jumlah Jeep
            </label>
            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
              <button
                type="button"
                onClick={() => setNumUnits((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 transition font-bold"
              >
                -
              </button>
              <div className="flex-1 text-center font-semibold text-neutral-800 text-sm">
                {numUnits} Unit
              </div>
              <button
                type="button"
                onClick={() => setNumUnits((prev) => Math.min(5, prev + 1))}
                className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 transition font-bold"
              >
                +
              </button>
            </div>
            <span className="text-[10px] text-neutral-500 mt-0.5 block">
              Maks {numUnits * product.passenger_capacity} orang
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary-600" />
              Peserta
            </label>
            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
              <button
                type="button"
                onClick={() => setNumPassengers((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 transition font-bold"
              >
                -
              </button>
              <div className="flex-1 text-center font-semibold text-neutral-800 text-sm">
                {numPassengers} Orang
              </div>
              <button
                type="button"
                onClick={() =>
                  setNumPassengers((prev) =>
                    Math.min(numUnits * product.passenger_capacity, prev + 1)
                  )
                }
                className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 transition font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Zona Penjemputan */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            Area Penjemputan
          </label>
          <select
            value={pickupZoneId}
            onChange={(e) => setPickupZoneId(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
          >
            {pickupZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} {zone.surcharge > 0 ? `(+${formatIDR(zone.surcharge)})` : '(Gratis)'}
              </option>
            ))}
          </select>
        </div>

        {/* Kode Promo */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary-600" />
            Kode Promo (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: BANYUWANGI10"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-1.5 text-xs uppercase bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Rincian Harga Live */}
      <div className="mt-5 pt-4 border-t border-neutral-100 bg-sand-50/70 p-3.5 rounded-xl">
        <span className="text-xs font-bold text-neutral-800 block mb-2">Rincian Perhitungan:</span>

        {loadingQuote ? (
          <div className="py-4 text-center text-xs text-neutral-500 animate-pulse">
            Menghitung tarif resmi...
          </div>
        ) : quoteError ? (
          <div className="text-xs text-red-600 py-1">{quoteError}</div>
        ) : quote ? (
          <div className="space-y-1.5 text-xs text-neutral-600">
            {quote.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.label}</span>
                <span className={item.amount < 0 ? 'text-emerald-700 font-semibold' : 'font-medium'}>
                  {item.amount < 0 ? `- ${formatIDR(Math.abs(item.amount))}` : formatIDR(item.amount)}
                </span>
              </div>
            ))}

            <div className="pt-2 mt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-bold text-neutral-900">
              <span>Total Biaya</span>
              <span className="text-primary-800 text-base">{formatIDR(quote.total_amount)}</span>
            </div>

            <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 space-y-1">
              <div className="flex justify-between">
                <span>
                  Deposit / DP Wajib ({quote.dp_percentage}%):
                </span>
                <span className="font-semibold text-amber-900">{formatIDR(quote.dp_amount)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Sisa Pelunasan (saat trip):</span>
                <span>{formatIDR(quote.remaining_amount)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Button */}
      <div className="mt-5">
        <Button
          size="lg"
          onClick={handleContinueBooking}
          disabled={!quote || loadingQuote || isPending}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold shadow-sm gap-2"
        >
          {isPending ? 'Memproses...' : 'Lanjut ke Pemesanan'}
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-[11px] text-neutral-500 text-center mt-2">
          🔒 Pembayaran DP aman via Midtrans Snap (Sandbox). Tidak ada potongan tersembunyi.
        </p>
      </div>
    </div>
  );
}
