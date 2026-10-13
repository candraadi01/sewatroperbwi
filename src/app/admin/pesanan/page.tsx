import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { getAllBookings } from '@/lib/services/booking';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const bookings = await getAllBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            Manajemen Pesanan
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            Pantau dan kelola seluruh transaksi penyewaan Jeep Trooper Banyuwangi.
          </p>
        </div>
        <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-xs self-start">
          Total Pesanan: <span className="font-bold">{bookings.length}</span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-neutral-800">Belum Ada Pesanan Masuk</h2>
          <p className="text-neutral-500 text-sm mt-1 max-w-md mx-auto">
            Transaksi yang dilakukan melalui halaman katalog publik dan checkout akan tercatat di sini secara real-time.
          </p>
          <Link href="/sewa" className="inline-block mt-4">
            <Button size="sm" variant="outline">
              Buka Katalog & Coba Pesan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="p-4">ID Pesanan</th>
                  <th className="p-4">Pemesan</th>
                  <th className="p-4">Paket & Tanggal</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status Bayar</th>
                  <th className="p-4">Status Pesanan</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {bookings.map((booking) => {
                  const isConfirmed = booking.booking_status === 'confirmed';

                  return (
                    <tr key={booking.id} className="hover:bg-neutral-50/60 transition">
                      <td className="p-4 font-mono font-bold text-neutral-900 text-xs">
                        {booking.id}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{booking.contact_name}</div>
                        <div className="text-xs text-neutral-500">{booking.contact_phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{booking.product_name}</div>
                        <div className="text-xs text-neutral-500">{booking.service_date}</div>
                      </td>
                      <td className="p-4 text-xs text-neutral-700">
                        {booking.num_units} Unit ({booking.num_passengers} org)
                      </td>
                      <td className="p-4 font-semibold text-neutral-900">
                        {formatIDR(booking.total_amount)}
                        <span className="block text-[11px] text-neutral-500 font-normal">
                          {booking.payment_choice === 'dp' ? 'Opsi DP' : 'Opsi Lunas'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={isConfirmed ? 'success' : 'warning'}
                          className="text-xs"
                        >
                          {booking.payment_status === 'dp_paid'
                            ? 'DP Terbayar'
                            : booking.payment_status === 'settlement'
                            ? 'Lunas'
                            : 'Pending'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-neutral-700 capitalize">
                          {booking.booking_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/pesanan/${booking.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Lihat Tiket
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
