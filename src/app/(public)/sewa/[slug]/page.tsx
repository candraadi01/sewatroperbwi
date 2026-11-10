import { getBookingDates } from "@/lib/utils/date";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getPickupZones } from "@/lib/services/catalog";
import { BookingWidget } from "./BookingWidget";
import { serviceLabels } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import {
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Star,
  Check,
  Sparkles,
  Info,
} from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";

export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const queryDate = typeof sp.date === "string" ? sp.date : "";
  const [p, zones] = await Promise.all([
    getProductBySlug(slug),
    getPickupZones(),
  ]);
  if (!p) notFound();
  const dates = getBookingDates(p.min_booking_hours);
  const initialDate =
    queryDate && queryDate >= dates.today ? queryDate : dates.initialDate;

  const durationHours = Math.round(p.duration_minutes / 60);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 md:pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
        <div className="container-app py-3 flex items-center justify-between gap-4">
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#327691] hover:text-[#263b46] bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>Semua Paket</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link href="/" className="hover:text-slate-800 transition">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/sewa" className="hover:text-slate-800 transition">
              Katalog Sewa
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px] md:max-w-xs">
              {p.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-app pt-6 md:pt-8">
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 items-start">
          {/* Sisi Kiri: Konten Utama Produk */}
          <article className="space-y-6 sm:space-y-8">
            {/* Header Produk & Label */}
            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#e9f3f7] text-[#2c6881] border border-[#ccd8de]">
                  <Sparkles size={12} className="text-[#327691]" />
                  {serviceLabels[p.service_type] || "Paket Wisata Jeep"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>4.9 / 5.0 (120+ Trip)</span>
                </span>
                {p.is_best_seller && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    Best Seller
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {p.name}
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {p.short_description}
              </p>

              {/* Titik Destinasi */}
              {p.destinations && p.destinations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                    <MapPin size={13} className="text-[#327691]" /> Rute Destinasi:
                  </span>
                  {p.destinations.map((dest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/80"
                    >
                      <MapPin size={11} className="text-[#327691]" />
                      {dest}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Galeri Foto Mobil Jeep Trooper HD & Destinasi */}
            <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/90 shadow-xs">
              <ProductGallery
                images={
                  p.images && p.images.length > 0
                    ? p.images
                    : ["/images/landing/hero-adventure-trooper.jpg"]
                }
                productName={p.name}
              />
            </div>

            {/* 4 Kartu Spesifikasi Cepat */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Clock size={15} className="text-[#327691]" />
                  <span>Durasi</span>
                </div>
                <p className="mt-1.5 text-sm sm:text-base font-extrabold text-slate-900">
                  {durationHours} Jam
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Full Service</span>
              </div>

              <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Users size={15} className="text-[#327691]" />
                  <span>Kapasitas</span>
                </div>
                <p className="mt-1.5 text-sm sm:text-base font-extrabold text-slate-900">
                  Max {p.passenger_capacity} Orang
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Per 1 unit Jeep</span>
              </div>

              <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={15} className="text-[#327691]" />
                  <span>Layanan</span>
                </div>
                <p className="mt-1.5 text-sm sm:text-base font-extrabold text-slate-900">
                  {p.driver_included ? "Driver & BBM" : "Lepas Kunci"}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Termasuk Driver</span>
              </div>

              <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={15} className="text-[#327691]" />
                  <span>Armada</span>
                </div>
                <p className="mt-1.5 text-sm sm:text-base font-extrabold text-slate-900">
                  Trooper 4x4
                </p>
                <span className="text-[11px] text-emerald-600 font-bold">Kondisi Prima</span>
              </div>
            </div>

            {/* Tentang Layanan / Deskripsi Detail */}
            <section className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Info size={18} className="text-[#327691]" />
                Tentang Layanan Ini
              </h2>
              <div className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                {p.description}
              </div>
            </section>

            {/* Fasilitas: Termasuk & Di Luar Harga */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Fasilitas Termasuk */}
              <section className="bg-emerald-50/40 rounded-2xl p-5 sm:p-6 border border-emerald-200/70 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-emerald-200/70">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Fasilitas Termasuk
                  </h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {(p.included_facilities || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-black">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Di Luar Harga */}
              <section className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <XCircle size={18} className="text-slate-400" />
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Di Luar Harga
                  </h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {(p.excluded_facilities || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-500">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Ketentuan Layanan */}
            {p.terms_content && (
              <section className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#327691]" />
                  Ketentuan Layanan & Informasi Penting
                </h2>
                <div className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {p.terms_content}
                </div>
              </section>
            )}

            {/* Garansi Keamanan & Kepuasan Pelanggan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#263b46] to-[#1e293b] text-white flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#327691] flex items-center justify-center shrink-0 text-white shadow-md">
                <ShieldCheck size={24} />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h4 className="font-bold text-sm sm:text-base text-white">
                  Booking Aman & Terpercaya Tanpa Bayar di Muka
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Pengajuan sewa diajukan terlebih dahulu secara gratis. Admin kami akan memastikan ketersediaan armada Trooper prima sebelum pembayaran DP dibuka.
                </p>
              </div>
            </div>
          </article>

          {/* Sisi Kanan: Modern OTA Booking Card (Sticky) */}
          <BookingWidget
            product={p}
            pickupZones={zones}
            today={dates.today}
            initialDate={initialDate}
          />
        </div>
      </div>
    </div>
  );
}
