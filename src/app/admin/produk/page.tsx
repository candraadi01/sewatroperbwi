import Link from 'next/link';
import {
  Package,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit3,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { SAMPLE_PRODUCTS } from '@/lib/services/products-data';

export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            Katalog Produk & Tarif
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            Kelola paket rute wisata, sewa harian, kapasitas penumpang, dan status tarif owner.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-primary-700 text-white gap-1.5" disabled>
            <Plus className="w-4 h-4" />
            Tambah Paket (Segera)
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Status Persetujuan Tarif:</strong> Seluruh paket di bawah ini berstatus <em>Sample Data</em>{' '}
          (tarif contoh). Owner dapat meninjau dan mengubah tarif resmi sebelum status diubah menjadi <em>Approved</em>.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="p-4">Nama Paket / Produk</th>
                <th className="p-4">Tipe Layanan</th>
                <th className="p-4">Durasi & Kapasitas</th>
                <th className="p-4">Tarif Dasar</th>
                <th className="p-4">Status Tarif</th>
                <th className="p-4">Status Publikasi</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {SAMPLE_PRODUCTS.map((prod) => (
                <tr key={prod.id} className="hover:bg-neutral-50/60 transition">
                  <td className="p-4">
                    <div className="font-bold text-neutral-900">{prod.name}</div>
                    <div className="text-xs text-neutral-500 line-clamp-1">{prod.short_description}</div>
                  </td>
                  <td className="p-4 text-xs font-medium text-neutral-700 capitalize">
                    {prod.service_type.replace(/_/g, ' ')}
                  </td>
                  <td className="p-4 text-xs text-neutral-600">
                    <div>{Math.round(prod.duration_minutes / 60)} Jam Trip</div>
                    <div>Maks {prod.passenger_capacity} Penumpang</div>
                  </td>
                  <td className="p-4 font-bold text-neutral-900">
                    {prod.base_price && prod.base_price > 0 ? (
                      formatIDR(prod.base_price)
                    ) : (
                      <span className="text-neutral-400 font-normal">Belum Ditetapkan</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant="warning" className="text-[11px]">
                      Tarif Contoh
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={prod.status === 'published' ? 'success' : 'neutral'}
                      className="text-[11px]"
                    >
                      {prod.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/sewa/${prod.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Lihat Publik
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
