'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Calendar,
  Truck,
  Users,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { PricingQuote } from '@/types/database';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteIdParam = searchParams.get('quote_id');

  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<'dp' | 'full'>('dp');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notes, setNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore quote from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pending_booking_quote');
      if (stored) {
        const parsed = JSON.parse(stored) as PricingQuote;
        if (!quoteIdParam || parsed.quote_id === quoteIdParam) {
          setQuote(parsed);
          if (parsed.pickup_address) {
            setPickupAddress(parsed.pickup_address);
          }
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data quote', e);
    } finally {
      setLoading(false);
    }
  }, [quoteIdParam]);

  const amountToPay = quote
    ? paymentChoice === 'dp'
      ? quote.dp_amount
      : quote.total_amount
    : 0;

  const remainingAmount = quote ? quote.total_amount - amountToPay : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quote) return;

    if (!termsAccepted) {
      setErrorMessage('Anda harus mencentang persetujuan syarat dan ketentuan.');
      return;
    }

    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      setErrorMessage('Lengkapi nama, nomor telepon/WhatsApp, dan alamat email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: quote.product_id,
          serviceDate: quote.service_date,
          startTime: quote.start_time,
          numUnits: quote.num_units,
          numPassengers: quote.num_passengers,
          pickupZoneId: quote.pickup_zone?.id,
          pickupAddress: pickupAddress || quote.pickup_address,
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          paymentChoice,
          termsAccepted: true,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan');
      }

      const { bookingId, redirectUrl, isSimulated } = data.data;

      // Bersihkan session quote
      sessionStorage.removeItem('pending_booking_quote');

      // Arahkan ke halaman status pesanan / pembayaran Midtrans
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(`/pesanan/${bookingId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi gangguan saat memproses transaksi';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-sand-50 py-16">
        <div className="container-custom max-w-lg mx-auto text-center bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Sesi Pemesanan Tidak Ditemukan
          </h1>
          <p className="text-neutral-600 text-sm mb-6">
            Rincian penawaran harga Anda mungkin telah kedaluwarsa atau belum dipilih. Silakan kembali ke katalog untuk memilih paket rute.
          </p>
          <Link href="/sewa">
            <Button className="w-full bg-primary-700 hover:bg-primary-800 text-white">
              Kembali ke Katalog Sewa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-8 md:py-12">
      <div className="container-custom max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-700 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              Konfirmasi Pemesanan & Pembayaran
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Lengkapi data kontak pemesan dan pilih metode pembayaran deposit (DP).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white px-3.5 py-2 rounded-xl border border-neutral-200 shadow-xs self-start">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Koneksi Aman Midtrans Sandbox</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Kontak & Pembayaran */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Pemesan */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs">
                <h2 className="text-xl font-heading font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  Data Kontak Pemesan
                </h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Pratama"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Nomor WhatsApp / HP *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        Driver akan menghubungi nomor ini saat penjemputan.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Alamat Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        E-tiket dan invoice akan dikirim ke email ini.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Alamat / Patokan Penjemputan Spesifik
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nama Hotel, Nomor Kamar, atau patokan lokasi stasiun..."
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: bawa lansia / minta jemput tepat waktu"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Pilihan Pembayaran */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs">
                <h2 className="text-xl font-heading font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  Opsi Pembayaran
                </h2>

                <div className="space-y-3">
                  <label
                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentChoice === 'dp'
                        ? 'border-primary-600 bg-primary-50/30'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        value="dp"
                        checked={paymentChoice === 'dp'}
                        onChange={() => setPaymentChoice('dp')}
                        className="mt-1 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">
                            Bayar Deposit (DP {quote.dp_percentage}%)
                          </span>
                          <span className="font-bold text-primary-700">
                            {formatIDR(quote.dp_amount)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          Direkomendasikan. Kunci armada sekarang, sisa pelunasan ({formatIDR(quote.remaining_amount)}) dibayarkan saat hari H trip.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentChoice === 'full'
                        ? 'border-primary-600 bg-primary-50/30'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        value="full"
                        checked={paymentChoice === 'full'}
                        onChange={() => setPaymentChoice('full')}
                        className="mt-1 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">Bayar Lunas (100%)</span>
                          <span className="font-bold text-neutral-900">
                            {formatIDR(quote.total_amount)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          Praktis tanpa perlu transaksi tunai tambahan saat hari keberangkatan.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Persetujuan Syarat */}
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-xs text-neutral-600 leading-relaxed">
                      Saya telah membaca dan menyetujui Ketentuan Layanan Sewa Trooper Banyuwangi,
                      serta memahami bahwa jadwal penjemputan bersifat tetap sesuai kesepakatan.
                    </span>
                  </label>
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !termsAccepted}
                    className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold shadow-md gap-2"
                  >
                    {isSubmitting ? 'Menyiapkan Gateway Midtrans...' : `Bayar Sekarang: ${formatIDR(amountToPay)}`}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs sticky top-24">
              <h3 className="text-lg font-heading font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
                Ringkasan Pesanan
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-xs text-neutral-500 block">Paket Rute</span>
                  <span className="font-bold text-base text-neutral-900">{quote.product_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span>{quote.service_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-primary-600" />
                    <span>{quote.num_units} Unit Jeep</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span>{quote.num_passengers} Orang</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="truncate">{quote.pickup_zone?.name || 'Banyuwangi Kota'}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Finansial */}
              <div className="p-4 rounded-2xl bg-sand-50 border border-neutral-200 text-xs space-y-2 mb-6">
                <span className="font-bold text-neutral-800 block mb-2">Rincian Tagihan:</span>
                {quote.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className={item.amount < 0 ? 'text-emerald-700 font-semibold' : 'font-medium'}>
                      {item.amount < 0 ? `- ${formatIDR(Math.abs(item.amount))}` : formatIDR(item.amount)}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
                  <span>Total Harga</span>
                  <span>{formatIDR(quote.total_amount)}</span>
                </div>
              </div>

              {/* Tagihan Saat Ini */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-amber-900">
                    Jumlah Tagihan Saat Ini ({paymentChoice === 'dp' ? 'DP' : 'Lunas'}):
                  </span>
                  <span className="text-lg font-bold text-amber-900 font-heading">
                    {formatIDR(amountToPay)}
                  </span>
                </div>
                {paymentChoice === 'dp' && (
                  <div className="flex justify-between text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                    <span>Sisa dibayarkan saat hari H:</span>
                    <span className="font-semibold">{formatIDR(remainingAmount)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 text-[11px] text-neutral-500 text-center">
                🛡️ Transaksi aman dengan enkripsi SSL & verifikasi Midtrans Snap Sandbox.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sand-50">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
