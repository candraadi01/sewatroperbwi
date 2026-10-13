import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Truck,
  Users,
  MapPin,
  CreditCard,
  Phone,
  ArrowRight,
  AlertTriangle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { getBookingById } from '@/lib/services/booking';
import { PaymentSimulator } from './PaymentSimulator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    return (
      <div className="min-h-screen bg-sand-50 py-16">
        <div className="container-custom max-w-lg mx-auto text-center bg-white p-8 rounded-3xl border border-neutral-200">
          <Clock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Pesanan #{id} Sedang Diproses
          </h1>
          <p className="text-neutral-600 text-sm mb-6">
            Data pesanan Anda sedang disinkronisasi. Silakan periksa kembali beberapa saat lagi atau hubungi admin kami.
          </p>
          <Link href="/sewa">
            <Button className="w-full bg-primary-700 hover:bg-primary-800 text-white">
              Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.booking_status === 'confirmed';
  const isDpPaid = booking.payment_status === 'dp_paid';
  const isSettled = booking.payment_status === 'settlement';

  return (
    <div className="min-h-screen bg-sand-50 py-8 md:py-12">
      <div className="container-custom max-w-3xl">
        {/* Sandbox Test Simulator Bar */}
        {!isConfirmed && (
          <div className="mb-6">
            <PaymentSimulator bookingId={booking.id} />
          </div>
        )}

        {/* Main Status Header Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600">
            {isConfirmed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8 text-amber-600" />
            )}
          </div>

          <div className="flex justify-center gap-2 mb-2">
            <Badge
              variant={isConfirmed ? 'success' : 'warning'}
              className="text-xs uppercase px-3 py-1 font-semibold"
            >
              {isConfirmed
                ? isDpPaid
                  ? 'Deposit DP Terbayar (Terkonfirmasi)'
                  : 'Lunas (Terkonfirmasi)'
                : 'Menunggu Pembayaran'}
            </Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            {isConfirmed ? 'Pesanan Berhasil Dikonfirmasi!' : 'Menunggu Penyelesaian Pembayaran'}
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            ID Pemesanan: <span className="font-mono font-bold text-neutral-800">{booking.id}</span>
          </p>
        </div>

        {/* Detail Pemesanan Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs mb-6 space-y-6">
          <h2 className="text-lg font-heading font-bold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Receipt className="w-5 h-5 text-primary-600" />
            Rincian E-Tiket & Jadwal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-neutral-500 block">Paket Wisata</span>
              <span className="font-bold text-neutral-800 text-base">{booking.product_name}</span>
            </div>

            <div>
              <span className="text-xs text-neutral-500 block">Tanggal Trip</span>
              <span className="font-semibold text-neutral-800">{booking.service_date}</span>
            </div>

            <div>
              <span className="text-xs text-neutral-500 block">Jumlah Armada Jeep</span>
              <span className="font-semibold text-neutral-800">{booking.num_units} Unit Trooper 4x4</span>
            </div>

            <div>
              <span className="text-xs text-neutral-500 block">Peserta</span>
              <span className="font-semibold text-neutral-800">{booking.num_passengers} Orang</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs text-neutral-500 block">Titik Penjemputan</span>
              <span className="font-medium text-neutral-800">
                {booking.pickup_address || booking.pickup_zone_name || 'Area Banyuwangi Kota'}
              </span>
            </div>
          </div>

          {/* Kontak Pemesan */}
          <div className="pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700 block mb-2">Kontak Pemesan:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-600 bg-sand-50 p-3.5 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-500 block">Nama:</span>
                <span className="font-semibold text-neutral-800">{booking.contact_name}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">WhatsApp:</span>
                <span className="font-semibold text-neutral-800">{booking.contact_phone}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Email:</span>
                <span className="font-semibold text-neutral-800">{booking.contact_email}</span>
              </div>
            </div>
          </div>

          {/* Rincian Finansial & Sisa Pelunasan */}
          <div className="pt-4 border-t border-neutral-100">
            <span className="text-xs font-bold text-neutral-700 block mb-2">Rincian Finansial:</span>
            <div className="space-y-2 text-sm text-neutral-700 bg-sand-50 p-4 rounded-2xl border border-neutral-200">
              <div className="flex justify-between">
                <span>Total Biaya Paket:</span>
                <span className="font-bold">{formatIDR(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>
                  {booking.payment_choice === 'dp' ? 'Deposit (DP) Terbayar:' : 'Lunas Terbayar:'}
                </span>
                <span>{formatIDR(booking.amount_to_pay)}</span>
              </div>
              {booking.payment_choice === 'dp' && (
                <div className="flex justify-between text-amber-900 font-bold pt-2 border-t border-neutral-200">
                  <span>Sisa Pelunasan (Dibayar saat Hari H):</span>
                  <span>{formatIDR(booking.remaining_amount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informasi Langkah Berikutnya */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs mb-8">
          <h3 className="text-base font-heading font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary-600" />
            Langkah Selanjutnya:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
            <li>Simpan nomor pesanan <span className="font-mono font-semibold">{booking.id}</span> sebagai bukti booking Anda.</li>
            <li>Koordinator armada kami akan menghubungi Anda via WhatsApp H-1 sebelum keberangkatan untuk konfirmasi nama driver dan nomor plat Jeep Trooper.</li>
            <li>Driver akan standby di lokasi penjemputan sesuai jam yang disepakati.</li>
          </ol>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
            <Link
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Sewa Trooper BWI, saya ingin konfirmasi pesanan ID: ${booking.id}`)}`}
              target="_blank"
              className="flex-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-xs">
                <Phone className="w-4 h-4" />
                Hubungi Admin via WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
