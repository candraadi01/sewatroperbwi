import {
  ShoppingBag,
  Clock,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Admin',
};

/**
 * Admin Dashboard.
 * Menampilkan ringkasan data dari database.
 * Saat ini placeholder — akan dihubungkan ke data nyata.
 * TODO: Replace with real Supabase queries
 */
export default async function AdminDashboardPage() {
  // Placeholder stats — akan diganti query database
  const stats = {
    pendingConfirmation: 0,
    upcomingTrips: 0,
    outstandingPayments: 0,
    pendingRefunds: 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-2 text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Ringkasan status pesanan, pembayaran, dan aktivitas terbaru.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="bordered" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Menunggu Konfirmasi
              </p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {stats.pendingConfirmation}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Booking dibayar, kendaraan belum dikonfirmasi
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Perjalanan Mendatang
              </p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {stats.upcomingTrips}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Dalam 7 hari ke depan
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <ShoppingBag size={20} className="text-primary-600" />
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Sisa Tagihan
              </p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {formatIDR(stats.outstandingPayments)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Total pelunasan tertunggak
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Refund Tertunda
              </p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {stats.pendingRefunds}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Perlu diproses admin
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900">Pesanan Terbaru</h2>
            <Link
              href="/admin/pesanan"
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="text-center py-8 text-neutral-400">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada pesanan</p>
            <p className="text-xs mt-1">
              Pesanan akan muncul setelah buyer melakukan booking.
            </p>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900">Aktivitas</h2>
            <Link
              href="/admin/riwayat"
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              Lihat Riwayat <ArrowRight size={14} />
            </Link>
          </div>
          <div className="text-center py-8 text-neutral-400">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada aktivitas</p>
            <p className="text-xs mt-1">
              Riwayat perubahan dan tindakan admin tercatat di sini.
            </p>
          </div>
        </Card>
      </div>

      {/* System status */}
      <Card variant="bordered" padding="md" className="mt-6">
        <h2 className="font-bold text-neutral-900 mb-4">Status Integrasi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'Supabase',
              status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not_configured',
            },
            {
              name: 'Midtrans',
              status: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'sandbox' : 'not_configured',
            },
            {
              name: 'Cloudinary',
              status: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured',
            },
            {
              name: 'Notifikasi Email',
              status: 'not_configured',
            },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
            >
              <span className="text-sm font-medium text-neutral-700">
                {integration.name}
              </span>
              <Badge
                variant={
                  integration.status === 'configured'
                    ? 'success'
                    : integration.status === 'sandbox'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {integration.status === 'configured'
                  ? 'Aktif'
                  : integration.status === 'sandbox'
                  ? 'Sandbox'
                  : 'Belum'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
