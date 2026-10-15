import Link from "next/link";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { OrderActions } from "@/components/admin/OrderActions";
export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const bookings = await getAllBookings();
  const rows = bookings.filter(
    (b) =>
      (!q.status || b.booking_status === q.status) &&
      (!q.q ||
        `${b.id} ${b.contact_name} ${b.contact_phone}`
          .toLowerCase()
          .includes(q.q.toLowerCase())),
  );
  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">Operasional penyewaan</p>
        <h1 className="heading-1 mt-3">Pesanan</h1>
        <p className="mt-3 text-neutral-500">
          Menampilkan hingga 100 pesanan terbaru. Cari penyedia di luar sistem,
          lalu konfirmasikan kendaraan di sini.
        </p>
      </header>
      <form className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="admin-field">
          Cari kode, nama, atau telepon
          <input
            type="search"
            name="q"
            defaultValue={q.q || ""}
            maxLength={100}
          />
        </label>
        <label className="admin-field">
          Status
          <select name="status" defaultValue={q.status || ""}>
            <option value="">Semua status</option>
            {Object.entries(bookingStatus).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button className="action-link">Cari</button>
      </form>
      <div className="space-y-5">
        {rows.map((b) => (
          <article key={b.id} className="admin-panel">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-neutral-500">{b.id}</p>
                <h2 className="heading-3 mt-2">{b.product_name}</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  {b.service_date} · {b.start_time?.slice(0, 5)} WIB ·{" "}
                  {b.num_units} unit · {b.num_passengers} peserta
                </p>
              </div>
              <span className="text-sm font-semibold text-primary-700">
                {bookingStatus[b.booking_status] || b.booking_status}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-7 mt-6">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">{b.contact_name}</p>
                <p>
                  {b.contact_phone} · {b.contact_email}
                </p>
                <p className="text-neutral-600">
                  {b.pickup_address || "Titik awal layanan"}
                </p>
                <p>
                  Total: <strong>{formatIDR(b.total_amount)}</strong>
                </p>
                <p>
                  Terverifikasi: {formatIDR(b.amount_paid)} · Sisa:{" "}
                  {formatIDR(b.remaining_amount)}
                </p>
                <Link
                  className="inline-block pt-2 text-primary-700 underline"
                  href={"/pesanan/" + b.id}
                >
                  Lihat rincian buyer
                </Link>
              </div>
              <OrderActions id={b.database_id} status={b.booking_status} />
            </div>
          </article>
        ))}
        {!rows.length && (
          <div className="admin-panel text-neutral-500">
            Tidak ada pesanan yang sesuai.
          </div>
        )}
      </div>
    </div>
  );
}
