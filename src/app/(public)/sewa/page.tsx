'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mountain,
  Clock,
  Users,
  Search,
  Filter,
  ArrowRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES } from '@/lib/services/products-data';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'duration_asc'>('popular');

  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = SAMPLE_CATEGORIES.find((c) => c.slug === selectedCategory);
        if (cat && product.category_id !== cat.id) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.short_description.toLowerCase().includes(q);
        const matchesRoute = product.route_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesRoute) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.base_price || 0) - (b.base_price || 0);
      if (sortBy === 'price_desc') return (b.base_price || 0) - (a.base_price || 0);
      if (sortBy === 'duration_asc') return a.duration_minutes - b.duration_minutes;
      return a.sort_order - b.sort_order;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-sand-50 py-10">
      <div className="container-custom">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
            <Link href="/" className="hover:text-primary-700 transition">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Katalog Sewa</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900">
                Pilihan Paket & Sewa Jeep Trooper
              </h1>
              <p className="text-neutral-600 mt-2 max-w-2xl">
                Jelajahi keindahan alam Banyuwangi dengan armada tangguh Toyota / Isuzu Trooper 4x4.
                Pilih paket rute wisata populer atau sewa harian fleksibel.
              </p>
            </div>
            <div className="text-sm text-neutral-500 bg-white px-3.5 py-2 rounded-xl border border-neutral-200 shadow-xs self-start md:self-auto">
              Menampilkan <span className="font-semibold text-neutral-800">{filteredProducts.length}</span> pilihan
            </div>
          </div>
        </div>

        {/* Notice Disclaimer Banner */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Catatan Tarif & Ketentuan:</span>
            Tarif pada paket rute di bawah ini merupakan <strong>data contoh referensi awal</strong> dan belum
            disetujui secara resmi oleh pemilik usaha. Layanan harian lepas kunci berstatus draft untuk persiapan
            kebijakan operasional.
          </div>
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-neutral-200 shadow-xs mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-primary-700 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Semua Layanan
            </button>
            {SAMPLE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  selectedCategory === cat.slug
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari rute (Ijen, Baluran...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="popular">Urutan Rekomendasi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="duration_asc">Durasi Tersingkat</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <Mountain className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-800">Tidak ada paket yang sesuai</h3>
            <p className="text-neutral-500 text-sm mt-1 max-w-md mx-auto">
              Silakan ubah kata kunci pencarian atau pilih kategori layanan lain di atas.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isDraft = product.status === 'draft' && (!product.base_price || product.base_price <= 0);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  {/* Card Header & Badges */}
                  <div className="p-6 pb-4 border-b border-neutral-100 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="info" className="text-xs bg-primary-50 text-primary-800 border-primary-200">
                        {product.service_type === 'paket_rute'
                          ? 'Paket Rute'
                          : product.service_type === 'harian_sopir'
                          ? 'Harian + Sopir'
                          : 'Lepas Kunci'}
                      </Badge>
                      {product.is_sample_data && (
                        <Badge variant="warning" className="text-[11px] bg-amber-50 text-amber-800 border-amber-200">
                          Harga Contoh
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-xl font-heading font-bold text-neutral-900 group-hover:text-primary-700 transition">
                      <Link href={`/sewa/${product.slug}`}>{product.name}</Link>
                    </h2>
                    <p className="text-neutral-600 text-sm mt-2 line-clamp-2">{product.short_description}</p>

                    {/* Features & Specs */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary-600" />
                        <span>{Math.round(product.duration_minutes / 60)} Jam Trip</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary-600" />
                        <span>Maks {product.passenger_capacity} Orang</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-primary-600" />
                        <span>{product.driver_included ? 'Termasuk Sopir' : 'Tanpa Sopir'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                        <span>Trooper 4x4 Prima</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Pricing & Action */}
                  <div className="p-6 pt-4 bg-sand-50/60 mt-auto flex items-center justify-between border-t border-neutral-100">
                    <div>
                      {isDraft ? (
                        <div>
                          <span className="text-xs text-amber-700 font-medium block">Menunggu Tarif Owner</span>
                          <span className="text-sm font-semibold text-neutral-500">Belum Dibuka</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-neutral-500 block">Mulai dari</span>
                          <span className="text-xl font-bold font-heading text-neutral-900">
                            {formatIDR(product.base_price || 0)}
                          </span>
                          <span className="text-[11px] text-neutral-500 ml-1">/ unit</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {isDraft ? (
                        <Button variant="outline" size="sm" disabled className="opacity-60 text-xs">
                          Segera Hadir
                        </Button>
                      ) : (
                        <Link href={`/sewa/${product.slug}`}>
                          <Button size="sm" className="gap-1.5 bg-primary-700 hover:bg-primary-800 text-white shadow-xs">
                            Pesan
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-sand-50">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
