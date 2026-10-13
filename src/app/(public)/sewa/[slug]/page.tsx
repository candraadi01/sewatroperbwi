import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Mountain,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Compass,
} from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { getProductBySlug, getPickupZones } from '@/lib/services/catalog';
import { BookingWidget } from './BookingWidget';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const pickupZones = await getPickupZones();

  return (
    <div className="min-h-screen bg-sand-50 py-8 md:py-12">
      <div className="container-custom">
        {/* Navigation / Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-700 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>
        </div>

        {/* Hero Section Banner */}
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs mb-8 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="info" className="bg-primary-50 text-primary-800 border-primary-200">
              {product.service_type === 'paket_rute'
                ? 'Paket Rute Wisata'
                : product.service_type === 'harian_sopir'
                ? 'Sewa Harian + Sopir'
                : 'Sewa Lepas Kunci'}
            </Badge>
            {product.is_sample_data && (
              <Badge variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                Tarif Contoh (Belum Disetujui Owner)
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-neutral-900 tracking-tight">
            {product.name}
          </h1>
          <p className="text-neutral-600 text-lg md:text-xl mt-3 max-w-3xl leading-relaxed">
            {product.short_description}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 block">Durasi Trip</span>
                <span className="font-semibold text-neutral-800 text-sm md:text-base">
                  {Math.round(product.duration_minutes / 60)} Jam
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 block">Kapasitas Jeep</span>
                <span className="font-semibold text-neutral-800 text-sm md:text-base">
                  Maks {product.passenger_capacity} Orang
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 block">Pengemudi</span>
                <span className="font-semibold text-neutral-800 text-sm md:text-base">
                  {product.driver_included ? 'Termasuk Sopir' : 'Lepas Kunci'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-neutral-500 block">Area Titik Jemput</span>
                <span className="font-semibold text-neutral-800 text-sm md:text-base truncate max-w-[150px] block">
                  Banyuwangi Kota
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Detail vs Booking Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-7 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs">
              <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Compass className="w-6 h-6 text-primary-600" />
                Deskripsi & Rute Perjalanan
              </h2>
              <div className="prose text-neutral-700 text-base leading-relaxed space-y-4">
                <p>{product.description}</p>
                {product.start_point && (
                  <div className="p-4 rounded-2xl bg-sand-50 border border-neutral-200 text-sm space-y-2">
                    <div>
                      <span className="font-semibold text-neutral-800">Titik Keberangkatan:</span>{' '}
                      {product.start_point}
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-800">Titik Akhir:</span>{' '}
                      {product.end_point}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fasilitas Termasuk */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs">
                <h3 className="text-lg font-heading font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Fasilitas Termasuk
                </h3>
                <ul className="space-y-3">
                  {product.included_facilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fasilitas Tidak Termasuk */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs">
                <h3 className="text-lg font-heading font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-neutral-400" />
                  Tidak Termasuk
                </h3>
                <ul className="space-y-3">
                  {product.excluded_facilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-600">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Terms and Cancellation Notice */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs">
              <h3 className="text-lg font-heading font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Ketentuan & Syarat Layanan
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                {product.terms_content}
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Pemberitahuan Transparansi:</strong> Syarat pembatalan, pengembalian dana, dan batas
                  waktu konfirmasi armada akan disesuaikan dengan SOP final pemilik usaha saat peluncuran resmi.
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Interactive Booking Widget */}
          <div className="lg:col-span-5">
            <BookingWidget product={product} pickupZones={pickupZones} />
          </div>
        </div>
      </div>
    </div>
  );
}
