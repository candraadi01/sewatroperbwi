import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
import { getOwnBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
export default async function Orders() {
  await requireBuyer("/akun/pesanan");
  const orders = await getOwnBookings();
  return (
    <div className="container-app py-12 max-w-4xl">
      <p className="eyebrow">Akun pemesan</p>
      <h1 className="section-heading mt-3">Pesanan Saya</h1>
      <p className="mt-3 text-neutral-600">
        Menampilkan hingga 100 pesanan terbaru milik akunmu.
      </p>
      <div className="mt-8 space-y-4">
        {orders.map((b) => (
          <Link
            key={b.id}
            href={"/pesanan/" + b.id}
            className="admin-panel block hover:border-primary-600"
          >
            <p className="text-xs text-neutral-500">{b.id}</p>
            <div className="flex flex-wrap justify-between gap-3 mt-2">
              <h2 className="text-lg font-semibold">{b.product_name}</h2>
              <span className="font-semibold">{formatIDR(b.total_amount)}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {b.service_date} · {b.num_units} unit
            </p>
            <p className="mt-4 text-sm text-primary-700">
              {bookingStatus[b.booking_status] || b.booking_status} →
            </p>
          </Link>
        ))}
        {!orders.length && (
          <div className="admin-panel">
            <h2 className="font-semibold">Belum ada pesanan.</h2>
            <Link href="/sewa" className="action-link mt-4">
              Pilih layanan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
